import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { FollowEntity } from "src/database/entities/folllow.entity";
import { UserEntity } from "src/database/entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { RemoveFollowerDto, ToggleFollowRequestDto, UpdateFollowStatusDto } from "./dto/send-follow.dto";
import { UserService } from "../user.service";
import { FollowStatus, UpdateStatus } from "src/shared/enums/Follow.types";

@Injectable()
export class FollowService {

    private followRepo: Repository<FollowEntity>

    constructor(
        private cls: ClsService,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.followRepo = this.dataSource.getRepository(FollowEntity)
    }

    async toggleFollowRequest(params: ToggleFollowRequestDto) {
        let user = this.cls.get<UserEntity>("user")

        if (user.id === params.to) throw new BadRequestException("You cannot follow yourself.");

        let toUser = await this.userService.userById(params.to)

        if (!toUser) throw new NotFoundException("User is not found")

        let checkFollowRequest = await this.followRepo.findOne({
            where: {
                toId: toUser.id,
                fromId: user.id
            }
        })

        let increment = 1

        let isNew = false

        if (checkFollowRequest) {
            await this.followRepo.delete({ id: checkFollowRequest.id })

            increment = -1
        } else {
            checkFollowRequest = this.followRepo.create({
                fromId: user.id,
                toId: toUser.id,
                status: toUser.isPrivate ? FollowStatus.PENDING : FollowStatus.ACCEPTED
            })

            await checkFollowRequest.save()
            isNew = true
        }

        if (checkFollowRequest.status === FollowStatus.PENDING) {
            increment = 0
        }

        await this.updateFollowCount(user.id, params.to, increment)

        return {
            message: isNew ? 'Follow request has been sent' : "You've unfollowed",
        };

    }

    async userFollowers(userId: number) {
        let user = this.cls.get<UserEntity>('user')

        let currentUser = user.id === userId ? user : await this.userService.userById(userId)

        if(!currentUser) throw new NotFoundException("user is not found")

        if (currentUser.id !== user.id) {
            let access = await this.userAccessible(user.id, currentUser.id)
            if(!access) throw new ForbiddenException("You're not allowed to look at this user's follower list")
        }

        let listFollowers = await this.followRepo.find({
            where: {
                toId: currentUser.id,
                status: FollowStatus.ACCEPTED
            },
            relations : ['from', 'from.profile', 'from.profile.profile_picture'],
            select : {
                id : true,
                from : {
                    id : true,
                    username : true,
                    profile : {
                        id : true,
                        profile_picture : {
                            id : true,
                            url : true
                        }
                    }
                }
            }
        })

        return listFollowers
    }

    async userFollowings(userId : number){
        let user = this.cls.get<UserEntity>('user')

        let currentUser = user.id === userId ? user : await this.userService.userById(userId)

        if(!currentUser) throw new NotFoundException("user is not found")

        if (currentUser.id !== user.id) {
            let access = await this.userAccessible(user.id, currentUser.id)
            if(!access) throw new ForbiddenException("You're not allowed to look at this user's follower list")
        }

        let listFollowings = await this.followRepo.find({
            where: {
                fromId: currentUser.id,
                status: FollowStatus.ACCEPTED
            },
            relations : ['to', 'to.profile', 'to.profile.profile_picture'],
            select : {
                id : true,
                to : {
                    id : true,
                    username : true,
                    profile : {
                        id : true,
                        profile_picture : {
                            id : true,
                            url : true
                        }
                    }
                }
            }
        })

        return listFollowings
    }

    async userAccessible(from: number, to: number) {
        if (from === to) return true
        let user = await this.userService.userById(to)

        if (!user) throw new NotFoundException("User is not found")

        if (!user.isPrivate) return true

        let check = await this.followRepo.exists({
            where: {
                fromId: from,
                toId: to,
                status: FollowStatus.ACCEPTED
            }
        })

        return check
    }

    private updateFollowCount(fromId: number, toId: number, value: number) {
        let promises: any[] = []

        promises.push(this.userService.incrementCount(fromId, 'following', value))
        promises.push(this.userService.incrementCount(toId, 'follower', value))

        return Promise.all(promises)
    }

    async updateFollowStatus(params: UpdateFollowStatusDto) {
        let user = this.cls.get<UserEntity>("user")

        if(user.id === params.from){
            throw new BadRequestException()
        }

        let fromUser = await this.userService.userById(params.from)


        if (!fromUser) throw new NotFoundException("From user is not found")

        let checkRequest = await this.followRepo.findOne({
            where: {
                fromId: params.from,
                toId: user.id
            }
        })

        if (!checkRequest) {
            throw new NotFoundException("Follow request is not found")
        }

        if (checkRequest.status != FollowStatus.PENDING) {
            throw new BadRequestException('This follow request is already accepted');
        }

        if (params.status === UpdateStatus.REJECTED) {
            await this.followRepo.delete({ id: checkRequest.id })

            return {
                message: 'Follow request is rejected',
            };

        } else {
            await this.followRepo.update({ id: checkRequest.id }, { status: FollowStatus.ACCEPTED })

            await this.updateFollowCount(params.from, user.id, 1)

            return {
                message: 'Follow request is accepted',
            };

        }
    }

    async pendingRequests() {
        let user = this.cls.get<UserEntity>("user")

        let list = await this.followRepo.find({
            where: {
                toId: user.id,
                status: FollowStatus.PENDING
            },
            relations: ['from', 'from.profile', 'from.profile.profile_picture'],
            select: {
                id: true,
                status: true,
                createdAt: true,
                from: {
                    id: true,
                    username: true,
                    profile: {
                        id: true,
                        profile_picture: {
                            id: true,
                            url: true
                        },
                    }
                }
            },
            order: { createdAt: 'DESC' }
        })

        return list
    }

    async removeFollower(params: RemoveFollowerDto) {
        let user = this.cls.get<UserEntity>("user")

        let followerUser = await this.userService.userById(params.followerId)

        if (!followerUser) throw new NotFoundException("Follower user is not found")

        let follow = await this.followRepo.findOne({
            where: {
                fromId: params.followerId,
                toId: user.id,
                status: FollowStatus.ACCEPTED
            }
        })

        if (!follow) throw new NotFoundException("Follow request is not found")

        await this.followRepo.delete({ id: follow.id })

        await this.updateFollowCount(params.followerId, user.id, -1)

        return {
            message: `You've successfully get away from ${followerUser.username}`,
        }
    }

    async acceptPendingRequests() {
        let pendingRequests = await this.pendingRequests()

        let promises = pendingRequests.map((item) =>
            this.updateFollowStatus({
                from: item.fromId,
                status: UpdateStatus.ACCEPTED
            })
        )

        return await Promise.all(promises)
    }
}