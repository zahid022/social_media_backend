import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/user.entity";
import { DataSource, FindOptionsWhere, In, Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto, LoginWithFirebaseDto } from "./dto/login.dto";
import { compare } from "bcrypt";
import { LoginAttemptsEntity } from "src/database/entities/login_attempts.entity";
import { ClsService } from "nestjs-cls";
import { MailerService } from "@nestjs-modules/mailer";
import { AuthUtils } from "./auth.utils";
import { FirebaseService } from "src/libs/firebase/firebase.service";
import { UserProvider } from "src/shared/enums/User.types";
import { v4 } from "uuid";
import { ImageEntity } from "src/database/entities/image.entity";

@Injectable()
export class AuthService {

    private userRepo: Repository<UserEntity>
    private attempt: Repository<LoginAttemptsEntity>
    private imageRepo: Repository<ImageEntity>

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        private cls: ClsService,
        private mailer: MailerService,
        private authUtils: AuthUtils,
        private firebaseService: FirebaseService
    ) {
        this.userRepo = this.dataSource.getRepository(UserEntity)
        this.attempt = this.dataSource.getRepository(LoginAttemptsEntity)
        this.imageRepo = this.dataSource.getRepository(ImageEntity)
    }

    async register(params: RegisterDto) {
        if (!params.email && !params.phone) throw new BadRequestException("Phone or email are required")

        let username = params.username.toLowerCase()
        let phone = params.phone?.toLowerCase()
        let email = params.email?.toLowerCase()

        let where: FindOptionsWhere<UserEntity>[] = [{
            username
        }]

        if (phone) {
            where.push({
                phone
            })
        }

        if (email) {
            where.push({
                email
            })
        }

        let existUser = await this.userRepo.findOne({ where })

        if (existUser) {
            if (existUser.username === username) {
                throw new ConflictException({
                    message: 'Username is already exists',
                    suggestions: await this.usernameSuggestions(username)
                })
            } else if (existUser.email === email) {
                throw new ConflictException("Email is already exists")
            } else if (existUser.phone === phone) {
                throw new ConflictException("Phone is already exists")
            }
        }

        let user = this.userRepo.create({
            username,
            email,
            phone,
            password: params.password,
            profile: {
                fullName: params.fullName
            }
        })

        await user.save()
        let token = this.authUtils.generateToken(user.id)

        if (email) {
            await this.mailer.sendMail({
                to: email,
                subject: 'Welcome to Chat',
                template: 'welcome',
                context: {
                    username: user.username
                }
            })
        }

        return {
            user: {
                ...user,
                password: undefined
            },
            token
        }
    }

    async login(params: LoginDto) {
        let identifier = params.username

        let where: FindOptionsWhere<UserEntity>[] = [
            {
                username: identifier
            },
            {
                email: identifier
            },
            {
                phone: identifier
            }
        ]

        let user = await this.userRepo.findOne({ where })

        if (!user) throw new NotFoundException("Username or password are wrong")

        await this.checkAttempt(user.id)

        let checkPassword = await compare(params.password, user.password)

        if (!checkPassword) {
            await this.addAttempt(user.id)
            throw new NotFoundException("Username or password are wrong")
        }

        let token = this.authUtils.generateToken(user.id)

        await this.clearAttempt(user.id)

        return {
            user: {
                ...user,
                password: undefined
            },
            token
        }
    }

    async loginWithFirebase(params: LoginWithFirebaseDto) {
        let admin = this.firebaseService.firebaseApp

        let firebaseResult = await admin.auth().verifyIdToken(params.token)

        if (!firebaseResult.uid) throw new InternalServerErrorException('Something went wrong');

        let uid = firebaseResult.uid
        let email = firebaseResult.email

        let where: FindOptionsWhere<UserEntity>[] = [{
            providerId: uid,
            provider: UserProvider.FIREBASE
        }]

        if (email) {
            where.push({
                email
            })
        }

        let user = await this.userRepo.findOne({ where })

        if (!user) {
            let suggestions = await this.usernameSuggestions(firebaseResult.name);

            let image = firebaseResult.picture
                ? await this.imageRepo.save({
                    url: firebaseResult.picture,
                })
                : undefined;

            user = this.userRepo.create({
                username: suggestions[0],
                email,
                password: v4(),
                provider: UserProvider.FIREBASE,
                providerId: uid,
                profile: {
                    fullName: firebaseResult.name,
                    imageId : image?.id
                }
            })

            await user.save()
        }

        let token = this.authUtils.generateToken(user.id)

        return {
            user,
            token
        }
    }

    async checkAttempt(userId: number) {
        let ip = this.cls.get("ip")

        let attemptCount = await this.attempt.count({
            where: {
                ip,
                userId
            }
        })

        if (attemptCount > 5) throw new HttpException(
            'Please try again later',
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }

    async addAttempt(userId: number) {
        let ip = this.cls.get("ip")

        let newAttempt = this.attempt.create({
            userId,
            ip
        })

        await newAttempt.save()
    }

    async clearAttempt(userId: number) {
        let ip = this.cls.get("ip")

        await this.attempt.delete({ ip, userId })
    }

    async usernameSuggestions(username: string) {
        username = username
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/^-+|-+$/g, '');


        let usernames = Array.from({ length: 8 }).map(() => `${username}${Math.floor(Math.random() * 8999) * 1000}`)


        let dbUsernames = await this.userRepo.find({
            where: {
                username: In(usernames)
            },
            select: {
                id: true,
                username: true
            }
        })

        let existsUsername = dbUsernames.map(item => item.username)

        usernames = usernames.filter(item => !existsUsername.includes(item))

        return usernames.slice(0, 2)
    }
}