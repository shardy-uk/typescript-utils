import {GenericPouchDoc} from "../types/DbTypes";
import {PouchEntity} from "../../../model/DomainTypes";
import {GenericMapper} from "./GenericMapper";
import {createError, ErrorType} from "../../../errors/Errors";

export class GenericPouchMapper implements GenericMapper {
    constructor() {
    }

    /**
     * Converts a PouchDB document to a domain model.
     *
     * Note: This default implementation only maps the fixed fields `_id`, `_rev`, and `entityType`, `createdDate`, and `updatedDate`  from the database document to the domain model.
     *
     * @param {GenericPouchDoc} dbDoc - The PouchDB document to convert.
     * @returns {PouchEntity} The converted domain model.
     */
    public toDomain(dbDoc: GenericPouchDoc): PouchEntity {
        const {
            _id,
            _rev,
            entityType,
            createdDate,
            updatedDate
        } = dbDoc;

        if (!_id || !_rev || !entityType || !createdDate) {
            throw createError(ErrorType.MappingError, `Unable to map object without required properties ID: ${_id}, revision: ${_rev}, entityType: ${entityType}, createdDate: ${createdDate}`);
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
    public toDB(domainDoc: PouchEntity): GenericPouchDoc {
        const {
            id,
            revision,
            entityType,
            createdDate,
            updatedDate
        } = domainDoc;

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

export class GenericPouchExpandingMapper extends GenericPouchMapper {
    /**
     * Converts a PouchDB document to a domain model.
     *
     * Note: This default implementation maps all fields provided from the database document to the domain model, mapping id & revision to _id & _rev.
     *
     * @param {GenericPouchDoc} dbDoc - The PouchDB document to convert.
     * @returns {PouchEntity} The converted domain model.
     */
    public toDomain(dbDoc: GenericPouchDoc): PouchEntity {
        const superDoc = super.toDomain(dbDoc);
        const otherFields = this.getUnmappedFields(dbDoc, superDoc);
        return {...superDoc, ...otherFields};
    }

    /**
     * Converts a domain model to a PouchDB document.
     *
     * Note: This default implementation maps all fields provided from the domain model to the database document, mapping id & revision to _id & _rev.
     *
     * @param {PouchEntity} domainDoc - The domain model to convert.
     * @returns {GenericPouchDoc} The converted PouchDB document.
     */
    public toDB(domainDoc: PouchEntity): GenericPouchDoc {
        const superDoc = super.toDB(domainDoc);
        const otherFields = this.getUnmappedFields(domainDoc, superDoc);
        return {...superDoc, ...otherFields};
    }

    private getUnmappedFields(original: Record<string, any>, mapped: Record<string, any>): Record<string, any> {
        const mappedKeys = new Set(Object.keys(mapped));
        return Object.fromEntries(
            Object.entries(original).filter(([key]) => !mappedKeys.has(key))
        );
    }
}