import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {CreateArtistDto} from "./dto/create-artist.dto";
import {Artist} from "./artists.model";

@Injectable()
export class ArtistsService {
    constructor(@InjectModel(Artist) private artistRepository: typeof Artist) {}

    async createArtist(dto: CreateArtistDto) {
        const artist = await this.artistRepository.create(dto);
        return artist;
    }

    async getAllArtists() {
        const artists = await this.artistRepository.findAll()
        return artists;
    }
}
