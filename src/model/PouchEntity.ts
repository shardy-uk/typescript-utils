import {Entity} from "./Entity";

export interface PouchEntity extends Entity {
    revision?: string;
    entityType?: string;
}