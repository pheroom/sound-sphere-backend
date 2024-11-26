import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({example: 'rileyparker'})
    readonly username: string;

    @ApiProperty({example: 'Riley'})
    readonly firstname: string;

    @ApiProperty({example: 'Parker'})
    readonly lastname: string;

    @ApiProperty({example: 'password123'})
    readonly password: string;
}