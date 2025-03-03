import {
    Body,
    Controller,
    Delete,
    Get, Param, Patch,
    Post,
    Query,
    Req, UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {FileFieldsInterceptor, FileInterceptor} from "@nestjs/platform-express";
import {PlaylistsService} from "./playlists.service";
import {PlaylistDto} from "./dto/playlist.dto";
import {Playlist} from "./playlist.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UpdatePlaylistDto} from "./dto/update-playlist.dto";

@Controller('playlists')
export class PlaylistsController {
    constructor(private readonly playlistsService: PlaylistsService) {}

    @ApiOperation({summary: 'Create a new playlist'})
    @ApiResponse({status: 200, type: Playlist})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        {name: 'image', maxCount: 1},
    ]))
    create(@Req() req, @Body() playlistDto: PlaylistDto, @UploadedFiles() files) {
        const {image} = files || {}
        return this.playlistsService.create(+req.user.id, playlistDto, image?.[0]);
    }

    @ApiOperation({summary: 'Get all playlists by query'})
    @ApiResponse({status: 200, type: [Playlist]})
    @Get('all')
    getAll(@Query('query') query: string, @Query('limit') limit: number, @Query('page') page: number) {
        return this.playlistsService.getAllPlaylists(limit, page, query);
    }

    @ApiOperation({summary: 'Get playlist with tracks'})
    @ApiResponse({status: 200, type: Playlist})
    @Get('with-tracks/:playlistId')
    getPlaylistWithTracks(@Req() req, @Param('playlistId') playlistId: number) {
        return this.playlistsService.getPlaylistWithTracksById(+req?.user?.id, playlistId);
    }

    @ApiOperation({summary: 'Remove playlist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete(':playlistId')
    removePlaylist(@Req() req, @Param('playlistId') playlistId: number) {
        return this.playlistsService.removePlaylistById(+req.user.id, playlistId);
    }

    @ApiOperation({summary: 'Update playlist'})
    @ApiResponse({status: 200, type: Playlist})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':playlistId')
    @UseInterceptors(FileInterceptor('image'))
    update(@Req() req, @Body() dto: UpdatePlaylistDto, @Param('playlistId') playlistId: number, @UploadedFile() image){
        return this.playlistsService.updatePlaylist(+req.user.id, playlistId, dto, image)
    }

    @ApiOperation({summary: 'Add track to playlist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('tracks/:playlistId/:trackId')
    addTrack(@Req() req, @Param('trackId') trackId: number, @Param('playlistId') playlistId: number) {
        return this.playlistsService.addTrack(+req.user.id, playlistId, trackId);
    }

    @ApiOperation({summary: 'Remove track from playlist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('tracks/:playlistId/:trackId')
    removeTrack(@Req() req, @Param('trackId') trackId: number, @Param('playlistId') playlistId: number) {
        return this.playlistsService.removeTrack(+req.user.id, playlistId, trackId);
    }
}
