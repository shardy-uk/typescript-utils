import {Entity} from "./Entity";

export interface PouchEntity extends Entity {
    entityType?: string;
}

export interface OrmEntity extends Entity {

}