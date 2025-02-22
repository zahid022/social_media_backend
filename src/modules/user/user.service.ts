import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/database/entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { UserProfileUpdateDto } from "./dto/user-profile-update.dto";
import { ProfileEntity } from "src/database/entities/profile.entity";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { compare } from "bcrypt";

@Injectable()
export class UserService {
    private userRepo: Repository<UserEntity>
    private profileRepo: Repository<ProfileEntity>

    constructor(
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

        let { affected } = await this.profileRepo.update({ userId }, params)

        if (!affected) throw new NotFoundException("user is not found")

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
}