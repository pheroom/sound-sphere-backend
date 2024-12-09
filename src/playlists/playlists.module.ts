import { Module } from '@nestjs/common';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "../users/users.model";
import {PlaylistTracks} from "./playlist-tracks.model";
import {Playlist} from "./playlist.model";
import {FilesModule} from "../files/files.module";
import {UserFavouritePlaylists} from "../users/user-favourite-playlists.model";
import {Track} from "../tracks/tracks.model";
import {AuthModule} from "../auth/auth.module";

@Module({
    controllers: [PlaylistsController],
    providers: [PlaylistsService],
    imports: [
        SequelizeModule.forFeature([PlaylistTracks, Playlist, User, UserFavouritePlaylists, Track]),
        FilesModule,
        AuthModule
    ],
    exports: [
        PlaylistsService
    ],
})
export class PlaylistsModule {}
