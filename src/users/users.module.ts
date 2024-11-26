import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./users.model";
import {UserBlockedArtists} from "../artists/user-blocked-artists.model";
import {Artist} from "../artists/artists.model";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        SequelizeModule.forFeature([User, UserBlockedArtists, Artist])
    ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {}
