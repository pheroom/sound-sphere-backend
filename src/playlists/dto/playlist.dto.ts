import {ApiProperty} from "@nestjs/swagger";
import {IsString, Length} from "class-validator";

export class PlaylistDto {
    @ApiProperty({example: 'Playlist name'})
    @IsString({message: 'Playlist title must be string'})
    @Length(1, 50, {message: 'Playlist title length must be between 1 and 50'})
    readonly name: string;
}
