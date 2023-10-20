import PouchDB from 'pouchdb';
import memoryAdapter from 'pouchdb-adapter-memory';
import {v4 as uuidv4} from 'uuid';
import packageJson from '../../package.json';
import {GenericDAO} from '../../src/dao/GenericDAO';
import {GenericPouchDAO} from '../../src/dao/GenericPouchDAO';
import {TransactionManager} from '../../src/dao/Transaction';
import {TestDoc} from "./TestDoc";

PouchDB.plugin(memoryAdapter);

describe('GenericPouchDAO', () => {
    let db: PouchDB.Database;
    let genericDAO: GenericDAO<TestDoc>;

    beforeEach(() => {
        db = new PouchDB('testDB' + uuidv4(), {adapter: 'memory'});
        genericDAO = new GenericPouchDAO(db, "Test|", packageJson.version);
    });

    afterEach(async () => {
        await db.destroy();
    });

    it('creates and retrieves a document', async () => {
        const doc: TestDoc = {_id: undefined, entityType: undefined, name: "SomeThing", value: 'Some Value', appVersion: '0.0.1-alpha',};
        const [savedEntity] = await genericDAO.create(doc);
        if (!savedEntity._id) {
            fail('doc._id should not be null or undefined');
        }
        const retrievedDoc = await genericDAO.getOne(savedEntity._id);
        expect(retrievedDoc._id).toContain("Test|");
        expect(retrievedDoc.entityType).toBe("Test|");
        expect(retrievedDoc._id).toBe(savedEntity._id);
        expect(retrievedDoc.appVersion).toBe("0.0.1-alpha");
        // @ts-ignore
        expect(retrievedDoc.value).toBe(doc.value);
    });

    it('updates a document', async () => {
        const payload: TestDoc = {_id: "", entityType: "", name: 'test', value: 'Some Value'};
        const [doc] = await genericDAO.create(payload);
        if (!doc._id) {
            fail('doc._id should not be null or undefined');
        }
        expect(doc.appVersion).toBe(packageJson.version);
        const updatedDoc = {...doc, value: 'updated', appVersion: '0.0.1-alpha',};
        await genericDAO.update(updatedDoc);

        const retrievedDoc = await genericDAO.getOne(doc._id);
        expect(retrievedDoc.appVersion).toBe('0.0.1-alpha');
        // @ts-ignore
        expect(retrievedDoc.value).toBe(updatedDoc.value);
    });

    it('deletes a document', async () => {
        const doc: TestDoc = {_id: "", entityType: "", name: 'test', value: 'Some Value'};
        const [savedEntity] = await genericDAO.create(doc);
        if (!savedEntity._id) {
            fail('doc._id should not be null or undefined');
        }
        let docs = await genericDAO.getAll();
        expect(docs.length).toEqual(1);

        await genericDAO.delete(savedEntity._id);
        docs = await genericDAO.getAll();
        expect(docs.length).toEqual(0);
    });

    it('retrieves multiple documents with getMany', async () => {
        // Create a few test documents
        const doc1: TestDoc = {_id: "", entityType: "", name: 'test1', value: 'Some Value 1'};
        const doc2: TestDoc = {_id: "", entityType: "", name: 'test2', value: 'Some Value 2'};
        const doc3: TestDoc = {_id: "", entityType: "", name: 'test3', value: 'Some Value 3'};

        const [id1] = await genericDAO.create(doc1);
        const [id2] = await genericDAO.create(doc2);
        const [id3] = await genericDAO.create(doc3);
        if (!id1._id || !id2._id || !id3._id) {
            fail(`doc._id should not be null`);
        }
        // Use getMany to retrieve the documents
        const ids = [id1._id, id2._id, id3._id];
        const retrievedDocs = await genericDAO.getMany(ids);

        // Validate the results
        expect(retrievedDocs.length).toBe(3);

        // @ts-ignore
        const values = retrievedDocs.map(doc => doc.value);
        expect(values).toContain('Some Value 1');
        expect(values).toContain('Some Value 2');
        expect(values).toContain('Some Value 3');
    });


    it('finds by field', async () => {
        const doc1: TestDoc = {_id: "", entityType: "", name: 'test1', value: 'Some Value'};
        const doc2: TestDoc = {_id: "", entityType: "", name: 'test2', value: 'Different Value', appVersion: '0.0.1-alpha',};
        await genericDAO.create(doc1);
        await genericDAO.create(doc2);

        const results = await genericDAO.findByField('value', 'Different Value');
        expect(results.length).toBe(1);
        // @ts-ignore
        expect(results[0].value).toBe(doc2.value);
    });

    it('fetches and increments a sequence counter without duplicates', async () => {
        const NUM_CONCURRENT_CALLS = 100;
        const counterDocId = 'counter';

        // Start NUM_CONCURRENT_CALLS number of promises for getNextSequenceId() method
        const promises = Array.from({length: NUM_CONCURRENT_CALLS}).map(() => genericDAO.getNextSequenceId(counterDocId));

        // Execute all promises concurrently
        const sequenceNumbers = await Promise.all(promises);

        // Expect sequenceNumbers to contain unique numbers from 1 to NUM_CONCURRENT_CALLS
        const uniqueSequenceNumbers = Array.from(new Set(sequenceNumbers));
        expect(sequenceNumbers.length).toBe(uniqueSequenceNumbers.length);

        // We could also check if the set of sequence numbers matches the expected set
        const expectedSet = new Set(Array.from({length: NUM_CONCURRENT_CALLS}, (_, i) => i + 1));
        expect(new Set(sequenceNumbers)).toEqual(expectedSet);
    });

    describe('GenericPouchDAO', () => {

        it('saves multiple documents in bulk', async () => {
            const pouchDAO = genericDAO as GenericPouchDAO<TestDoc>;
            // Create a few test documents
            const doc1: TestDoc = {_id: "", entityType: "", name: 'test1', value: 'Some Value 1'};
            const doc2: TestDoc = {_id: "", entityType: "", name: 'test2', value: 'Some Value 2'};
            const doc3: TestDoc = {_id: "", entityType: "", name: 'test3', value: 'Some Value 3', appVersion: '0.0.1-alpha',};

            // Perform the bulk save operation
            const [bulkSaveResult] = await pouchDAO.bulkSave([doc1, doc2, doc3]);

            // Validate that the result of the bulk save contains all the docs
            expect(bulkSaveResult.length).toBe(3);

            // Validate that each saved doc has an _id and the correct entityType
            bulkSaveResult.forEach(doc => {
                expect(doc._id).toBeTruthy();
                expect(doc.entityType).toBe("Test|");
            });

            // Fetch all documents from the database to validate
            const allDocs = await pouchDAO.getAll();

            // Validate the number of docs saved in the database
            expect(allDocs.length).toBe(3);

            // Validate that the docs in the database match those we tried to save
            const values = allDocs.map(doc => doc.value);
            expect(values).toContain('Some Value 1');
            expect(values).toContain('Some Value 2');
            expect(values).toContain('Some Value 3');


            // Validate that the docs in the database match those we tried to save
            const versions = allDocs.map(doc => doc.appVersion);
            expect(versions).toContain(packageJson.version);
            expect(versions).toContain('0.0.1-alpha');
        });
    });

    test('fetches and increments a sequence counter without duplicates', async () => {
        const NUM_CONCURRENT_CALLS = 50;
        const counterDocId = 'counter';

        // Start NUM_CONCURRENT_CALLS number of promises for getNextSequenceId() method
        const promises = Array.from({length: NUM_CONCURRENT_CALLS}).map(() => genericDAO.getNextSequenceId(counterDocId));

        // Execute all promises concurrently
        const sequenceNumbers = await Promise.all(promises);

        // Expect sequenceNumbers to contain unique numbers from 1 to NUM_CONCURRENT_CALLS
        const uniqueSequenceNumbers = [...new Set(sequenceNumbers)];
        expect(sequenceNumbers.length).toBe(uniqueSequenceNumbers.length);

        // We could also check if the set of sequence numbers matches the expected set
        const expectedSet = new Set(Array.from({length: NUM_CONCURRENT_CALLS}, (_, i) => i + 1));
        expect(new Set(sequenceNumbers)).toEqual(expectedSet);
    }, 10000);
});

describe('GenericPouchDAO with Transactions', () => {
    let db: PouchDB.Database;
    let genericDAO: GenericDAO<TestDoc>;

    beforeEach(() => {
        db = new PouchDB('testDB' + uuidv4(), {adapter: 'memory'});
        genericDAO = new GenericPouchDAO(db, "Test|", packageJson.version);
    });

    afterEach(async () => {
        await db.destroy();
    });

    it('rolls back a document creation', async () => {
        const transaction = TransactionManager.createTransaction(genericDAO);
        const doc: TestDoc = {
            _id: undefined,
            entityType: undefined,
            name: "ToBeRolledBack",
            value: 'Initial Value',
        };

        await genericDAO.create(doc, transaction);

        let allDocs = await genericDAO.getAll();
        expect(allDocs.length).toBe(1);
        await transaction.rollback();

        allDocs = await genericDAO.getAll();
        expect(allDocs.length).toBe(0);
    });

    it('rolls back a document update', async () => {
        const transaction = TransactionManager.createTransaction(genericDAO);

        const initialDoc: TestDoc = {
            _id: undefined,
            entityType: undefined,
            name: "ToBeUpdated",
            value: 'Initial Value',
        };

        const [createdDoc] = await genericDAO.create(initialDoc);
        const updatedDoc = {...createdDoc, value: 'Updated Value'};

        const [savedDoc] = await genericDAO.update(updatedDoc, transaction);
        expect(savedDoc.value).toBe('Updated Value');

        await transaction.rollback();

        const revertedDoc = await genericDAO.getOne(createdDoc._id!);
        expect(revertedDoc.value).toBe('Initial Value');
        expect(revertedDoc._id).toBe(createdDoc._id);
    });

    it('rolls back a document deletion', async () => {
        const transaction = TransactionManager.createTransaction(genericDAO);

        const doc: TestDoc = {
            _id: undefined,
            entityType: undefined,
            name: "ToBeDeleted",
            value: 'Initial Value',
        };

        const [createdDoc] = await genericDAO.create(doc);

        await genericDAO.delete(createdDoc._id!, transaction);

        let allDocs = await genericDAO.getAll();
        expect(allDocs.length).toBe(0);

        await transaction.rollback();

        allDocs = await genericDAO.getAll();
        expect(allDocs.length).toBe(1);
        expect(allDocs[0]._id).toBe(createdDoc._id);
    });

    it('rolls back multiple operations', async () => {
        const transaction = TransactionManager.createTransaction(genericDAO);

        const doc1: TestDoc = {
            _id: undefined,
            entityType: undefined,
            name: "ToBeUpdated",
            value: 'Initial Value',
        };
        const doc2: TestDoc = {
            _id: undefined,
            entityType: undefined,
            name: "ToBeDeleted",
            value: 'Initial Value',
        };

        const [createdDoc1] = await genericDAO.create(doc1);
        const [createdDoc2] = await genericDAO.create(doc2);

        const updatedDoc = {...createdDoc1, value: 'Updated Value'};

        const [savedDoc] = await genericDAO.update(updatedDoc, transaction);
        await genericDAO.delete(createdDoc2._id!, transaction);
        expect(savedDoc.value).toBe('Updated Value');

        await transaction.rollback();

        const revertedDoc1 = await genericDAO.getOne(createdDoc1._id!);
        const allDocs = await genericDAO.getAll();

        expect(revertedDoc1.value).toBe('Initial Value');
        expect(allDocs.length).toBe(2);
    });
});
