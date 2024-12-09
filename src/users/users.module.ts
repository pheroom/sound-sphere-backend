import {forwardRef, Module} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./users.model";
import {UserBlockedArtists} from "./user-blocked-artists.model";
import {Artist} from "../artists/artists.model";
import {AuthModule} from "../auth/auth.module";
import {FilesModule} from "../files/files.module";
import {ArtistsModule} from "../artists/artists.module";
import {UserFavouriteAlbums} from "./user-favourite-albums.model";
import {Album} from "../albums/albums.model";
import {AlbumsModule} from "../albums/albums.module";
import {UserFavouriteTracks} from "./user-favourite-tracks.model";
import {Track} from "../tracks/tracks.model";
import {TracksModule} from "../tracks/tracks.module";
import {Playlist} from "../playlists/playlist.model";
import {UserFavouritePlaylists} from "./user-favourite-playlists.model";
import {PlaylistsModule} from "../playlists/playlists.module";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        SequelizeModule.forFeature([User, UserBlockedArtists, Artist, UserFavouriteAlbums, Album,
            UserFavouriteTracks, Track, Playlist, UserFavouritePlaylists]),
        forwardRef(() => AuthModule),
        ArtistsModule,
        AlbumsModule,
        TracksModule,
        PlaylistsModule,
        FilesModule,
    ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {}
