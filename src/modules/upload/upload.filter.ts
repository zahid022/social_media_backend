import { BadRequestException } from "@nestjs/common"
import { extname } from "path"
import { UPLOAD_IMAGE_ALLOWED_MIME_TYPES, UPLOAD_IMAGE_ALLOWED_TYPES } from "src/shared/constants/upload.constant"

export const imageFileFilter = (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void,) => {
    let ext = extname(file.originalname).slice(1)

    const checkMimeType = UPLOAD_IMAGE_ALLOWED_MIME_TYPES.includes(file.mimetype)
    const checkFileType = UPLOAD_IMAGE_ALLOWED_TYPES.includes(ext)

    if(!checkFileType || !checkMimeType) return callback(new BadRequestException('Image type is not correct'), false)

    return callback(null, true)
}