import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {CreateArtistDto} from "./dto/create-artist.dto";
import {Artist} from "./artists.model";
import {UpdateArtistDto} from "./dto/update-artist.dto";
import {FilesService, FileTypes} from "../files/files.service";
import {Album} from "../albums/albums.model";
import {Op} from "sequelize";
import {User} from "../users/users.model";
import {modelToWithIsFavourite} from "../modelToWithIsFavourite";

@Injectable()
export class ArtistsService {
    constructor(@InjectModel(Artist) private artistRepository: typeof Artist,
                private filesService: FilesService) {}

    async createArtist(dto: CreateArtistDto) {
        const artist = await this.artistRepository.create(dto);
        return artist;
    }

    async updateArtist(artist, dto: UpdateArtistDto, image) {
        class Updates extends UpdateArtistDto{
            avatarURL?: string
        }
        const updates: Updates = {...dto}
        if(updates.username && artist.username !== updates.username) {
            const candidate = await this.getArtistByUsername(updates.username);
            if (candidate) {
                throw new HttpException("Artist with this username already exists", HttpStatus.BAD_REQUEST);
            }
        }
        if(image){
            updates.avatarURL = await this.filesService.createFile(FileTypes.IMAGE, image)
        }
        const [_, [updatedArtist]] = await this.artistRepository.update(updates, { where: { id: artist.id }, returning: true });
        return updatedArtist
    }

    async getAllArtists(limit = 10, page = 1, query = '') {
        const offset = (page - 1) * limit;
        const artists = await this.artistRepository.findAll({
            where: {
                name: {[Op.iLike]: `%${query}%`},
            },
            limit,
            offset
        });
        return artists;
    }

    async getArtistById(id: number, withPassword = false) {
        const repository = withPassword ? this.artistRepository.scope('withPassword') : this.artistRepository
        const artist = await repository.findByPk(id);
        return artist
    }

    async getArtistByUsername(username: string, withPassword = false) {
        const repository = withPassword ? this.artistRepository.scope('withPassword') : this.artistRepository
        const artist = await repository.findOne({ where: {username} });
        return artist
    }

    async getAlbumsByArtistId(userId: number, artistId: number, limit = 10, page = 1) {
        const offset = (page - 1) * limit;
        const artist = await this.artistRepository.findByPk(artistId, {
            subQuery: false,
            include: {
                model: Album,
                through: {attributes: []},
                include: [{
                    model: Artist,
                    through: {attributes: []},
                }, {
                    model: User,
                    where: {id: {[Op.eq]: userId}},
                    through: {attributes: []},
                    attributes: ['id'],
                    required: false,
                }]
            },
            limit,
            offset,
            order: [[{model: Album, as: 'albums'}, 'createdAt', 'desc']]
        })
        // @ts-ignore
        return artist?.albums?.map(modelToWithIsFavourite) || []
    }

    async getAlbumsByAuthArtist(artistId: number, limit = 10, page = 1) {
        const offset = (page - 1) * limit;
        const artist = await this.artistRepository.findByPk(artistId, {
            subQuery: false,
            include: {
                model: Album,
                through: {attributes: []},
                include: [{
                    model: Artist,
                    through: {attributes: []},
                }]
            },
            limit,
            offset,
            order: [[{model: Album, as: 'albums'}, 'createdAt', 'desc']]
        })
        return artist?.albums || []
    }
}
