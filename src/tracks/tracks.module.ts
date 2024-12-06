import { Module } from '@nestjs/common';
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
import {ArtistsAuthModule} from "../artists-auth/artists-auth.module";

@Module({
    providers: [TracksService],
    controllers: [TracksController],
    imports: [
        SequelizeModule.forFeature([Artist, User, Album, TrackArtists, Track, UserFavouriteTracks]),
        FilesModule,
        ArtistsModule,
        AlbumsModule,
        ArtistsAuthModule
    ],
    exports: [
        TracksService,
    ]
})
export class TracksModule {}
