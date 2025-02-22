import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";

@Module({
    imports : [],
    controllers : [],
    providers : [JobsService]
})
export class JobsModule {}