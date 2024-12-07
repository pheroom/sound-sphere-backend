import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import * as path from 'path'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid';

export enum FileTypes {
    AUDIO = 'audio',
    IMAGE = 'image',
}

@Injectable()
export class FilesService {
    async createFile(type: FileTypes, file): Promise<string> {
        try{
            const fileExtension = file.originalname.split('.').at(-1);
            const fileName = `${uuidv4()}.${fileExtension}`
            const filePath = path.resolve(__dirname, '..', 'static', type)
            if(!fs.existsSync(filePath)){
                fs.mkdirSync(filePath, {recursive: true})
            }
            fs.writeFileSync(path.join(filePath, fileName), file.buffer);
            return `${type}/${fileName}`
        } catch (e){
            throw new HttpException('Error occurred while writing the file', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
