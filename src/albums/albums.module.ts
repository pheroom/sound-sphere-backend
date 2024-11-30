import {forwardRef, Module} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Album} from "./albums.model";
import {Artist} from "../artists/artists.model";
import {AlbumArtists} from "./album-artists.model";
import {UsersModule} from "../users/users.module";
import {FilesModule} from "../files/files.module";
import {ArtistsModule} from "../artists/artists.module";
import {ArtistsAuthModule} from "../artists-auth/artists-auth.module";

@Module({
    controllers: [AlbumsController],
    providers: [AlbumsService],
    imports: [
        SequelizeModule.forFeature([Album, AlbumArtists, Artist]),
        forwardRef(() => ArtistsModule),
        // forwardRef(() => UsersModule),
        FilesModule,
        ArtistsAuthModule
    ],
    exports: [
        AlbumsService,
    ]
})
export class AlbumsModule {}
