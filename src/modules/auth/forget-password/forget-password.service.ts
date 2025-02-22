import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ActivationEntity } from "src/database/entities/activation.entity";
import { DataSource, MoreThan, Repository } from "typeorm";
import { ConfirmForgetPasswordDto, ForgetPasswordRequestDto } from "./dto/forget-password.dto";
import { UserEntity } from "src/database/entities/user.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { v4 } from 'uuid'
import { addMinutes } from "date-fns";
import { AuthUtils } from "../auth.utils";

@Injectable()
export class ForgetPasswordService {

    private activationRepo: Repository<ActivationEntity>
    private userRepo: Repository<UserEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private mailer: MailerService,
        private authUtils : AuthUtils
    ) {
        this.activationRepo = this.dataSource.getRepository(ActivationEntity)
        this.userRepo = this.dataSource.getRepository(UserEntity)
    }

    async forgetPasswordRequest(params: ForgetPasswordRequestDto) {
        let user = await this.userRepo.findOne({
            where: {
                username: params.username,
                email: params.email
            }
        })

        if (!user) throw new NotFoundException("User is not found")

        let actiavtion = await this.activationRepo.findOne({
            where: {
                userId: user.id,
                expiredAt: MoreThan(new Date())
            }
        })

        if (!actiavtion) {
            actiavtion = this.activationRepo.create({
                userId: user.id,
                token: v4(),
                expiredAt: addMinutes(new Date(), 30)
            })

            await actiavtion.save()
        }

        if (actiavtion.attemtps > 3) {
            throw new HttpException(
                'Too many requests',
                HttpStatus.TOO_MANY_REQUESTS
            )
        }

        let resetLink = `${params.callbackURL}?token=${actiavtion.token}`

        try {
            await this.mailer.sendMail({
                to: user.email,
                subject: "Forget Password",
                template: 'forget-password',
                context: {
                    username: user.username,
                    resetLink
                }
            })

            actiavtion.attemtps += 1

            await actiavtion.save()

            return {
                message: "Mail has been successfully sent"
            }

        } catch (err) {
            throw new InternalServerErrorException('Due some reasons, we cannot send mail for forget-password',)
        }

    }

    async confirmForgetPassword(params: ConfirmForgetPasswordDto) {
        if (params.newPassword !== params.repeatPassword) throw new BadRequestException("Repeat password is wrong")

        let activation = await this.activationRepo.findOne({
            where: {
                token: params.token,
                expiredAt: MoreThan(new Date())
            }
        })

        if(!activation) throw new BadRequestException("Token is not valid")

        let user = await this.userRepo.findOne({
            where : {
                id : activation.userId
            }
        })

        if(!user) throw new NotFoundException("User is not found")

        user.password = params.newPassword

        await user.save()

        await this.activationRepo.delete({userId : user.id})

        let token = this.authUtils.generateToken(user.id)

        return {
            message : 'Password is successfully updated',
            token
        }
    }
}