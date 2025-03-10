import {
    Body,
    Controller, Delete,
    Get, Param, Patch, Post, Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {UsersService} from "./users.service";
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {User} from "./users.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UpdateUserDto} from "./dto/update-user.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {Artist} from "../artists/artists.model";
import {Album} from "../albums/albums.model";
import {Track} from "../tracks/tracks.model";
import {Playlist} from "../playlists/playlist.model";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({summary: 'Get all users'})
    @ApiResponse({status: 200, type: [User]})
    @Get('all')
    getAll(@Query('query') query: string, @Query('limit') limit: number, @Query('page') page: number) {
        return this.usersService.getAllUsers(limit, page, query)
    }

    @ApiOperation({summary: 'Get user profile by id'})
    @ApiResponse({status: 200, type: User})
    @Get('get-one-by-id/:id')
    getUserById(@Param('id') id: number) {
        return this.usersService.getUserById(id)
    }

    @ApiOperation({summary: 'Get user profile by username'})
    @ApiResponse({status: 200, type: User})
    @Get('get-one-by-username/:username')
    getUserByUsername(@Param('username') username: string) {
        return this.usersService.getUserByUsername(username)
    }

    @ApiOperation({summary: 'Get user profile by jwt token'})
    @ApiResponse({status: 200, type: User})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('get-one-by-token')
    getUserByToken(@Req() req) {
        return this.usersService.getUserById(+req.user.id)
    }

    @ApiOperation({summary: 'Update user profile'})
    @ApiResponse({status: 200, type: User})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch()
    @UseInterceptors(FileInterceptor('image'))
    update(@Req() req, @Body() dto: UpdateUserDto, @UploadedFile() image){
        return this.usersService.updateUser(req.user, dto, image)
    }

    @ApiOperation({summary: 'Block artist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('block-artists/:artistId')
    blockArtist(@Req() req, @Param('artistId') artistId: string){
        return this.usersService.blockArtist(+req.user.id, +artistId)
    }

    @ApiOperation({summary: 'Unlock artist'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('block-artists/:artistId')
    unblockArtist(@Req() req, @Param('artistId') artistId: string){
        return this.usersService.unblockArtist(+req.user.id, +artistId)
    }

    @ApiOperation({summary: 'Get blocked artist for auth user'})
    @ApiResponse({status: 200, type: [Artist]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('block-artists')
    getBlockedArtist(@Req() req, @Query('limit') limit: number, @Query('page') page: number){
        return this.usersService.getBlockedArtistsByUserId(+req.user.id, limit, page)
    }

    @ApiOperation({summary: 'Add album to favourites'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('favourite-albums/:albumId')
    favouriteAlbum(@Req() req, @Param('albumId') albumId: string){
        return this.usersService.favouriteAlbum(+req.user.id, +albumId)
    }

    @ApiOperation({summary: 'Remove album from favourites'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('favourite-albums/:albumId')
    unfavouriteAlbum(@Req() req, @Param('albumId') albumId: string){
        return this.usersService.unfavouriteAlbum(+req.user.id, +albumId)
    }

    @ApiOperation({summary: 'Get favourites albums by user Id'})
    @ApiResponse({status: 200, type: [Album]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('favourite-albums/:userId')
    getFavouriteAlbums(@Req() req, @Param('userId') userId: number, @Query('limit') limit: number, @Query('page') page: number){
        return this.usersService.getFavouriteAlbumsByUserId(+req.user.id, userId, limit, page)
    }

    @ApiOperation({summary: 'Add track to favourites'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('favourite-tracks/:trackId')
    favouriteTrack(@Req() req, @Param('trackId') trackId: number){
        return this.usersService.favouriteTrack(+req.user.id, trackId)
    }

    @ApiOperation({summary: 'Remove track from favourites'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('favourite-tracks/:trackId')
    unfavouriteTrack(@Req() req, @Param('trackId') trackId: number){
        return this.usersService.unfavouriteTrack(+req.user.id, trackId)
    }

    @ApiOperation({summary: 'Get favourites tracks by user Id'})
    @ApiResponse({status: 200, type: [Track]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('favourite-tracks/:userId')
    getFavouriteTracks(@Req() req, @Param('userId') userId: number, @Query('limit') limit: number, @Query('page') page: number){
        return this.usersService.getFavouriteTracksByUserId(+req?.user?.id, userId, limit, page)
    }

    @ApiOperation({summary: 'Get created playlists by user id'})
    @ApiResponse({status: 200, type: [Playlist]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('playlists/:userId')
    getCreatedPlaylists(@Req() req, @Param('userId') userId: number, @Query('limit') limit: number, @Query('page') page: number) {
        return this.usersService.getPlaylistsByUserId(+req?.user?.id, userId, limit, page);
    }

    @ApiOperation({summary: 'Add playlist to favourites'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('favourite-playlists/:playlistId')
    favouritePlaylist(@Req() req, @Param('playlistId') playlistId: number){
        return this.usersService.favouritePlaylist(+req.user.id, playlistId)
    }

    @ApiOperation({summary: 'Remove playlist from favourites'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('favourite-playlists/:playlistId')
    unfavouritePlaylist(@Req() req, @Param('playlistId') playlistId: number){
        return this.usersService.unfavouritePlaylist(+req.user.id, playlistId)
    }

    @ApiOperation({summary: 'Get favourites playlist by user Id'})
    @ApiResponse({status: 200, type: [Playlist]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('favourite-playlists/:userId')
    getFavouritePlaylists(@Req() req, @Param('userId') userId: number, @Query('limit') limit: number, @Query('page') page: number){
        return this.usersService.getFavouritePlaylistsByUserId(+req?.user?.id, userId, limit, page)
    }
}
