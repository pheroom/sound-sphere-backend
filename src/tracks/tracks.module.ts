import {forwardRef, Module} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Artist} from "../artists/artists.model";
import {User} from "../users/users.model";
import {Album} from "../albums/albums.model";
import {TrackArtists} from "./track-artists.model";
import {Track} from "./tracks.model";
import {UserFavouriteTracks} from "../users/user-favourite-tracks.model";
import {FilesModule} from "../files/files.module";
import {ArtistsModule} from "../artists/artists.module";
import {AlbumsModule} from "../albums/albums.module";
import {AuthModule} from "../auth/auth.module";
import {PlaylistTracks} from "../playlists/playlist-tracks.model";
import {Playlist} from "../playlists/playlist.model";

@Module({
    providers: [TracksService],
    controllers: [TracksController],
    imports: [
        SequelizeModule.forFeature([Artist, User, Album, TrackArtists, Track, UserFavouriteTracks, PlaylistTracks, Playlist]),
        FilesModule,
        AlbumsModule,
        ArtistsModule,
        AuthModule,
    ],
    exports: [
        TracksService,
    ]
})
export class TracksModule {}
