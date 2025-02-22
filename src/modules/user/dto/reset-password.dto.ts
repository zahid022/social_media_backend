import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @Type()
    @IsString()
    @MinLength(8)
    currentPassword : string = '12345678';

    @Type()
    @IsString()
    @MinLength(8)
    resetPassword : string = '12345678';

    @Type()
    @IsString()
    @MinLength(8)
    newPassword : string = '12345679';
}