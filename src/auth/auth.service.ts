import {HttpException, HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {LoginUserDto} from "../users/dto/login-user.dto";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs'
import {LoginArtistDto} from "../artists/dto/login-artist.dto";
import {CreateArtistDto} from "../artists/dto/create-artist.dto";
import {ArtistsService} from "../artists/artists.service";
import {Artist} from "../artists/artists.model";
import {User} from "../users/users.model";

@Injectable()
export class AuthService {
    constructor(private userService: UsersService,
                private artistsService: ArtistsService,
                private jwtService: JwtService) {}

    async login(userDto: LoginUserDto) {
        const user = await this.validateUser(userDto)
        return this.generateToken(user)
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.userService.getUserByUsername(userDto.username);
        if (candidate) {
            throw new HttpException("User with this username already exists", HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(userDto.password, 6);
        const user = await this.userService.createUser({...userDto, password: hashPassword});
        return this.generateToken(user)
    }

    private async generateToken(user: {id: number, username: string}) {
        const who = user instanceof User ? 'user' : 'artist';
        const payload = {username: user.username, id: user.id, who};
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async validateUser(userDto: LoginUserDto) {
        const user = await this.userService.getUserByUsername(userDto.username, true);
        if(!user){
            throw new HttpException("User not exist", HttpStatus.BAD_REQUEST);
        }
        const passwordIsEquals = await bcrypt.compare(userDto.password, user.password);
        if(!passwordIsEquals){
            throw new UnauthorizedException({message: "Password is incorrect"});
        }
        return user
    }

    async artistLogin(artistDto: LoginArtistDto) {
        const artist = await this.validateArtist(artistDto)
        return this.generateToken(artist)
    }

    async artistRegistration(artistDto: CreateArtistDto) {
        const candidate = await this.artistsService.getArtistByUsername(artistDto.username);
        if (candidate) {
            throw new HttpException("Artist with this username already exists", HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(artistDto.password, 6);
        const artist = await this.artistsService.createArtist({...artistDto, password: hashPassword});
        return this.generateToken(artist)
    }

    private async validateArtist(artistDto: LoginArtistDto) {
        const artist = await this.artistsService.getArtistByUsername(artistDto.username, true);
        if(!artist){
            throw new HttpException("Artist not exist", HttpStatus.BAD_REQUEST);
        }
        const passwordIsEquals = await bcrypt.compare(artistDto.password, artist.password);
        if(!passwordIsEquals){
            throw new UnauthorizedException({message: "Password is incorrect"});
        }
        return artist
    }
}
