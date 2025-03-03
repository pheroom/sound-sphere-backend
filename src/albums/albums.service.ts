import {Injectable, NotFoundException} from '@nestjs/common';
import {AlbumDto} from './dto/album.dto';
import {InjectModel} from "@nestjs/sequelize";
import {FilesService, FileTypes} from "../files/files.service";
import {Album} from "./albums.model";
import {AlbumArtists} from "./album-artists.model";
import {Artist} from "../artists/artists.model";
import {UpdateAlbumDto} from "./dto/update-album.dto";
import {Track} from "../tracks/tracks.model";
import {Op} from "sequelize";
import {TracksService} from "../tracks/tracks.service";
import {modelToWithIsFavourite} from "../modelToWithIsFavourite";
import {User} from "../users/users.model";

@Injectable()
export class AlbumsService {
    constructor(@InjectModel(Album) private albumRepository: typeof Album,
                @InjectModel(AlbumArtists) private albumArtistsRepository: typeof AlbumArtists,
                // private tracksService: TracksService,
                private filesService: FilesService,) {}

    async create(dto: AlbumDto, artistId: number, picture) {
        const pictureURL = picture ? await this.filesService.createFile(FileTypes.IMAGE, picture) : ''
        const album = await this.albumRepository.create({...dto, pictureURL});
        await album.$add('artists', artistId)
        return album;
    }

    async getAllAlbums(userId: number, limit = 10, page = 1, query = '') {
        const offset = (page - 1) * limit;
        const albums = await this.albumRepository.findAll({
            where: {
                isPrivate: false,
                name: {[Op.iLike]: `%${query}%`},
            },
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
        return albums.map(modelToWithIsFavourite);
    }

    async getAlbumById(albumId: number) {
        const album = await this.albumRepository.findByPk(albumId);
        return album;
    }

    async checkAlbumOwning(artistId: number, albumId: number) {
        const owning = this.albumArtistsRepository.findOne({where: {albumId, artistId}});
        return !!owning
    }

    async getAlbumWithTracksById(artistId: number, albumId: number) {
        const checkAlbum = await this.albumRepository.findByPk(albumId);
        if(!checkAlbum){
            throw new NotFoundException("No album found")
        }
        if(checkAlbum.isPrivate) {
            if(!artistId) {
                throw new NotFoundException("You can't view private albums")
            }
            const owning = this.albumArtistsRepository.findOne({where: {albumId, artistId}});
            if(!owning) {
                throw new NotFoundException("You can't view private albums")
            }
        }
        const album = await this.albumRepository.findByPk(albumId, {
            include: [{
                model: Artist,
                through: {attributes: []},
            },{
                model: Track,
                include: [{
                    model: Artist,
                    through: {attributes: []},
                    order: [['name', 'DESC']]
                }]
            }],
        });
        return album;
    }

    async getPublicAlbumWithTracksById(userId: number, albumId: number) {
        const checkAlbum = await this.albumRepository.findByPk(albumId);
        if(!checkAlbum){
            throw new NotFoundException("No album found")
        }
        const album = await this.albumRepository.findByPk(albumId, {
            include: [{
                model: Artist,
                through: {attributes: []},
            },{
                model: Track,
                include: [{
                    model: Artist,
                    through: {attributes: []},
                    order: [['name', 'DESC']]
                }, {
                    model: User,
                    where: {id: {[Op.eq]: userId}},
                    through: {attributes: []},
                    attributes: ['id'],
                    required: false,
                }]
            }, {
                model: User,
                where: {id: {[Op.eq]: userId}},
                through: {attributes: []},
                attributes: ['id'],
                required: false,
            }],
        });
        const resAlbum = modelToWithIsFavourite(album)
        resAlbum.tracks = resAlbum.tracks.map(modelToWithIsFavourite)
        return resAlbum;
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
            updates.pictureURL = await this.filesService.createFile(FileTypes.IMAGE, image)
        }
        const [_, [updatedAlbum]] = await this.albumRepository.update(updates, { where: { id: albumId }, returning: true });
        // if(image){
            // await this.tracksService.updateTracksPicture(albumId, updates.pictureURL);
        // }
        return updatedAlbum
    }

    async deleteAlbum(artistId: number, albumId: number) {
        const owning = this.albumArtistsRepository.findOne({where: {albumId, artistId}});
        if(!owning) {
            throw new NotFoundException("You can't delete other people's albums")
        }
        const result = await this.albumRepository.destroy({where: {id: albumId}})
        if (result === 0) {
            throw new NotFoundException('Album not found');
        }
        return
    }

    async addAlbumArtist(authArtistId: number, albumId: number, artistId: number) {
        const owning = this.albumArtistsRepository.findOne({where: {albumId, artistId: authArtistId}});
        if(!owning) {
            throw new NotFoundException("You can't manage other people's albums")
        }
        await this.albumArtistsRepository.create({artistId, albumId})
        return
    }

    async removeAlbumArtist(authArtistId: number, albumId: number, artistId: number) {
        const owning = this.albumArtistsRepository.findOne({where: {albumId, artistId: authArtistId}});
        if(!owning) {
            throw new NotFoundException("You can't manage other people's albums")
        }
        const result = await this.albumArtistsRepository.destroy({where: {albumId, artistId}})
        if (result === 0) {
            throw new NotFoundException('Album or artist not found');
        }
        return
    }
}
