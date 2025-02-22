import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ImageEntity } from 'src/database/entities/image.entity';
import { CloudinaryService } from 'src/libs/cloudinary/cloudinary.service';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UploadService {

    private imageRepo : Repository<ImageEntity>

    constructor(
        @InjectDataSource() private dataSource : DataSource,
        private cloudinaryService : CloudinaryService
    ){
        this.imageRepo = this.dataSource.getRepository(ImageEntity)
    }

    async uploadImage(file : Express.Multer.File){
        let {url} = await this.cloudinaryService.uploadFile(file)

        let newImage = this.imageRepo.create({
            url
        })

        await newImage.save()

        return newImage
    }
}
