import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {User} from "./users.model";
import {Playlist} from "../playlists/playlist.model";

@Table({tableName: 'user_favourite_playlists', updatedAt: false})
export class UserFavouritePlaylists extends Model<UserFavouritePlaylists> {
    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER})
    userId: number

    @ForeignKey(() => Playlist)
    @Column({type: DataType.INTEGER})
    playlistId: number
}