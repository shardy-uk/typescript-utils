import {GenericPouchDoc} from "../types/DbTypes";
import {PouchEntity} from "../types/DomainTypes";
import {GenericMapper} from "./GenericMapper";
import {createError, ErrorType} from "../../errors/Errors";

export class GenericPouchMapper implements GenericMapper {
    constructor() {
    }

    /**
     * Converts a PouchDB document to a domain model.
     *
     * Note: This default implementation maps all fields across to the domain where the attribute names match, but converts _id and _rev to id and revision. Note: createdDate and entityType are required fields
     *
     * @param {GenericPouchDoc} dbDoc - The PouchDB document to convert.
     * @returns {PouchEntity} The converted domain model.
     * @warning No type conversion occurs on fields other than createdDate or updatedDate, so implementers will need to explicitly override where type conversions between Domain and DB are performed
     */
    public toDomain(dbDoc: GenericPouchDoc): PouchEntity {
        const {
            _id,
            _rev,
            entityType,
            appVersion,
            createdDate,
            updatedDate,
            ...otherFields
        } = dbDoc;

        if (!_id || !_rev || !entityType || !createdDate) {
            throw createError(ErrorType.MappingError, `Unable to map object without required properties ID: ${_id}, revision: ${_rev}, entityType: ${entityType}, createdDate: ${createdDate}`);
        }
        const domainDoc: PouchEntity = {
            id: _id,
            revision: _rev,
            entityType: entityType,
            createdDate: new Date(createdDate),
            ...otherFields
        }

        if (updatedDate !== undefined) {
            domainDoc.updatedDate = new Date(updatedDate);
        }
        return domainDoc;
    }

    /**
     * Converts a domain model to a PouchDB document.
     *
     * Note: This default implementation maps all fields across to the DB where the attribute names match, but converts _id and _rev to id and revision from the domain model to the database document.
     *
     * @param {PouchEntity} domainDoc - The domain model to convert.
     * @returns {GenericPouchDoc} The converted PouchDB document.
     * @warning No type conversion occurs on fields other than createdDate or updatedDate, so implementers will need to explicitly override where type conversions between Domain and DB are performed
     */
    public toDB(domainDoc: PouchEntity): GenericPouchDoc {
        const {id, revision, entityType, createdDate, updatedDate, ...otherFields} = domainDoc;

        // Initialize the object with the _id and _rev fields
        const dbDoc: GenericPouchDoc = {_id: id, _rev: revision, entityType: entityType, ...otherFields};

        // Conditionally include createdDate if it's not undefined
        if (createdDate !== undefined) {
            dbDoc.createdDate = createdDate.toISOString();
        }

        // Conditionally include updatedDate if it's not undefined
        if (updatedDate !== undefined) {
            dbDoc.updatedDate = updatedDate.toISOString();
        }

        return dbDoc as GenericPouchDoc;
    }

}