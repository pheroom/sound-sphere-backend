import {Model} from "sequelize-typescript";

export function modelToWithIsFavourite<T extends Model & {favouriteOfUsers: any[]}>(model: T) {
    const jsonModel: T & {isFavourite?: boolean} = model?.toJSON?.() || model
    jsonModel.isFavourite = jsonModel.favouriteOfUsers.length > 0
    jsonModel.favouriteOfUsers = undefined
    return jsonModel
}