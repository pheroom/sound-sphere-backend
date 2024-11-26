import { Module } from '@nestjs/common';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Artist} from "./artists.model";
import {UserBlockedArtists} from "./user-blocked-artists.model";
import {User} from "../users/users.model";

@Module({
    controllers: [ArtistsController],
    providers: [ArtistsService],
    imports: [
        SequelizeModule.forFeature([Artist, UserBlockedArtists, User])
    ]
})
export class ArtistsModule {}
