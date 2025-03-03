import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile, Query
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumDto } from './dto/album.dto';
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {JwtArtistsAuthGuard} from "../auth/jwt-artists-auth.guard";
import {Album} from "./albums.model";
import {FileInterceptor} from "@nestjs/platform-express";
import {UpdateAlbumDto} from "./dto/update-album.dto";

@Controller('albums')
export class AlbumsController {
    constructor(private readonly albumService: AlbumsService) {}

    @ApiOperation({summary: 'Create a new album'})
    @ApiResponse({status: 200, type: Album})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(@Req() req, @Body() albumDto: AlbumDto, @UploadedFile() image) {
        return this.albumService.create(albumDto, +req.artist.id, image);
    }

    @ApiOperation({summary: 'Get all album by query'})
    @ApiResponse({status: 200, type: [Album]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('all')
    getAll(@Req() req, @Query('query') query: string, @Query('limit') limit: number, @Query('page') page: number) {
        return this.albumService.getAllAlbums(+req.user.id, limit, page, query);
    }

    @ApiOperation({summary: 'Get album with tracks by auth artist'})
    @ApiResponse({status: 200, type: Album})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Get('artist-with-tracks/:albumId')
    getArtistAlbumWithTracks(@Req() req, @Param('albumId') albumId: number) {
        return this.albumService.getAlbumWithTracksById(+req.artist.id, albumId);
    }

    @ApiOperation({summary: 'Get album with tracks'})
    @ApiResponse({status: 200, type: Album})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('with-tracks/:albumId')
    getAlbumWithTracks(@Req() req, @Param('albumId') albumId: number) {
        return this.albumService.getPublicAlbumWithTracksById(+req.user.id, albumId);
    }

    @ApiOperation({summary: 'Update album'})
    @ApiResponse({status: 200, type: Album})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Patch(':albumId')
    @UseInterceptors(FileInterceptor('image'))
    update(@Req() req, @Body() dto: UpdateAlbumDto, @Param('albumId') albumId: string, @UploadedFile() image){
        return this.albumService.updateAlbum(+req.artist.id, +albumId, dto, image)
    }

    @ApiOperation({summary: 'Delete album'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Delete(':albumId')
    remove(@Req() req, @Param('albumId') albumId: number) {
        return this.albumService.deleteAlbum(+req.artist.id, albumId);
    }

    @ApiOperation({summary: 'Add album artist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Post('artists/:artistId/:albumId')
    addTrackArtist(@Req() req, @Param('albumId') albumId: number, @Param('artistId') artistId: number) {
        return this.albumService.addAlbumArtist(+req.artist.id, albumId, artistId);
    }

    @ApiOperation({summary: 'Remove album artist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Delete('artists/:artistId/:albumId')
    removeTrackArtist(@Req() req, @Param('albumId') albumId: number, @Param('artistId') artistId: number) {
        return this.albumService.removeAlbumArtist(+req.artist.id, albumId, artistId);
    }
}
