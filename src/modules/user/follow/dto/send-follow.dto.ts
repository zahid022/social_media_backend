import { Type } from "class-transformer";
import { IsEnum, IsInt, IsPositive } from "class-validator";
import { UpdateStatus } from "src/shared/enums/Follow.types";

export class ToggleFollowRequestDto {
    @Type()
    @IsInt()
    @IsPositive()
    to : number;
}

export class UpdateFollowStatusDto {
    @Type()
    @IsInt()
    @IsPositive()
    from : number;

    @Type()
    @IsEnum(UpdateStatus)
    status : UpdateStatus
}

export class RemoveFollowerDto {
    @Type()
    @IsInt()
    @IsPositive()
    followerId : number;
}