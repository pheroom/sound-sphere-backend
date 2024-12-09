import {BelongsToMany, Column, DataType, ForeignKey, Model, Scopes, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {Artist} from "../artists/artists.model";
import {User} from "../users/users.model";
import {Album} from "../albums/albums.model";
import {TrackArtists} from "./track-artists.model";
import {UserFavouriteTracks} from "../users/user-favourite-tracks.model";
import {PlaylistTracks} from "../playlists/playlist-tracks.model";
import {Playlist} from "../playlists/playlist.model";

interface TrackCreationAttrs{
    name: string;
    pictureURL: string;
    audioURL: string;
    number: number;
    albumId: number;
}

@Table({tableName: 'tracks'})
export class Track extends Model<Track, TrackCreationAttrs> {
    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @ApiProperty({example: 'So Good'})
    @Column({type: DataType.STRING(40), allowNull: false})
    name: string

    @ApiProperty({example: 'ovbisut94ueslxzjvo.png'})
    @Column({type: DataType.STRING, defaultValue: ''})
    pictureURL: string

    @ApiProperty({example: 'ovbisut94ueslxzjvo.png'})
    @Column({type: DataType.STRING, defaultValue: ''})
    audioURL: string

    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, defaultValue: 1})
    number: number

    @ForeignKey(() => Album)
    @Column({type: DataType.INTEGER})
    albumId: number;

    @BelongsToMany(() => Artist, () => TrackArtists)
    artists: Artist[]

    @BelongsToMany(() => User, () => UserFavouriteTracks)
    favouriteOfUsers: User[]

    @BelongsToMany(() => Playlist, () => PlaylistTracks)
    playlists: Playlist[]
}