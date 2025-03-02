import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth } from "src/shared/decorators/auth.decorators";
import { UserProfileUpdateDto } from "./dto/user-profile-update.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { FollowService } from "./follow/follow.service";

@Controller('user')
export class UserController {
    constructor(
        private userService : UserService,
        private followService : FollowService
    ){}

    @Get('profile')
    @Auth()
    getMyProfile(){
        return this.userService.getMyProfile()
    }

    @Get('profile/:id')
    @Auth()
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

    @Get(":id/followers")
    @Auth()
    userFollowers(
        @Param('id') id : number
    ){
        return  this.followService.userFollowers(id)
    }

    @Get(":id/followings")
    @Auth()
    userFollowings(
        @Param('id') id : number
    ){
        return  this.followService.userFollowings(id)
    }

}