import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {FilesService, FileTypes} from "../files/files.service";
import {Artist} from "../artists/artists.model";
import {Track} from "./tracks.model";
import {TrackArtists} from "./track-artists.model";
import {TrackDto} from "./dto/track.dto";
import {AlbumsService} from "../albums/albums.service";
import {UpdateTrackDto} from "./dto/update-track.dto";
import sequelize, {Op} from "sequelize";
import {User} from "../users/users.model";
import {modelToWithIsFavourite} from "../modelToWithIsFavourite";

@Injectable()
export class TracksService {
    constructor(@InjectModel(Track) private trackRepository: typeof Track,
                @InjectModel(TrackArtists) private trackArtistsRepository: typeof TrackArtists,
                private filesService: FilesService,
                private albumsService: AlbumsService,) {}

    async create(artistId: number, dto: TrackDto, audio) {
        const album = await this.albumsService.getAlbumById(dto.albumId);
        if(!album) {
            throw new NotFoundException("No albums found")
        }
        if(!(await this.albumsService.checkAlbumOwning(dto.albumId, artistId))) {
            throw new NotFoundException("You can't manage other people's albums")
        }
        const albumTracks = await this.trackRepository.findAll({ where: { albumId: dto.albumId } });
        const number = albumTracks.length + 1
        const audioURL = audio ? await this.filesService.createFile(FileTypes.AUDIO, audio) : ''
        const track = await this.trackRepository.create({...dto, audioURL, number, pictureURL: album.pictureURL});
        await track.$add('artists', artistId)
        return track;
    }

    async getAllTracks(userId: number, limit = 10, page = 1, query = '') {
        const offset = (page - 1) * limit;
        const tracks = await this.trackRepository.findAll({
            where: {
                name: {[Op.iLike]: `%${query}%`},
            },
            order: [['createdAt', 'desc']],
            include: [{
                model: Artist,
                through: {attributes: []}
            }, {
                model: User,
                where: {id: {[Op.eq]: userId}},
                through: {attributes: []},
                attributes: ['id'],
                required: false,
            }],
            limit,
            offset
        });
        return tracks.map(modelToWithIsFavourite);
    }

    async getTrackById(trackId: number) {
        const track = await this.trackRepository.findByPk(trackId, {
            include: [{
                model: Artist,
                through: {attributes: []}
            }],
        })
        if (!track) {
            throw new NotFoundException('Track not found');
        }
        return track;
    }

    async updateTrack(artistId: number, trackId: number, dto: UpdateTrackDto, auido) {
        class Updates extends UpdateTrackDto{
            audioURL?: string
        }
        const updates: Updates = {...dto}
        const owning = this.trackArtistsRepository.findOne({where: {trackId, artistId}});
        if(!owning) {
            throw new NotFoundException("You can't change other people's tracks")
        }
        if(auido){
            updates.audioURL = await this.filesService.createFile(FileTypes.AUDIO, auido)
        }
        const [_, [updatedTrack]] = await this.trackRepository.update(updates, { where: { id: trackId }, returning: true });
        return updatedTrack
    }

    async updateTracksPicture(albumId: number, pictureURL: string) {
        const res = await this.trackRepository.update({pictureURL}, { where: { albumId }, returning: true });
        console.log(res)
    }

    async deleteTrack(artistId: number, trackId: number) {
        const owning = await this.trackArtistsRepository.findOne({where: {trackId, artistId}});
        if(!owning) {
            throw new NotFoundException("You can't delete other people's tracks")
        }
        const {albumId} = await this.trackRepository.findByPk(trackId)
        const result = await this.trackRepository.destroy({where: {id: trackId}})
        if (!albumId || result === 0) {
            throw new NotFoundException('Track not found');
        }
        await this.reorderTracks(albumId)
        return
    }

    async reorderTracks(albumId: number){
        const albumTracks = await this.trackRepository.findAll({ where: { albumId }, order: [['number', 'asc']] });
        let prevNumber = 0
        for(let {id, number} of albumTracks){
            if(number - 1 !== prevNumber){
                await this.trackRepository.update({number: prevNumber + 1}, {where: {id}})
            }
            prevNumber++
        }
    }

    async addTrackArtist(authArtistId: number, trackId: number, artistId: number) {
        const owning = await this.trackArtistsRepository.findOne({where: {trackId, artistId: authArtistId}});
        if(!owning) {
            throw new NotFoundException("You can't manage other people's tracks")
        }
        await this.trackArtistsRepository.create({artistId, trackId})
        return
    }

    async removeTrackArtist(authArtistId: number, trackId: number, artistId: number) {
        const owning = await this.trackArtistsRepository.findOne({where: {trackId, artistId: authArtistId}});
        if(!owning) {
            throw new NotFoundException("You can't manage other people's tracks")
        }
        const result = await this.trackArtistsRepository.destroy({where: {trackId, artistId}})
        if (result === 0) {
            throw new NotFoundException('Track or artist not found');
        }
        return
    }
}
