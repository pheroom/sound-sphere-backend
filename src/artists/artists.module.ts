import {forwardRef, Module} from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Artist} from "./artists.model";
import {UserBlockedArtists} from "../users/user-blocked-artists.model";
import {User} from "../users/users.model";
import {FilesModule} from "../files/files.module";
import {AlbumArtists} from "../albums/album-artists.model";
import {Album} from "../albums/albums.model";
import {AlbumsModule} from "../albums/albums.module";
import {TrackArtists} from "../tracks/track-artists.model";
import {Track} from "../tracks/tracks.model";
import {AuthModule} from "../auth/auth.module";

@Module({
    controllers: [ArtistsController],
    providers: [ArtistsService],
    imports: [
        SequelizeModule.forFeature([Artist, UserBlockedArtists, User, AlbumArtists, Album, TrackArtists, Track]),
        forwardRef(() => AuthModule),
        forwardRef(() => AlbumsModule),
        FilesModule,
    ],
    exports: [
        ArtistsService
    ]
})
export class ArtistsModule {}
