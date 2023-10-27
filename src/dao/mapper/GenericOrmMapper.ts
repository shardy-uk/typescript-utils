import {createError, ErrorType} from "../../errors/Errors";
import {GenericOrmDoc} from "../types/DbTypes";
import {OrmEntity} from "../types/DomainTypes";
import {GenericMapper} from "./GenericMapper";

export class GenericOrmMapper implements GenericMapper {
    constructor() {
    }

    /**
     * Converts an ORM document to a domain model one.
     *
     * Note: This default implementation only maps the fixed fields `_id`, `createdDate`, and `updatedDate` from the database document to the domain model.
     *
     * @param {GenericOrmDoc} dbDoc - The TypeORM document to convert.
     * @returns {PouchEntity} The converted domain model.
     */
    public toDomain(dbDoc: GenericOrmDoc): OrmEntity {
        const {_id, createdDate, updatedDate} = dbDoc;
        if (!_id || !createdDate) {
            throw createError(ErrorType.MappingError, `Unable to map object with properties ID: ${_id} createdDate: ${createdDate}`);
        }
        const domainDoc: OrmEntity = {id: _id, createdDate: new Date(createdDate)}

        if (updatedDate !== undefined) {
            domainDoc.updatedDate = new Date(updatedDate);
        }
        return domainDoc;
    }

    /**
     * Converts a domain model object to an ORM document.
     *
     * Note: This default implementation only maps the fixed fields `id`, `createdDate`, and `updatedDate` from the domain model to the database document.
     *
     * @param {PouchEntity} domainDoc - The domain model to convert.
     * @returns {GenericOrmDoc} The converted ORM document.
     */
    public toDB(domainDoc: OrmEntity): GenericOrmDoc {
        const {id, createdDate, updatedDate} = domainDoc;

        // Initialize the object with the _id field
        const dbDoc: Partial<GenericOrmDoc> = {_id: id};

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