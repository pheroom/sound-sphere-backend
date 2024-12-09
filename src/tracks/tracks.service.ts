import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {FilesService, FileTypes} from "../files/files.service";
import {ArtistsService} from "../artists/artists.service";
import {Artist} from "../artists/artists.model";
import {Track} from "./tracks.model";
import {TrackArtists} from "./track-artists.model";
import {TrackDto} from "./dto/track.dto";
import {AlbumsService} from "../albums/albums.service";
import {UpdateTrackDto} from "./dto/update-track.dto";
import {Op} from "sequelize";

@Injectable()
export class TracksService {
    constructor(@InjectModel(Track) private trackRepository: typeof Track,
                @InjectModel(TrackArtists) private trackArtistsRepository: typeof TrackArtists,
                private filesService: FilesService,
                private albumsService: AlbumsService,) {}

    async create(artistId: number, dto: TrackDto, picture, audio) {
        const album = await this.albumsService.getAlbumById(dto.albumId);
        if(!album) {
            throw new NotFoundException("No albums found")
        }
        const albumTracks = await this.trackRepository.findAll({ where: { albumId: dto.albumId } });
        const number = albumTracks.length + 1
        const pictureURL = picture ? await this.filesService.createFile(FileTypes.IMAGE, picture) : ''
        const audioURL = audio ? await this.filesService.createFile(FileTypes.AUDIO, audio) : ''
        const track = await this.trackRepository.create({...dto, pictureURL, audioURL, number});
        await track.$add('artists', artistId)
        return track;
    }

    async getAllTracks(limit = 10, page = 1, query = '') {
        const offset = (page - 1) * limit;
        const tracks = await this.trackRepository.findAll({
            where: {
                name: {[Op.iLike]: `%${query}%`},
            },
            include: [{
                model: Artist,
                through: {attributes: []}
            }],
            limit,
            offset
        });
        return tracks;
    }

    async getTrackById(trackId: number) {
        const track = await this.trackRepository.findByPk(trackId)
        return track;
    }

    async updateTrack(artistId: number, trackId: number, dto: UpdateTrackDto, image) {
        class Updates extends UpdateTrackDto{
            pictureURL?: string
        }
        const updates: Updates = {...dto}
        const owning = this.trackArtistsRepository.findOne({where: {trackId, artistId}});
        if(!owning) {
            throw new NotFoundException("You can't change other people's tracks")
        }
        if(image){
            updates.pictureURL = await this.filesService.createFile(FileTypes.IMAGE, image)
        }
        const [_, [updatedTrack]] = await this.trackRepository.update(updates, { where: { id: trackId }, returning: true });
        return updatedTrack
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
