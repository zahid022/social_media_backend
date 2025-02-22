import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Auth } from 'src/shared/decorators/auth.decorators';
import { imageFileFilter } from './upload.filter';
import { UPLOAD_IMAGE_MAX_SIZE } from 'src/shared/constants/upload.constant';
import { UploadDto } from './dto/upload.dto';
import { UploadService } from './upload.service';

@Controller("upload")
@Auth()
export class UploadController { 

    constructor(
        private uploadService : UploadService
    ){}

    @Post()
    @UseInterceptors(
        FileInterceptor('image', {
            storage : memoryStorage(),
            fileFilter : imageFileFilter,
            limits : {
                fileSize : UPLOAD_IMAGE_MAX_SIZE
            }
        })
    )
    @ApiBody({type : UploadDto})
    @ApiConsumes('multipart/form-data')
    uploadImage(
        @UploadedFile() file : Express.Multer.File
    ){
        return this.uploadService.uploadImage(file)
    }

}
