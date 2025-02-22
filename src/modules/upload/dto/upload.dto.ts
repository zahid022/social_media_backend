import { ApiProperty } from "@nestjs/swagger";

export class UploadDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    image: string;
}