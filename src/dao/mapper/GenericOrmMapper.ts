import {createError, ErrorType} from "../../errors/Errors";
import {GenericOrmDoc} from "../types/DbTypes";
import {OrmEntity} from "../types/DomainTypes";
import {GenericMapper} from "./GenericMapper";

export class GenericOrmMapper implements GenericMapper {
    constructor() {
    }

    /**
     * Converts an ORM document to a domain model.
     *
     * Note: This default implementation maps all fields across to the domain where the attribute names match, but converts _id to id. Note: createdDate is a required field
     *
     * @param {GenericOrmDoc} dbDoc - The DB document to convert.
     * @returns {OrmEntity} The converted domain model.
     * @warning No type conversion occurs on fields other than createdDate or updatedDate, so implementers will need to explicitly override where type conversions between Domain and DB are performed
     */
    public toDomain(dbDoc: GenericOrmDoc): OrmEntity {
        const {
            _id,
            appVersion,
            createdDate,
            updatedDate,
            ...otherFields
        } = dbDoc;

        if (!_id || !createdDate) {
            throw createError(ErrorType.MappingError, `Unable to map object with properties ID: ${_id} createdDate: ${createdDate}`);
        }
        const domainDoc: OrmEntity = {id: _id, createdDate: new Date(createdDate), ...otherFields}

        if (updatedDate !== undefined) {
            domainDoc.updatedDate = new Date(updatedDate);
        }
        return domainDoc;
    }

    /**
     * Converts a domain model to an ORM DB document.
     *
     * Note: This default implementation maps all fields across to the DB where the attribute names match, but converts _id to id from the domain model to the database document.
     *
     * @param {OrmEntity} domainDoc - The domain model to convert.
     * @returns {GenericOrmDoc} The converted DB document.
     * @warning No type conversion occurs on fields other than createdDate or updatedDate, so implementers will need to explicitly override where type conversions between Domain and DB are performed
     */
    public toDB(domainDoc: OrmEntity): GenericOrmDoc {
        const {id, createdDate, updatedDate, ...otherFields} = domainDoc;

        // Initialize the object with the _id field
        const dbDoc: Partial<GenericOrmDoc> = {_id: id, ...otherFields};

        // Conditionally include createdDate if it's not undefined
        if (createdDate !== undefined) {
            dbDoc.createdDate = createdDate.toISOString();
        }

        // Conditionally include updatedDate if it's not undefined
        if (updatedDate !== undefined) {
            dbDoc.updatedDate = updatedDate.toISOString();
        }

        return dbDoc as GenericOrmDoc;
    }
}