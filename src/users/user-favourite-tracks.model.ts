import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {User} from "./users.model";
import {Track} from "../tracks/tracks.model";

@Table({tableName: 'user_favourite_tracks', updatedAt: false})
export class UserFavouriteTracks extends Model<UserFavouriteTracks> {
    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER})
    userId: number

    @ForeignKey(() => Track)
    @Column({type: DataType.INTEGER})
    trackId: number
}