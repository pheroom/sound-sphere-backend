import {Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {ArtistsService} from "./artists.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Artist} from "./artists.model";
import {FileInterceptor} from "@nestjs/platform-express";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {JwtArtistsAuthGuard} from "../artists-auth/jwt-artists-auth.guard";
import {UpdateArtistDto} from "./dto/update-artist.dto";

@Controller('artists')
export class ArtistsController {
    constructor(private readonly artistsService: ArtistsService) {}

    @ApiOperation({summary: 'Get all artists'})
    @ApiResponse({status: 200, type: [Artist]})
    @Get()
    getAll() {
        return this.artistsService.getAllArtists()
    }

    @ApiOperation({summary: 'Get artist profile by username'})
    @ApiResponse({status: 200, type: Artist})
    @UseGuards(JwtAuthGuard)
    @Get(':username')
    getArtistByUsername(@Param('username') username: string) {
        return this.artistsService.getArtistByUsername(username)
    }

    @ApiOperation({summary: 'Update artist profile'})
    @ApiResponse({status: 200, type: Artist})
    @UseGuards(JwtArtistsAuthGuard)
    @Patch()
    @UseInterceptors(FileInterceptor('image'))
    update(@Req() req, @Body() dto: UpdateArtistDto, @UploadedFile() image){
        return this.artistsService.updateArtist(req.artist, dto, image)
    }
}
