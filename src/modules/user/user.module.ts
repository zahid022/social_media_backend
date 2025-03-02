import { Global, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { FollowModule } from "./follow/follow.module";

@Global()
@Module({
    imports : [FollowModule],
    controllers : [UserController],
    providers : [UserService],
    exports : [UserService]
})
export class UserModule {}