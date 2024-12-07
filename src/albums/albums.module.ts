import {forwardRef, Module} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Album} from "./albums.model";
import {Artist} from "../artists/artists.model";
import {AlbumArtists} from "./album-artists.model";
import {FilesModule} from "../files/files.module";
import {ArtistsModule} from "../artists/artists.module";
import {User} from "../users/users.model";
import {UserFavouriteAlbums} from "../users/user-favourite-albums.model";
import {Track} from "../tracks/tracks.model";
import {AuthModule} from "../auth/auth.module";

@Module({
    controllers: [AlbumsController],
    providers: [AlbumsService],
    imports: [
        SequelizeModule.forFeature([Album, AlbumArtists, Artist, User, UserFavouriteAlbums, Track]),
        forwardRef(() => ArtistsModule),
        forwardRef(() => AuthModule),
        FilesModule
    ],
    exports: [
        AlbumsService,
    ]
})
export class AlbumsModule {}
