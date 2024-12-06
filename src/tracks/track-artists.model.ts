import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {Artist} from "../artists/artists.model";
import {Track} from "./tracks.model";

@Table({tableName: 'track_artists', updatedAt: false})
export class TrackArtists extends Model<TrackArtists> {
    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @ForeignKey(() => Track)
    @Column({type: DataType.INTEGER})
    trackId: number

    @ForeignKey(() => Artist)
    @Column({type: DataType.INTEGER})
    artistId: number
}