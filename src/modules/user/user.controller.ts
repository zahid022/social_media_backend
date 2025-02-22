import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth } from "src/shared/decorators/auth.decorators";
import { UserProfileUpdateDto } from "./dto/user-profile-update.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller('user')
export class UserController {
    constructor(
        private userService : UserService
    ){}

    @Get('profile')
    @Auth()
    getMyProfile(){
        return this.userService.getMyProfile()
    }

    @Get('profile/:id')
    getProfile(
        @Param('id') id : number
    ){
        return this.userService.getMyProfile(id)
    }

    @Post("profile")
    @Auth()
    updateProfile(
        @Body() body : UserProfileUpdateDto
    ){
        return this.userService.updateProfile(body)
    }

    @Post('reset-password')
    @Auth()
    resetPassword(
        @Body() body : ResetPasswordDto
    ){
        return this.userService.resetPassword(body)
    }

}