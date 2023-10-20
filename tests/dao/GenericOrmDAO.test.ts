import {Column, DataSource, Entity} from "typeorm";
import {GenericDAO} from "../../src/dao/GenericDAO";
import {Counter, GenericOrmDAO, GenericOrmDoc} from "../../src/dao/GenericOrmDAO";

@Entity()
export class ExampleDoc extends GenericOrmDoc {
    @Column("varchar")
    name: string | undefined;

    @Column("varchar")
    value: string | undefined;
}

describe('GenericOrmDAO', () => {
    let dataSource: DataSource;
    let genericDAO: GenericDAO<ExampleDoc>;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [GenericOrmDoc, Counter, ExampleDoc],
            synchronize: true
        });
        await dataSource.initialize();

        genericDAO = new GenericOrmDAO(ExampleDoc, dataSource.manager, "0.0.1-alpha");
    });

    afterEach(async () => {
        await dataSource.destroy();
    });
    describe('GenericOrmDAO', () => {

        it('creates and retrieves a document', async () => {
            const doc = new ExampleDoc();
            doc.name = "SomeThing";
            doc.value = "Some Value";

            const [savedEntity] = await genericDAO.create(doc);
            expect(savedEntity.id).toBeTruthy();

            const retrievedDoc = await genericDAO.getOne(savedEntity.id!);
            expect(retrievedDoc.id).toBe(savedEntity.id);
            expect(retrievedDoc.appVersion).toBe("0.0.1-alpha");
            expect(retrievedDoc.value).toBe(doc.value);
        });

        it('updates a document', async () => {
            const doc = new ExampleDoc();
            doc.name = "SomeThing";
            doc.value = "Some Value";
            const [savedEntity] = await genericDAO.create(doc);
            savedEntity.value = "Updated Value";

            const [updatedEntity] = await genericDAO.update(savedEntity);

            const retrievedDoc = await genericDAO.getOne(updatedEntity.id!);
            expect(retrievedDoc.value).toBe("Updated Value");
        });

        it('deletes a document', async () => {
            const doc = new ExampleDoc();
            doc.name = "SomeThing";
            doc.value = "Some Value";
            const [savedEntity] = await genericDAO.create(doc);

            let docs = await genericDAO.getAll();
            expect(docs.length).toEqual(1);

            await genericDAO.delete(savedEntity.id!);

            docs = await genericDAO.getAll();
            expect(docs.length).toEqual(0);
        });

        it('retrieves multiple documents with getMany', async () => {
            const doc1 = new ExampleDoc();
            doc1.name = "SomeThing1";
            doc1.value = "Some Value 1";

            const doc2 = new ExampleDoc();
            doc2.name = "SomeThing2";
            doc2.value = "Some Value 2";

            const [savedEntity1] = await genericDAO.create(doc1);
            const [savedEntity2] = await genericDAO.create(doc2);

            const retrievedDocs = await genericDAO.getMany([savedEntity1.id!, savedEntity2.id!]);

            expect(retrievedDocs.length).toBe(2);

            const values = retrievedDocs.map(doc => doc.value);
            expect(values).toContain("Some Value 1");
            expect(values).toContain("Some Value 2");

        });

        it('finds by field', async () => {
            const doc1 = new ExampleDoc();
            doc1.name = "SomeThing1";
            doc1.value = "Some Value 1";

            const doc2 = new ExampleDoc();
            doc2.name = "SomeThing2";
            doc2.value = "Some Value 2";

            await genericDAO.create(doc1);
            await genericDAO.create(doc2);

            const retrievedDocs = await genericDAO.findByField("value", "Some Value 2")
            const docs = await genericDAO.getAll();
            expect(docs.length).toEqual(2);

            expect(retrievedDocs.length).toBe(1);
            expect(retrievedDocs[0].name).toEqual("SomeThing2");
        });
    });

    test('fetches and increments a sequence counter without duplicates', async () => {
        const NUM_CONCURRENT_CALLS = 50;
        // noinspection DuplicatedCode
        const counterDocId = 'counter';

        const promises = Array.from({length: NUM_CONCURRENT_CALLS}).map(() =>
            genericDAO.getNextSequenceId(counterDocId)
        );

        const sequenceNumbers = await Promise.all(promises);
        const uniqueSequenceNumbers = Array.from(new Set(sequenceNumbers));
        expect(sequenceNumbers.length).toBe(uniqueSequenceNumbers.length);

        const expectedSet = new Set(
            Array.from({length: NUM_CONCURRENT_CALLS}, (_, i) => i + 1)
        );
        expect(new Set(sequenceNumbers)).toEqual(expectedSet);
    });
});
