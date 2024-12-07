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
        if(!dto.number || Number.isNaN(Number(dto.number)) || dto.number <  1) {
            throw new NotFoundException("Track number must be a number");
        }
        const album = await this.albumsService.getAlbumById(dto.albumId);
        if(!album) {
            throw new NotFoundException("No albums found")
        }
        const candidate = await this.trackRepository.findOne({where: {albumId: dto.albumId, number: dto.number}});
        if(candidate) {
            throw new BadRequestException("Track with this number already exists in this album")
        }
        const pictureURL = picture ? await this.filesService.createFile(FileTypes.IMAGE, picture) : ''
        const audioURL = audio ? await this.filesService.createFile(FileTypes.AUDIO, audio) : ''
        const track = await this.trackRepository.create({...dto, pictureURL, audioURL});
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
        const owning = this.trackArtistsRepository.findOne({where: {trackId, artistId}});
        if(!owning) {
            throw new NotFoundException("You can't delete other people's tracks")
        }
        const result = await this.trackRepository.destroy({where: {id: trackId}})
        if (result === 0) {
            throw new NotFoundException('Track not found');
        }
        return
    }

    async addTrackArtist(authArtistId: number, trackId: number, artistId: number) {
        const owning = this.trackArtistsRepository.findOne({where: {trackId, artistId: authArtistId}});
        if(!owning) {
            throw new NotFoundException("You can't manage other people's tracks")
        }
        await this.trackArtistsRepository.create({artistId, trackId})
        return
    }

    async removeTrackArtist(authArtistId: number, trackId: number, artistId: number) {
        const owning = this.trackArtistsRepository.findOne({where: {trackId, artistId: authArtistId}});
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
