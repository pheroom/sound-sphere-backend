import {Body, Controller, Get, Post} from '@nestjs/common';
import {ArtistsService} from "./artists.service";
import {CreateArtistDto} from "./dto/create-artist.dto";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Artist} from "./artists.model";

@Controller('artists')
export class ArtistsController {
    constructor(private readonly artistsService: ArtistsService) {}

    @ApiOperation({summary: 'Create a new artist'})
    @ApiResponse({status: 200, type: Artist})
    @Post()
    create(@Body() artistDto: CreateArtistDto) {
        return this.artistsService.createArtist(artistDto)
    }

    @ApiOperation({summary: 'Get all artists'})
    @ApiResponse({status: 200, type: [Artist]})
    @Get()
    getAll() {
        return this.artistsService.getAllArtists()
    }
}
