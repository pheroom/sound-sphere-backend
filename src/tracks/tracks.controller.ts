
import {Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Album} from "../albums/albums.model";
import {JwtArtistsAuthGuard} from "../artists-auth/jwt-artists-auth.guard";
import {AlbumDto} from "../albums/dto/album.dto";
import {TracksService} from "./tracks.service";
import {Track} from "./tracks.model";
import {TrackDto} from "./dto/track.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {UpdateAlbumDto} from "../albums/dto/update-album.dto";
import {UpdateTrackDto} from "./dto/update-track.dto";

@Controller('tracks')
export class TracksController {
    constructor(private readonly tracksService: TracksService) {}

    @ApiOperation({summary: 'Create a new track'})
    @ApiResponse({status: 200, type: Track})
    @UseGuards(JwtArtistsAuthGuard)
    @Post()
    create(@Req() req, @Body() trackDto: TrackDto) {
        return this.tracksService.create(trackDto, +req.artist.id);
    }

    @ApiOperation({summary: 'Get all tracks'})
    @ApiResponse({status: 200, type: [Track]})
    @Get('all')
    getAll() {
        return this.tracksService.getAllTracks();
    }

    @ApiOperation({summary: 'Update track'})
    @ApiResponse({status: 200, type: Track})
    @UseGuards(JwtArtistsAuthGuard)
    @Patch(':trackId')
    @UseInterceptors(FileInterceptor('image'))
    update(@Req() req, @Body() dto: UpdateTrackDto, @Param('trackId') trackId: number, @UploadedFile() image){
        return this.tracksService.updateTrack(+req.artist.id, trackId, dto, image)
    }
}
