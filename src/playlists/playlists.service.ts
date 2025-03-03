import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {FilesService, FileTypes} from "../files/files.service";
import {Op} from "sequelize";
import {Playlist} from "./playlist.model";
import {PlaylistDto} from "./dto/playlist.dto";
import {PlaylistTracks} from "./playlist-tracks.model";
import {User} from "../users/users.model";
import {UpdatePlaylistDto} from "./dto/update-playlist.dto";
import {Artist} from "../artists/artists.model";
import {Track} from "../tracks/tracks.model";

@Injectable()
export class PlaylistsService {
    constructor(@InjectModel(Playlist) private playlistRepository: typeof Playlist,
                @InjectModel(PlaylistTracks) private playlistTracksRepository: typeof PlaylistTracks,
                private filesService: FilesService) {}

    async create(userId: number, dto: PlaylistDto, picture) {
        const pictureURL = picture ? await this.filesService.createFile(FileTypes.IMAGE, picture) : ''
        const playlist = await this.playlistRepository.create({...dto, pictureURL, userId});
        return playlist;
    }

    async getAllPlaylists(limit = 10, page = 1, query = '') {
        const offset = (page - 1) * limit;
        const playlists = await this.playlistRepository.findAll({
            where: {
                name: {[Op.iLike]: `%${query}%`},
            },
            include: {
                model: User,
                as: 'user'
            },
            limit,
            offset
        });
        return playlists;
    }

    async getPlaylistById(playlistId: number){
        const playlist = await this.playlistRepository.findByPk(playlistId)
        return playlist
    }

    async getPlaylistWithTracksById(userId: number | undefined, playlistId: number) {
        const checkPlaylist = await this.playlistRepository.findByPk(playlistId);
        if(!checkPlaylist){
            throw new NotFoundException("No playlist found")
        }
        if(checkPlaylist.isPrivate && checkPlaylist.userId !== userId) {
            throw new NotFoundException("You can't view private playlist")
        }
        const playlist = await this.playlistRepository.findByPk(playlistId, {
            include: [{
                model: User,
                as: 'user'
            },{
                model: Track,
                include: [{
                    model: Artist,
                    through: {attributes: []},
                    order: [['name', 'DESC']]
                }]
            }],
            order: [[{model: Track, as: 'tracks'}, PlaylistTracks, 'number', 'asc']]
        });
        return playlist;
    }

    async removePlaylistById(userId: number, playlistId: number) {
        const playlist = await this.playlistRepository.findByPk(playlistId);
        if(!playlist || playlist.userId !== userId) {
            throw new NotFoundException("You can't manage other people's playlists")
        }
        const result = await this.playlistRepository.destroy({where: {id: playlistId}})
        if (result === 0) {
            throw new NotFoundException('Playlist or artist not found');
        }
        return
    }

    async updatePlaylist(userId: number, playlistId: number, dto: UpdatePlaylistDto, image) {
        class Updates extends UpdatePlaylistDto{
            pictureURL?: string
        }
        const updates: Updates = {...dto}
        const playlist = await this.playlistRepository.findByPk(playlistId);
        if(!playlist || playlist.userId !== userId) {
            throw new BadRequestException("You can't manage other people's playlists")
        }
        if(image){
            updates.pictureURL = await this.filesService.createFile(FileTypes.IMAGE, image)
        }
        const [_, [updatedPlaylist]] = await this.playlistRepository.update(updates, { where: { id: playlistId }, returning: true });
        return updatedPlaylist
    }

    async addTrack(userId: number, playlistId: number, trackId: number){
        // throw new BadRequestException('Track has already been added to the playlist')
        const playlist = await this.playlistRepository.findByPk(playlistId);
        if(!playlist || playlist.userId !== userId) {
            throw new BadRequestException("You can't manage other people's playlists")
        }
        const playlistTracks = await this.playlistTracksRepository.findAll({ where: { playlistId } });
        const number = playlistTracks.length + 1
        await this.playlistTracksRepository.create({playlistId, trackId, number})
        return
    }

    async removeTrack(userId: number, playlistId: number, trackId: number) {
        const playlist = await this.playlistRepository.findByPk(playlistId);
        if(!playlist || playlist.userId !== userId) {
            throw new BadRequestException("You can't manage other people's playlists")
        }
        const result = await this.playlistTracksRepository.destroy({where: {trackId, playlistId}})
        if (result === 0) {
            throw new BadRequestException('Track or playlist not found');
        }
        await this.reorderTracks(playlistId)
        return
    }

    async reorderTracks(playlistId: number){
        const playlistTracks = await this.playlistTracksRepository.findAll({ where: { playlistId }, order: [['number', 'asc']] });
        let prevNumber = 0
        for(let {id, trackId, number} of playlistTracks){
            if(number - 1 !== prevNumber){
                await this.playlistTracksRepository.update({number: prevNumber + 1}, {where: {id}})
            }
            prevNumber++
        }
    }
}
