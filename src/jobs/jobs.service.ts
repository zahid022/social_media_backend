import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectDataSource } from "@nestjs/typeorm";
import { addHours } from "date-fns";
import { LoginAttemptsEntity } from "src/database/entities/login_attempts.entity";
import { DataSource, LessThan, Repository } from "typeorm";

@Injectable()
export class JobsService {
    private loginAttemptRepo: Repository<LoginAttemptsEntity>;
    private readonly logger = new Logger(JobsService.name);

    constructor(@InjectDataSource() private dataSource: DataSource) {
        this.loginAttemptRepo = this.dataSource.getRepository(LoginAttemptsEntity);
    }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async clearLoginAttempts() {
        let { affected } = await this.loginAttemptRepo.delete({
            createdAt: LessThan(addHours(new Date(), -1))
        })

        this.logger.log(`${affected} login attempts were deleted.`);
    }
}