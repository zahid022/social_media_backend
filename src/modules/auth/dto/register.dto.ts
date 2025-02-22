import { Type } from "class-transformer";
import { IsAlphanumeric, IsEmail, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";

export class RegisterDto {
    @Type()
    @IsString()
    @Length(3, 20)
    @IsAlphanumeric()
    username: string = 'user';

    @Type()
    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string = 'user@gmail.com';

    @Type()
    @IsString()
    @IsOptional()
    @Length(6, 15)
    @Matches(/^\+[\d]+$/, { message: 'phone number is not valid' })
    phone?: string = '+99412345678';

    @Type()
    @IsString()
    @MinLength(8)
    password : string = '12345678';

    @Type()
    @IsString()
    @Length(3, 20)
    fullName : string = 'user userov';
}