import {
    BelongsTo,
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Scopes,
    Table
} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";
import {User} from "../users/users.model";
import {Track} from "../tracks/tracks.model";
import {PlaylistTracks} from "./playlist-tracks.model";
import {UserFavouritePlaylists} from "../users/user-favourite-playlists.model";

interface PlaylistCreationAttrs{
    name: string;
    pictureURL: string;
    userId: number;
}

@Table({tableName: 'playlists'})
export class Playlist extends Model<Playlist, PlaylistCreationAttrs> {
    @ApiProperty({example: 1})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @ApiProperty({example: 'My playlist'})
    @Column({type: DataType.STRING(50), allowNull: false})
    name: string

    @ApiProperty({example: 'Playlist desc :)'})
    @Column({type: DataType.STRING(140), defaultValue: ''})
    description: string

    @ApiProperty({example: false})
    @Column({type: DataType.BOOLEAN, defaultValue: false})
    isPrivate: boolean

    @ApiProperty({example: 'ovbisut94ueslxzjvo.png'})
    @Column({type: DataType.STRING, defaultValue: ''})
    pictureURL: string

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER})
    userId: number;

    @BelongsTo(() => User)
    user: User

    @BelongsToMany(() => Track, () => PlaylistTracks)
    tracks: Track[]

    @BelongsToMany(() => User, () => UserFavouritePlaylists)
    favouriteOfUsers: User[]
}