import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Album} from "../albums/albums.model";
import {AlbumArtists} from "../albums/album-artists.model";
import {FilesService} from "../files/files.service";
import {ArtistsService} from "../artists/artists.service";
import {AlbumDto} from "../albums/dto/album.dto";
import {Artist} from "../artists/artists.model";
import {Track} from "./tracks.model";
import {TrackArtists} from "./track-artists.model";
import {TrackDto} from "./dto/track.dto";
import {AlbumsService} from "../albums/albums.service";
import {UpdateAlbumDto} from "../albums/dto/update-album.dto";
import {UpdateTrackDto} from "./dto/update-track.dto";

@Injectable()
export class TracksService {
    constructor(@InjectModel(Track) private trackRepository: typeof Track,
                @InjectModel(TrackArtists) private trackArtistsRepository: typeof TrackArtists,
                private filesService: FilesService,
                private albumsService: AlbumsService,
                private artistsService: ArtistsService) {}

    async create(dto: TrackDto, artistId: number) {
        const album = await this.albumsService.getAlbumById(dto.albumId);
        if(!album) {
            throw new NotFoundException("No albums found")
        }
        const candidate = await this.trackRepository.findOne({where: {albumId: dto.albumId, number: dto.number}});
        if(candidate) {
            throw new BadRequestException("Track with this number already exists in this album")
        }
        const track = await this.trackRepository.create(dto);
        await track.$add('artists', artistId)
        return track;
    }

    async getAllTracks() {
        const tracks = await this.trackRepository.findAll({
            include: [{
                model: Artist,
                through: {attributes: []}
            }]
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
            updates.pictureURL = await this.filesService.createFile(image)
        }
        const [_, [updatedTrack]] = await this.trackRepository.update(updates, { where: { id: trackId }, returning: true });
        return updatedTrack
    }
}
