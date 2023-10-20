import {Transaction} from "./Transaction";

/**
 * GenericDAO interface for database operations.
 */
export interface GenericDAO<D> {

    /**
     * Creates a new document in the database.
     *
     * @param {D} doc - The document to be created.
     * @returns {Promise<[D, Transaction?]>} A promise that resolves with the created document and an optional Transaction object.
     * @remarks If a Transaction object is provided, the create operation will be part of that transaction.
     */
    create(doc: D): Promise<[D, (Transaction | undefined)?]>;

    /**
     * Retrieves a document from the database by its ID.
     *
     * @param {string} id - The ID of the document to be retrieved.
     * @returns {Promise<D>} A promise that resolves with the retrieved document.
     */
    getOne(id: string): Promise<D>;

    /**
     * Retrieves all documents from the database.
     *
     * @returns {Promise<D[]>} A promise that resolves with an array of all documents.
     */
    getAll(): Promise<D[]>;

    /**
     * Updates an existing document in the database.
     *
     * @param {D} doc - The document to be updated.
     * @returns {Promise<[D, Transaction?]>} A promise that resolves with the updated document and an optional Transaction object.
     * @remarks If a Transaction object is provided, the update operation will be part of that transaction.
     */
    update(doc: D): Promise<[D, (Transaction | undefined)?]>;

    /**
     * Deletes a document from the database by its ID.
     *
     * @param {string} id - The ID of the document to be deleted.
     * @returns {Promise<[string, Transaction?]>} A promise that resolves with a string indicating the outcome and an optional Transaction object.
     * @remarks If a Transaction object is provided, the delete operation will be part of that transaction.
     */
    delete(id: string): Promise<[string, Transaction?]>;

    /**
     * Retrieves the next sequence ID for a given sequence.
     *
     * @param {string} sequenceId - The ID of the sequence.
     * @returns {Promise<number>} A promise that resolves with the next sequence ID.
     */
    getNextSequenceId(sequenceId: string): Promise<number>;

    /**
     * Retrieves multiple documents from the database by their IDs.
     *
     * @param {string[]} ids - An array of IDs of the documents to be retrieved.
     * @returns {Promise<D[]>} A promise that resolves with an array of the retrieved documents.
     */
    getMany(ids: string[]): Promise<D[]>;

    /**
     * Finds documents in the database based on a specific field and value.
     *
     * @param {string} fieldName - The name of the field to be searched.
     * @param {any} value - The value to be matched.
     * @returns {Promise<D[]>} A promise that resolves with an array of documents that match the criteria.
     */
    findByField(fieldName: string, value: any): Promise<D[]>;
}
