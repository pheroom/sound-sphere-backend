import {ApiProperty} from "@nestjs/swagger";
import {IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length, Min, MIN} from "class-validator";

export class TrackDto {
    @ApiProperty({example: 'So Good'})
    @IsString({message: 'Track title must be string'})
    @Length(1, 40, {message: 'Track title length must be between 1 and 40'})
    readonly name: string;

    @ApiProperty({example: 1})
    readonly albumId: number;
}
