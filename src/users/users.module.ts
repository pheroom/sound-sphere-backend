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

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        SequelizeModule.forFeature([User, UserBlockedArtists, Artist]),
        forwardRef(() => AuthModule),
        ArtistsModule,
        FilesModule,
    ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {}
