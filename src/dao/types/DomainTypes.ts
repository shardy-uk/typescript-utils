import {Entity} from "../../model/Entity";

export interface PouchEntity extends Entity {
    revision?: string;
    entityType?: string;
}

export interface OrmEntity extends Entity {

}