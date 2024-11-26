import {ApiProperty} from "@nestjs/swagger";

export class CreateArtistDto {
    @ApiProperty({example: 'rileyparker'})
    readonly username: string;

    @ApiProperty({example: 'Riley Parker'})
    readonly name: string;

    @ApiProperty({example: 'password123'})
    readonly password: string;
}