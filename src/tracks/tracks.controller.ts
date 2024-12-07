import {
    Body,
    Controller, Delete,
    Get,
    Param,
    Patch,
    Post, Query,
    Req,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {JwtArtistsAuthGuard} from "../auth/jwt-artists-auth.guard";
import {TracksService} from "./tracks.service";
import {Track} from "./tracks.model";
import {TrackDto} from "./dto/track.dto";
import {FileFieldsInterceptor, FileInterceptor} from "@nestjs/platform-express";
import {UpdateTrackDto} from "./dto/update-track.dto";

@Controller('tracks')
export class TracksController {
    constructor(private readonly tracksService: TracksService) {}

    @ApiOperation({summary: 'Create a new track'})
    @ApiResponse({status: 200, type: Track})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'picture', maxCount: 1},
        {name: 'audio', maxCount: 1}
    ]))
    create(@Req() req, @Body() trackDto: TrackDto, @UploadedFiles() files) {
        const {picture, audio} = files || {}
        return this.tracksService.create(+req.artist.id, trackDto, picture?.[0], audio?.[0]);
    }

    @ApiOperation({summary: 'Get all tracks by query'})
    @ApiResponse({status: 200, type: [Track]})
    @Get('all')
    getAll(@Query('query') query: string, @Query('limit') limit: number, @Query('page') page: number) {
        return this.tracksService.getAllTracks(limit, page, query);
    }

    @ApiOperation({summary: 'Update track'})
    @ApiResponse({status: 200, type: Track})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Patch(':trackId')
    @UseInterceptors(FileInterceptor('image'))
    update(@Req() req, @Body() dto: UpdateTrackDto, @Param('trackId') trackId: number, @UploadedFile() image){
        return this.tracksService.updateTrack(+req.artist.id, trackId, dto, image)
    }

    @ApiOperation({summary: 'Delete album'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Delete(':trackId')
    remove(@Req() req, @Param('trackId') trackId: number) {
        return this.tracksService.deleteTrack(+req.artist.id, trackId);
    }

    @ApiOperation({summary: 'Add track artist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Post('artists/:artistId/:trackId')
    addTrackArtist(@Req() req, @Param('trackId') trackId: number, @Param('artistId') artistId: number) {
        return this.tracksService.addTrackArtist(+req.artist.id, trackId, artistId);
    }

    @ApiOperation({summary: 'Remove track artist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtArtistsAuthGuard)
    @Delete('artists/:artistId/:trackId')
    removeTrackArtist(@Req() req, @Param('trackId') trackId: number, @Param('artistId') artistId: number) {
        return this.tracksService.removeTrackArtist(+req.artist.id, trackId, artistId);
    }
}
