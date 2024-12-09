import {ApiProperty, OmitType, PartialType} from "@nestjs/swagger";
import {PlaylistDto} from "./playlist.dto";
import {IsOptional, IsString, Length} from "class-validator";

export class UpdatePlaylistDto extends PartialType(PlaylistDto){
    @ApiProperty({example: 'Playlist desc :)'})
    @IsOptional()
    @IsString({message: 'Description must be string'})
    @Length(0, 140, {message: 'Description length must be less then 140'})
    readonly description?: string;
}
