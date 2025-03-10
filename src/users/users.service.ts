import {HttpException, HttpStatus, Injectable, NotFoundException, Scope} from '@nestjs/common';
import {User} from "./users.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {FilesService, FileTypes} from "../files/files.service";
import {ArtistsService} from "../artists/artists.service";
import {Artist} from "../artists/artists.model";
import {UserBlockedArtists} from "./user-blocked-artists.model";
import {AlbumsService} from "../albums/albums.service";
import {UserFavouriteAlbums} from "./user-favourite-albums.model";
import {Album} from "../albums/albums.model";
import {UserFavouriteTracks} from "./user-favourite-tracks.model";
import {TracksService} from "../tracks/tracks.service";
import {Track} from "../tracks/tracks.model";
import {Op} from "sequelize";
import {Playlist} from "../playlists/playlist.model";
import {UserFavouritePlaylists} from "./user-favourite-playlists.model";
import {PlaylistsService} from "../playlists/playlists.service";
import {isLogLevelEnabled} from "@nestjs/common/services/utils";
import {modelToWithIsFavourite} from "../modelToWithIsFavourite";

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
    constructor(@InjectModel(User) private userRepository: typeof User,
                @InjectModel(UserBlockedArtists) private userBlockedArtistsRepository: typeof UserBlockedArtists,
                @InjectModel(UserFavouriteAlbums) private userFavouriteAlbumsRepository: typeof UserFavouriteAlbums,
                @InjectModel(UserFavouriteTracks) private userFavouriteTracksRepository: typeof UserFavouriteTracks,
                @InjectModel(UserFavouritePlaylists) private userFavouritePlaylistsRepository: typeof UserFavouritePlaylists,
                private filesService: FilesService,
                private albumsService: AlbumsService,
                private tracksService: TracksService,
                private playlistService: PlaylistsService,
                private artistsService: ArtistsService) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        return user;
    }

    async updateUser(user, dto: UpdateUserDto, image) {
        class Updates extends UpdateUserDto{
            avatarURL?: string
        }
        const updates: Updates = {...dto}
        if(updates.username && user.username !== updates.username) {
            const candidate = await this.getUserByUsername(updates.username);
            if (candidate) {
                throw new HttpException("User with this username already exists", HttpStatus.BAD_REQUEST);
            }
        }
        if(image){
            updates.avatarURL = await this.filesService.createFile(FileTypes.IMAGE, image)
        }
        const [_, [updatedUser]] = await this.userRepository.update(updates, { where: { id: user.id }, returning: true });
        return updatedUser
    }

    async getAllUsers(limit = 10, page = 1, query = '') {
        const offset = (page - 1) * limit;
        const users = await this.userRepository.findAll({
            where: {
                username: {[Op.iLike]: `%${query}%`},
            },
            limit,
            offset
        });
        return users;
    }

    async getUserById(id: number, withPassword = false) {
        const repository = withPassword ? this.userRepository.scope('withPassword') : this.userRepository
        const user = await repository.findByPk(id);
        return user
    }

    async getUserByUsername(username: string, withPassword = false) {
        const repository = withPassword ? this.userRepository.scope('withPassword') : this.userRepository
        const user = await repository.findOne({ where: {username} });
        return user
    }

    async blockArtist(userId: number, artistId: number){
        const user = await this.userRepository.findByPk(userId);
        const artist = await this.artistsService.getArtistById(artistId);
        if (!artist || !user) {
            throw new NotFoundException('Artist not found');
        }
        await user.$add('blockedArtists', artistId)
        // await this.userBlockedArtistsRepository.create({userId: user.id, artistId});
        return
    }

    async unblockArtist(userId: number, artistId: number){
        const result = await this.userBlockedArtistsRepository.destroy({where: {userId, artistId}})
        if (result === 0) {
            throw new NotFoundException('Artist not found in blocked list');
        }
        return
    }

    async getBlockedArtistsByUserId(userId: number, limit = 10, page = 1){
        const offset = (page - 1) * limit;
        const user = await this.userRepository.findByPk(userId, {
            subQuery: false,
            include: [{
                model: Artist,
                through: {attributes: []},
            }],
            limit,
            offset,
            order: [[{model: Artist, as: 'blockedArtists'}, UserBlockedArtists, 'createdAt', 'desc']]
        });
        return user?.blockedArtists || []
    }

    async favouriteAlbum(userId: number, albumId: number){
        const user = await this.userRepository.findByPk(userId);
        const album = await this.albumsService.getAlbumById(albumId);
        if (!album || !user || album.isPrivate) {
            throw new NotFoundException('Album not found');
        }
        await user.$add('favouriteAlbums', albumId)
        return
    }

    async unfavouriteAlbum(userId: number, albumId: number){
        const result = await this.userFavouriteAlbumsRepository.destroy({where: {userId, albumId}})
        if (result === 0) {
            throw new NotFoundException('Album not found in favourites list');
        }
        return
    }

    async getFavouriteAlbumsByUserId(authUserId: number, userId: number, limit = 10, page = 1){
        const offset = (page - 1) * limit;
        const user = await this.userRepository.findByPk(userId, {
            subQuery: false,
            include: [{
                model: Album,
                through: {attributes: []},
                include: [{
                    model: Artist,
                    through: {attributes: []}
                }, {
                    model: User,
                    where: {id: {[Op.eq]: authUserId}},
                    through: {attributes: []},
                    attributes: ['id'],
                    required: false,
                }]
            }],
            limit,
            offset,
            order: [[{model: Album, as: 'favouriteAlbums'}, UserFavouriteAlbums, 'createdAt', 'desc']]
        });
        return user?.favouriteAlbums?.map?.(modelToWithIsFavourite) || []
    }

    async favouriteTrack(userId: number, trackId: number){
        const user = await this.userRepository.findByPk(userId);
        const track = await this.tracksService.getTrackById(trackId);
        if (!track || !user) {
            throw new NotFoundException('Track not found');
        }
        await user.$add('favouriteTracks', trackId)
        return
    }

    async unfavouriteTrack(userId: number, trackId: number){
        const result = await this.userFavouriteTracksRepository.destroy({where: {userId, trackId}})
        if (result === 0) {
            throw new NotFoundException('Track not found in favourites list');
        }
        return
    }

    async getFavouriteTracksByUserId(authUserId: number, userId: number, limit = 10, page = 1){
        const offset = (page - 1) * limit;
        const user = await this.userRepository.findByPk(userId, {
            subQuery: false,
            include: [{
                model: Track,
                through: {attributes: []},
                include: [{
                    model: Artist,
                    through: {attributes: []}
                }, {
                    model: User,
                    where: {id: {[Op.eq]: authUserId}},
                    through: {attributes: []},
                    attributes: ['id'],
                    required: false,
                }]
            }],
            limit,
            offset,
            order: [[{model: Track, as: 'favouriteTracks'}, UserFavouriteTracks, 'createdAt', 'desc']]
        });
        return user?.favouriteTracks?.map?.(modelToWithIsFavourite) || []
    }

    async getPlaylistsByUserId(authUserId: number, userId: number, limit = 10, page = 1) {
        const offset = (page - 1) * limit;
        const user = await this.userRepository.findByPk(userId, {
            subQuery: false,
            include: {
                model: Playlist,
                as: 'playlists',
            },
            limit,
            offset,
            order: [[{model: Playlist, as: 'playlists'}, 'createdAt', 'desc']]
        })
        return user?.playlists || []
    }

    async favouritePlaylist(userId: number, playlistId: number){
        const user = await this.userRepository.findByPk(userId);
        const playlist = await this.playlistService.getPlaylistById(playlistId);
        if (!playlist || !user) {
            throw new NotFoundException('Playlist not found');
        }
        await user.$add('favouritePlaylists', playlistId)
        // await this.userFavouritePlaylistsRepository.create({userId: user.id, playlistId});
        return
    }

    async unfavouritePlaylist(userId: number, playlistId: number){
        const result = await this.userFavouritePlaylistsRepository.destroy({where: {userId, playlistId}})
        if (result === 0) {
            throw new NotFoundException('Playlist not found in favourites list');
        }
        return
    }

    async getFavouritePlaylistsByUserId(authUserId: number, userId: number, limit = 10, page = 1){
        const offset = (page - 1) * limit;
        const user = await this.userRepository.findByPk(userId, {
            subQuery: false,
            include: [{
                model: Playlist,
                as: 'favouritePlaylists',
                through: {attributes: []},
                include: [{
                    model: User,
                    as: 'user'
                }]
            }],
            limit,
            offset,
            order: [[{model: Playlist, as: 'favouritePlaylists'}, UserFavouritePlaylists, 'createdAt', 'desc']]
        });
        return user?.favouritePlaylists || []
    }
}
