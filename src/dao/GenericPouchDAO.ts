import {v4 as uuidv4} from 'uuid';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import Database = PouchDB.Database;
import Joi from "joi";
const packageJson = require('../../package.json');
import {createError, ErrorType} from "../errors/Errors";
import {GenericDAO} from "./GenericDAO";
import {StringUtils} from "../utils/StringUtils";

PouchDB.plugin(PouchDBFind);

export class GenericPouchDAO<D extends GenericPouchDoc> implements GenericDAO<D>, IDocTypeProvider {
    private readonly db: Database;
    private readonly entityType: string;

    constructor(db: Database, entityType: string) {
        this.db = db || new PouchDB(process.env.DB_NAME!);
        this.entityType = entityType;
    }

    getEntityType(): string {
        return this.entityType;
    }

    /**
     * Gets the next sequence ID from a counter document.
     * @async
     * @param {string} counterDocId - The counter document ID.
     * @returns {Promise<number>} A promise that resolves to the next sequence ID.
     */
    async getNextSequenceId(counterDocId: string): Promise<number> {
        let counterDoc: { _id: string; seq: number; };
        try {
            counterDoc = await this.db.get(counterDocId);
        } catch (error: any) {
            if (error.name === 'not_found') {
                counterDoc = {
                    _id: counterDocId,
                    seq: 0,
                };
                try {
                    await this.db.put(counterDoc);
                } catch (error: any) {
                    if (error.name === 'conflict') {
                        return this.getNextSequenceId(counterDocId);
                    } else {
                        throw error;
                    }
                }
            } else {
                throw error;
            }
        }

        counterDoc.seq++;
        try {
            await this.db.put(counterDoc);
        } catch (error: any) {
            if (error.name === 'conflict') {
                return this.getNextSequenceId(counterDocId);
            } else {
                throw error;
            }
        }
        return counterDoc.seq;
    }

    /**
     * Creates an index on a field, this is advantageous for any field you run findByField on
     * @async
     * @param {string} field - The field name.
     */
    async createIndex(field: string): Promise<void> {
        try {
            await this.db.createIndex({
                index: {
                    fields: ['entityType', field]
                }
            });
        } catch (err: any) {
            throw createError(ErrorType.DatabaseError, `Error creating index: ${field} - ${err.message}`, err);
        }
    }

    /**
     * Retrieves all documents of the entity type.
     * @async
     * @returns A promise that resolves to an array of documents.
     */
    async getAll(): Promise<D[]> {
        try {
            const results = await this.db.find({selector: {entityType: this.entityType}});
            return results.docs as D[];
        } catch (error: any) {
            throw createError(ErrorType.DatabaseGetError, 'Error retrieving all documents in getAll', error);
        }
    }

    /**
     * Retrieves a single document by its ID.
     * @async
     * @param {string} docId - The document ID.
     * @returns A promise that resolves to the document.
     */
    async getOne(docId: string): Promise<D> {
        try {
            const doc = await this.db.get(docId);
            return doc as D;
        } catch (error: any) {
            throw createError(ErrorType.DatabaseGetError, 'Error retrieving document in getOne: ' + docId, error);
        }
    }

    /**
     * Retrieves multiple documents by their IDs.
     * @async
     * @param {string[]} docIds - An array of document IDs.
     * @returns A promise that resolves to an array of documents.
     */
    async getMany(docIds: string[]): Promise<D[]> {
        try {
            const response = await this.db.allDocs({
                keys: docIds,
                include_docs: true,
            }) as AllDocsResponse<GenericPouchDoc>;

            const missingDocIds: string[] = [];
            const validDocs: D[] = [];

            response.rows.forEach((row: any, index) => {
                if (row.error) {
                    missingDocIds.push(docIds[index]);
                } else if (row.doc) {
                    validDocs.push(row.doc as D);
                }
            });
            if (missingDocIds.length > 0) {
                // noinspection ExceptionCaughtLocallyJS
                throw createError(ErrorType.DatabaseGetError, `Error retrieving documents in getMany. Missing docIds: ${missingDocIds.join(", ")}`);
            }
            return validDocs;
        } catch (error: any) {
            throw createError(ErrorType.DatabaseGetError, 'General error in getMany ' + JSON.stringify(docIds), error);
        }
    }


    /**
     * Creates a new document.
     * @async
     * @param doc - The document to create.
     * @returns A promise that resolves to the created document.
     */
    async create(doc: D): Promise<D> {
        try {
            const docWithId = this.populateDefaultFields(doc);
            const response = await this.db.put(docWithId);
            if (response && response.ok) {
                return this.getOne(response.id);
            } else {
                // noinspection ExceptionCaughtLocallyJS
                throw createError(ErrorType.DatabaseCreateError, `Unable to create document ${docWithId.entityType} with ID: ${docWithId._id}`);
            }
        } catch (error: any) {
            throw createError(ErrorType.DatabaseCreateError, 'Create error: ' + error.message, error);
        }
    }

    /**
     * Updates an existing document by its ID.
     * @async
     * @param doc - The updated document.
     * @returns A promise that resolves to the updated document.
     */
    async update(doc: D): Promise<D> {
        if (!doc || !doc._id) {
            throw createError(ErrorType.ValidationError, "Update called, but no document ID provided");
        }
        try {
            const existingDoc: GenericPouchDoc = await this.db.get(doc._id);
            const updatedDoc = {...existingDoc, ...doc, _rev: existingDoc._rev};
            await this.db.put(updatedDoc);
            return this.getOne(doc._id);
        } catch (error: any) {
            let message = `Exception thrown in GenericPouchDAO.update: ${error.message} - `
            if (error.name === 'conflict') {
                message += "Update Conflict, _rev does not match DB value";
            }
            throw createError(ErrorType.DatabaseUpdateError, message, error);
        }
    }

    /**
     * Restores a deleted document by its ID.
     * @async
     * @returns A promise that resolves to the restored document or null if the document cannot be restored.
     * @param doc The deleted document to restore
     */
    async restore(doc: D): Promise<D> {
        try {
            // Remove the _deleted flag and save the document again
            if ((doc as any)._deleted) {
                delete (doc as any)._deleted;
            }

            await this.db.put(doc);
            return this.getOne(doc._id!);
        } catch (error: any) {
            throw createError(ErrorType.DatabaseError, `Failed to restore document with ID: ${doc._id}`, error);
        }
    }

    /**
     * Deletes a document by its ID.
     * @async
     * @param {string} docId - The document ID.
     * @returns {Promise<string>} A promise that resolves to the deleted documents _rev.
     */
    async delete(docId: string): Promise<string> {
        try {
            const existingDoc = await this.db.get(docId);
            return (await this.db.remove(existingDoc)).rev;
        } catch (error: any) {
            throw createError(ErrorType.DatabaseDeleteError, 'Error deleting document', error);
        }
    }

    /**
     * !!! CAUTION - Ensure entityType is manually set correctly on each array item if mixing entities in the array !!!
     * Performs a bulk save operation on an array of documents, will use the default DocType of the DAO if not set in each GenericPouchDoc.
     *
     * @async
     * @param {GenericPouchDoc[]} docs - The array of documents to save.
     * @returns {Promise<GenericPouchDoc[]>} A promise that resolves to an array of the saved documents.
     *
     * @throws Will throw BulkSaveError if the bulk save operation fails for any document. contains both successful and failed docids
     *
     * @example
     * const savedDocs = await bulkSave([{ field1: 'value1', entityType: 'Type1' }, { field2: 'value2', entityType: 'Type2' }]);
     *
     * @warning
     * Make sure to provide the correct `entityType` for each document in the array.
     * Failing to do so can lead to incorrect data being saved in the database.
     */
    async bulkSave(docs: GenericPouchDoc[]): Promise<GenericPouchDoc[]> {
        try {
            const docsToSave = docs.map(doc => this.populateDefaultFields(doc));
            const response = await this.db.bulkDocs(docsToSave);

            const failedDocs = response.filter((doc: any) => doc.error === true);
            const successIds = response.filter((doc: any) => !doc.error).map((doc: any) => doc.id);

            if (failedDocs.length > 0) {
                // noinspection ExceptionCaughtLocallyJS
                throw createError(ErrorType.BulkSaveError, 'Bulk save failed for some documents: ' + JSON.stringify(failedDocs));
            } else {
                return docsToSave.map((doc, index) => ({...doc, _id: successIds[index]})) as GenericPouchDoc[];
            }
        } catch (error: any) {
            throw createError(ErrorType.BulkSaveError, 'Failed to save documents in bulk', error);
        }
    }

    /**
     * Finds documents by a field's value. Almost certainly wants an index creating on these fields
     * @async
     * @param {string} fieldName - The field name.
     * @param {any} value - The field value.
     * @returns A promise that resolves to an array of documents.
     */
    async findByField(fieldName: string, value: any): Promise<D[]> {
        try {
            const result = await this.db.find({
                selector: {
                    entityType: this.entityType,
                    [fieldName]: value
                }
            });
            return result.docs as D[];
        } catch (error: any) {
            throw createError(ErrorType.DatabaseGetError, `Failed to find by field: ${fieldName} : ${value}`, error);
        }
    }

    /**
     * Populates or overwrites the `_id` and `entityType` properties of a given document.
     *
     * This method ensures that each document has a unique `_id` and an `entityType` for proper identification.
     * It uses the UUID v4 algorithm to generate a unique `_id` if one is not already present or if it is set to GenericPouchDAO.NEWDOC.
     * The `entityType` is set to the DAO's entity type if not already defined in the document or if it is set to GenericPouchDAO.NEWDOC.
     *
     * @param doc - The document to be populated or overwritten.
     * @returns The document with populated or overwritten `_id` and `entityType`.
     *
     * @example
     * const userDoc = { _id: "", entityType: "", name: 'John', email: 'john@example.com' };
     * const populatedUserDoc = populateIdAndEntityType(userDoc);
     * // populatedUserDoc will now have new _id and entityType fields based on the type of DAO that is doing the creation, override if mixing document types in the save.
     */
    protected populateDefaultFields(doc: GenericPouchDoc): GenericPouchDoc {
        doc._id = StringUtils.setIfEmpty(doc._id, this.entityType + uuidv4());
        doc.entityType = StringUtils.setIfEmpty(doc.entityType, this.entityType);
        doc.appVersion = StringUtils.setIfEmpty(doc.appVersion, packageJson.version);
        return doc;
    }
}

export abstract class ValidatingPouchDAO<D extends GenericPouchDoc> extends GenericPouchDAO<D> {
    abstract getSchema(): Joi.ObjectSchema;

    async create(doc: D): Promise<D> {
        const docWithId = this.populateDefaultFields(doc);
        const validation = this.getSchema().validate(docWithId);
        if (validation.error) {
            throw createError(ErrorType.ValidationError, `Validation failed: ${validation.error.details.map(d => d.message).join(', ')}`);
        }
        return super.create(doc);
    }

    async update(doc: D): Promise<D> {
        const validation = this.getSchema().validate(doc);
        if (validation.error) {
            throw createError(ErrorType.ValidationError, `Validation failed: ${validation.error.details.map(d => d.message).join(', ')}`);
        }
        return super.update(doc);
    }
}


export interface GenericPouchDoc {
    _id?: string;
    _rev?: string;
    entityType?: string;
    appVersion: string;
    [key: string]: any;
}

interface AllDocsResponse<T> {
    total_rows: number;
    offset: number;
    rows: Array<{ id: string; key: string; value: { rev: string }; doc?: T }>;
}

export interface IDocTypeProvider {
    getEntityType(): string;
}

