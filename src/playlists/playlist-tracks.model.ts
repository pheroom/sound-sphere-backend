import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {Playlist} from "./playlist.model";
import {Track} from "../tracks/tracks.model";

@Table({tableName: 'playlist_tracks', updatedAt: false})
export class PlaylistTracks extends Model<PlaylistTracks> {
    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @ForeignKey(() => Playlist)
    @Column({type: DataType.INTEGER})
    playlistId: number

    @ForeignKey(() => Track)
    @Column({type: DataType.INTEGER})
    trackId: number

    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, defaultValue: 1})
    number: number
}