import {OmitType, PartialType} from "@nestjs/swagger";
import {TrackDto} from "./track.dto";

export class UpdateTrackDto extends PartialType(OmitType(TrackDto, ['albumId'] as const)){}
