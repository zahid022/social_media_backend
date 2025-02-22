import { Type } from "class-transformer";
import { IsString, MinLength } from "class-validator";

export class LoginDto {
    @Type()
    @IsString()
    @MinLength(3)
    username : string = 'user';

    @Type()
    @IsString()
    @MinLength(8)
    password : string = '12345678'
}

export class LoginWithFirebaseDto {
    @Type()
    @IsString()
    token : string;
}