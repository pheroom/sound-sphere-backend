import {ApiProperty} from "@nestjs/swagger";
import {IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length, Min, MIN} from "class-validator";

export class TrackDto {
    @ApiProperty({example: 'So Good'})
    @IsString({message: 'Track title must be string'})
    @Length(1, 40, {message: 'Track title length must be between 1 and 40'})
    readonly name: string;

    @ApiProperty({example: 1})
    // @IsInt({message: 'Album Id must be integer'})
    // @Min(1, { message: 'Album Id must be at least 1' })
    readonly albumId: number;

    @ApiProperty({example: 1})
    // @IsInt({message: 'Track number must be integer'})
    // @Min(1, { message: 'Track number must be at least 1' })
    readonly number: number;
}
