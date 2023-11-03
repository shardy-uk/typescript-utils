import {GenericDoc} from "../types/DbTypes";
import {Entity} from "../../../model/Entity";

export interface GenericMapper {
    /**
     * Converts a DB document to a domain model.
     *
     * @param {GenericDoc} dbDoc - The DB document to convert.
     * @returns {Entity} The converted domain model.
     */
    toDomain(dbDoc: GenericDoc): Entity;

    /**
     * Converts a domain model to a DB document.
     *
     * @param {Entity} domainDoc - The domain model to convert.
     * @returns {GenericDoc} The converted DB document.
     */
    toDB(domainDoc: Entity): GenericDoc;
}