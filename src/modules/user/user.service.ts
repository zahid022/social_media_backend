import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { UserProfileUpdateDto } from "./dto/user-profile-update.dto";
import { ProfileEntity } from "src/database/entities/profile.entity";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { compare } from "bcrypt";
import { FollowService } from "./follow/follow.service";

@Injectable()
export class UserService {
    private userRepo: Repository<UserEntity>
    private profileRepo: Repository<ProfileEntity>

    constructor(
        @Inject(forwardRef(() => FollowService))
        private followService : FollowService,
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService
    ) {
        this.userRepo = this.dataSource.getRepository(UserEntity)
        this.profileRepo = this.dataSource.getRepository(ProfileEntity)
    }

    async userById(userId: number) {
        let user = await this.userRepo.findOne({
            where: {
                id: userId
            }
        })

        if (!user) throw new NotFoundException("User is not found")

        return user
    }

    async getMyProfile(id?: number) {
        let userId = id || this.cls.get<UserEntity>("user").id

        let user = await this.userRepo.findOne({ where: { id: userId }, relations: ['profile', 'profile.profile_picture'] })

        if (!user) throw new NotFoundException("User is not found")

        return {
            ...user,
            password: undefined,
            email: undefined,
            phone: undefined
        }

    }

    async updateProfile(params: UserProfileUpdateDto) {
        let userId = this.cls.get<UserEntity>('user').id

        if (typeof params.isPrivate === 'boolean') {
            await this.userRepo.update(
                { id: userId },
                { isPrivate: params.isPrivate },
            );

            if(params.isPrivate === false){
                await this.followService.acceptPendingRequests()
            }

            delete params.isPrivate;

        }

        if (Object.keys(params).length > 0) {
            await this.profileRepo.update({ userId: userId }, params);
        }

        return {
            message: "User is uppdated successfully"
        }

    }

    async resetPassword(params: ResetPasswordDto) {
        let user = this.cls.get<UserEntity>('user')

        if (params.newPassword !== params.resetPassword) throw new BadRequestException("Reset password is not same")

        let checkPassword = await compare(params.currentPassword, user.password)

        if (!checkPassword) throw new BadRequestException("Current password is wrong")

        user.password = params.newPassword

        await user.save()

        return {
            message: "Password is updated successfully"
        }
    }

    async incrementCount(userId: number, type: 'following' | 'follower' | 'postCount', value: number) {
        return this.profileRepo.increment({ userId }, type, value)
    }
}