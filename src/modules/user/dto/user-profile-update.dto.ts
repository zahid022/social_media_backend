import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, IsUUID, Length, MinLength } from "class-validator";

export class UserProfileUpdateDto {
    @Type()
    @IsString()
    @IsOptional()
    @Length(3, 20)
    fullName? : string = 'user userzade'

    @Type()
    @IsString()
    @IsOptional()
    @MinLength(4)
    bio? : string = 'hello'

    @Type()
    @IsUUID()
    @IsOptional()
    @IsString()
    imageId? : string;

    @Type()
    @IsBoolean()
    isPrivate? : boolean;
}