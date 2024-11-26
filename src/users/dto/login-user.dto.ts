import {ApiProperty} from "@nestjs/swagger";

export class LoginUserDto {
    @ApiProperty({example: 'rileyparker'})
    readonly username: string;

    @ApiProperty({example: 'password123'})
    readonly password: string;
}