import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {LoginUserDto} from "../users/dto/login-user.dto";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {LoginArtistDto} from "../artists/dto/login-artist.dto";
import {CreateArtistDto} from "../artists/dto/create-artist.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


    @ApiOperation({summary: 'Login as user'})
    @ApiResponse({status: 200, type: String})
    @Post('/login')
    login(@Body() userDto: LoginUserDto) {
        return this.authService.login(userDto)
    }

    @ApiOperation({summary: 'Registration new user'})
    @ApiResponse({status: 200, type: String})
    @Post('/registration')
    registration(@Body() userDto: CreateUserDto) {
        return this.authService.registration(userDto)
    }

    @ApiOperation({summary: 'Login as artist'})
    @ApiResponse({status: 200, type: String})
    @Post('artists/login')
    artistLogin(@Body() artistDto: LoginArtistDto) {
        return this.authService.artistLogin(artistDto)
    }

    @ApiOperation({summary: 'Registration new artist'})
    @ApiResponse({status: 200, type: String})
    @Post('artists/registration')
    artistRegistration(@Body() artistDto: CreateArtistDto) {
        return this.authService.artistRegistration(artistDto)
    }
}
