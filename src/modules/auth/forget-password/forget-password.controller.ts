import { Body, Controller, Post } from "@nestjs/common";
import { ForgetPasswordService } from "./forget-password.service";
import { ConfirmForgetPasswordDto, ForgetPasswordRequestDto } from "./dto/forget-password.dto";

@Controller('auth/forget-password')
export class ForgetPasswordController {
    constructor(
        private forgetPasswordService : ForgetPasswordService
    ){}

    @Post()
    forgetPasswordRequest(
        @Body() body : ForgetPasswordRequestDto
    ){
        return this.forgetPasswordService.forgetPasswordRequest(body)
    }

    @Post('/confirm')
    confirmForgetPassword(
        @Body() body : ConfirmForgetPasswordDto
    ){
        return this.forgetPasswordService.confirmForgetPassword(body)
    }
}