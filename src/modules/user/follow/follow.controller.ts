import { Body, Controller, Get, Post } from "@nestjs/common";
import { FollowService } from "./follow.service";
import { Auth } from "src/shared/decorators/auth.decorators";
import { RemoveFollowerDto, ToggleFollowRequestDto, UpdateFollowStatusDto } from "./dto/send-follow.dto";

@Controller('follow')
@Auth()
export class FollowController {
    constructor(
        private followService: FollowService
    ) { }

    @Post()
    toggleFollowRequest(
        @Body() body: ToggleFollowRequestDto
    ) { 
        return this.followService.toggleFollowRequest(body)
    }

    @Get('pendings')
    pendingRequests(){
        return this.followService.pendingRequests()
    }

    @Post("toggle")
    updateFollowStatus(
        @Body() body : UpdateFollowStatusDto
    ){
        return this.followService.updateFollowStatus(body)
    }

    @Post("remove-follower")
    removeFollower(
        @Body() body : RemoveFollowerDto
    ){
        return this.followService.removeFollower(body)
    }
}