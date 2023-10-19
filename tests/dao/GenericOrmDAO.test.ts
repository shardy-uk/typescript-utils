import {Column, DataSource, Entity} from "typeorm";
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
    let genericDAO: GenericOrmDAO<ExampleDoc>;

    beforeAll(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [GenericOrmDoc, Counter, ExampleDoc],
            synchronize: true
        });
        await dataSource.initialize();
    });

    beforeEach(() => {
        genericDAO = new GenericOrmDAO(ExampleDoc, dataSource.manager, "0.0.1-alpha");
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('creates and retrieves a document', async () => {
        const doc = new ExampleDoc();
        doc.name = "SomeThing";
        doc.value = "Some Value";

        const savedEntity = await genericDAO.create(doc);
        expect(savedEntity.id).toBeTruthy();

        const retrievedDoc = await genericDAO.getOne(savedEntity.id!);
        expect(retrievedDoc.id).toBe(savedEntity.id);
        expect(retrievedDoc.appVersion).toBe("0.0.1-alpha");
        expect(retrievedDoc.value).toBe(doc.value);
    });


    it('fetches and increments a sequence counter without duplicates', async () => {
        const NUM_CONCURRENT_CALLS = 200;
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
