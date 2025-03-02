import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { Response } from "express";
import { LoginDto, LoginWithFirebaseDto } from "./dto/login.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Post('register')
    async register(
        @Res() res: Response,
        @Body() body: RegisterDto
    ) {
        let result = await this.authService.register(body)
        res.cookie("authorization", result.token)

        res.json(result)
    }

    @Post('firebase')
    async loginWithFirebase(
        @Res() res: Response,
        @Body() body : LoginWithFirebaseDto
    ){
        let result = await this.authService.loginWithFirebase(body)
        res.cookie("authorization", result.token)

        res.json(result)
    }

    @Post("login")
    async login(
        @Res() res: Response,
        @Body() body: LoginDto
    ) {
        let result = await this.authService.login(body)
        res.cookie("authorization", result.token)

        res.json(result)
    }
}