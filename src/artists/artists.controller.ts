import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {ArtistsService} from "./artists.service";
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Artist} from "./artists.model";
import {FileInterceptor} from "@nestjs/platform-express";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {JwtArtistsAuthGuard} from "../auth/jwt-artists-auth.guard";
import {UpdateArtistDto} from "./dto/update-artist.dto";
import {Album} from "../albums/albums.model";

@Controller('artists')
export class ArtistsController {
    constructor(private readonly artistsService: ArtistsService) {}

    @ApiOperation({summary: 'Get all artists by query'})
    @ApiResponse({status: 200, type: [Artist]})
    @Get('all')
    getAll(@Query('query') query: string, @Query('limit') limit: number, @Query('page') page: number) {
        return this.artistsService.getAllArtists(limit, page, query)
    }

    @ApiOperation({summary: 'Get artist profile by username'})
    @ApiResponse({status: 200, type: Artist})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('get-one-by-username/:username')
    getArtistByUsername(@Param('username') username: string) {
        return this.artistsService.getArtistByUsername(username)
    }

    @ApiOperation({summary: 'Update artist profile'})
    @ApiResponse({status: 200, type: Artist})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Patch()
    @UseInterceptors(FileInterceptor('image'))
    update(@Req() req, @Body() dto: UpdateArtistDto, @UploadedFile() image){
        return this.artistsService.updateArtist(req.artist, dto, image)
    }

    @ApiOperation({summary: 'Get albums by artist id'})
    @ApiResponse({status: 200, type: [Album]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('albums/:artistId')
    getAlbumsByArtistId(@Param('artistId') artistId: string, @Query('limit') limit: number, @Query('page') page: number) {
        return this.artistsService.getAlbumsByArtistId(+artistId, limit, page);
    }

    @ApiOperation({summary: 'Get albums created by auth artist'})
    @ApiResponse({status: 200, type: [Album]})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Get('created-albums')
    getArtistAlbums(@Req() req, @Query('limit') limit: number, @Query('page') page: number) {
        return this.artistsService.getAlbumsByArtistId(+req.artist.id, limit, page);
    }
}
