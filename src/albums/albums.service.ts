import {Injectable, NotFoundException} from '@nestjs/common';
import {AlbumDto} from './dto/album.dto';
import {InjectModel} from "@nestjs/sequelize";
import {FilesService} from "../files/files.service";
import {ArtistsService} from "../artists/artists.service";
import {Album} from "./albums.model";
import {AlbumArtists} from "./album-artists.model";
import {Artist} from "../artists/artists.model";
import {UpdateAlbumDto} from "./dto/update-album.dto";
import {Track} from "../tracks/tracks.model";

@Injectable()
export class AlbumsService {
    constructor(@InjectModel(Album) private albumRepository: typeof Album,
                @InjectModel(AlbumArtists) private albumArtistsRepository: typeof AlbumArtists,
                private filesService: FilesService,
                private artistsService: ArtistsService) {}

    async create(dto: AlbumDto, artistId: number) {
        const album = await this.albumRepository.create(dto);
        await album.$add('artists', artistId)
        return album;
    }

    async getAllAlbums() {
        const albums = await this.albumRepository.findAll({
            where: {isPrivate: false},
            include: [{
                model: Artist,
                through: {attributes: []}
            }]
        });
        return albums;
    }

    async getAlbumById(albumId: number) {
        const album = await this.albumRepository.findByPk(albumId);
        return album;
    }

    async getAlbumWithTracksById(albumId: number) {
        const album = await this.albumRepository.findByPk(albumId, {
            include: [{
                model: Artist,
                through: {attributes: []},
            },{
                model: Track,
                include: [{
                    model: Artist,
                    through: {attributes: []}
                }]
            }]
        });
        if(!album){
            throw new NotFoundException("No album found")
        }
        return album;
    }

    async updateAlbum(artistId: number, albumId: number, dto: UpdateAlbumDto, image) {
        class Updates extends UpdateAlbumDto{
            pictureURL?: string
        }
        const updates: Updates = {...dto}
        const owning = this.albumArtistsRepository.findOne({where: {albumId, artistId}});
        if(!owning) {
            throw new NotFoundException("You can't change other people's albums")
        }
        if(image){
            updates.pictureURL = await this.filesService.createFile(image)
        }
        const [_, [updatedAlbum]] = await this.albumRepository.update(updates, { where: { id: albumId }, returning: true });
        return updatedAlbum
    }
}
