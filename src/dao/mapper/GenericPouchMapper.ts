import {GenericPouchDoc} from "../types/DbTypes";
import {PouchEntity} from "../types/DomainTypes";


export class GenericPouchMapper {
    /**
     * Converts a PouchDB document to a domain model.
     *
     * Note: This default implementation only maps the fixed fields `_id`, `_rev`, and `entityType`, `createdDate`, and `updatedDate`  from the database document to the domain model.
     *
     * @param {GenericPouchDoc} dbDoc - The PouchDB document to convert.
     * @returns {PouchEntity} The converted domain model.
     */
    static toDomain(dbDoc: GenericPouchDoc): PouchEntity {
        const {_id, _rev, entityType, createdDate, updatedDate} = dbDoc;
        if (!_id || !_rev || !entityType || !createdDate) {
            throw new Error(`Unable to map object with properties ID: ${_id}, revision: ${_rev}, entityType: ${entityType}, createdDate: ${createdDate}`);
        }
        const domainDoc: PouchEntity = {
            id: _id,
            revision: _rev,
            entityType: entityType,
            createdDate: new Date(createdDate)
        }

        if (updatedDate !== undefined) {
            domainDoc.updatedDate = new Date(updatedDate);
        }
        return domainDoc;
    }

    /**
     * Converts a domain model to a PouchDB document.
     *
     * Note: This default implementation only maps the fixed fields `id`, `revision`, and `entityType`, `createdDate`, and `updatedDate`  from the domain model to the database document.
     *
     * @param {PouchEntity} domainDoc - The domain model to convert.
     * @returns {GenericPouchDoc} The converted PouchDB document.
     */
    static toDB(domainDoc: PouchEntity): GenericPouchDoc {
        const {id, revision, entityType, createdDate, updatedDate} = domainDoc;

        // Initialize the object with the _id and _rev fields
        const dbDoc: GenericPouchDoc = {_id: id, _rev: revision, entityType: entityType};

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