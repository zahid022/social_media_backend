import { Type } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class ForgetPasswordRequestDto {
    @Type()
    @IsString()
    @MinLength(3)
    username : string;

    @Type()
    @IsEmail()
    email : string;

    @Type()
    @IsString()
    callbackURL : string = 'http://localhost:3000/forget-password.html';
}

export class ConfirmForgetPasswordDto {
    @Type()
    @IsString()
    token : string;

    @Type()
    @IsString()
    @MinLength(8)
    newPassword : string;

    @Type()
    @IsString()
    @MinLength(8)
    repeatPassword : string;
}