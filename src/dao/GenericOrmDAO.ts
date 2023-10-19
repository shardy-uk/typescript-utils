import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    EntityManager,
    OptimisticLockVersionMismatchError,
    PrimaryGeneratedColumn,
    Repository,
    UpdateDateColumn,
    VersionColumn
} from "typeorm";
import {createError, ErrorType} from "../errors/Errors";
import {DateUtils} from "../utils/DateUtils";
import {GenericDAO} from "./GenericDAO";

export class GenericOrmDAO<D extends GenericOrmDoc> implements GenericDAO<D> {
    private repository: Repository<D>;
    private mutex: Mutex = new Mutex();

    constructor(
        private readonly entity: new () => D,
        private readonly entityManager: EntityManager,
        private readonly appVersion: string
    ) {
        this.repository = this.entityManager.getRepository<D>(entity);
    }

    async create(doc: D): Promise<D> {
        doc.createdDate = DateUtils.nowISO();
        doc.appVersion = this.appVersion;
        return await this.repository.save(doc);
    }

    async getOne(id: string): Promise<D> {
        const result = await this.repository
            .createQueryBuilder("entity")
            .where("entity.id = :id", {id})
            .getOne();

        if (!result) {
            throw createError(ErrorType.DatabaseGetError, 'Error retrieving document in getOne: ' + id);
        }

        return result;
    }

    async getAll(): Promise<D[]> {
        return await this.repository.find();
    }

    async update(doc: D): Promise<D> {
        doc.updatedDate = DateUtils.nowISO();
        await this.repository.save(doc);
        return doc;
    }

    async delete(id: string): Promise<void | string> {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            return `No entity found with id: ${id}`;
        }
    }

    async getNextSequenceId(counterDocId: string, maxRetries: number = 200): Promise<number> {
        for (let retries = 0; retries < maxRetries; retries++) {
            let counterDoc;

            const unlock = await this.mutex.lock();
            try {
                try {
                    counterDoc = await this.repository.manager
                        .createQueryBuilder(Counter, "counter")
                        .where("counter.name = :name", {name: counterDocId})
                        .getOne();
                } catch (error: any) {
                    throw createError(ErrorType.DatabaseGetError, `Failed to get counter doc ${counterDocId}`, error);
                }

                if (!counterDoc) {
                    counterDoc = new Counter(counterDocId, 0);
                }

                counterDoc.seq++;

                try {
                    counterDoc = await this.repository.manager.save(Counter, counterDoc);
                    return counterDoc.seq;
                } catch (error: any) {
                    if (error instanceof OptimisticLockVersionMismatchError) {
                        console.log(`Version Mismatch: Expected = ${error}`);
                        // Conflict detected, retrying
                        continue;
                    }
                    throw createError(ErrorType.DatabaseUpdateError, `Failed to update counter doc ${counterDocId}`, error);
                }
            } finally {
                unlock();
            }
        }

        throw createError(ErrorType.DatabaseError, `Exceeded max retries (${maxRetries}) while trying to get next sequence ID for ${counterDocId}`);
    }


    async getMany(ids: string[]): Promise<D[]> {
        return await this.repository
            .createQueryBuilder("entity")
            .whereInIds(ids)
            .getMany();
    }

    async findByField(fieldName: string, value: any): Promise<D[]> {
        return await this.repository
            .createQueryBuilder("entity")
            .where(`entity.${fieldName} = :value`, {value})
            .getMany();
    }
}


export abstract class GenericOrmDoc extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column({type: "varchar"})
    appVersion?: string;

    @CreateDateColumn({type: "varchar", nullable: true})
    createdDate?: string;

    @UpdateDateColumn({type: "varchar", nullable: true})
    updatedDate?: string;
}

@Entity('Counters')  // Defines the table name
export class Counter extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;  // The unique ID of the counter
    @Column('varchar')
    name: string;
    @Column('int')
    seq: number;  // The current sequence number
    @VersionColumn()
    version: number;

    constructor(name: string, seq: number) {
        super();
        this.name = name;
        this.seq = seq;
        this.version = 1;
    }
}

class Mutex {
    private mutex = Promise.resolve();

    lock(): PromiseLike<() => void> {
        // noinspection JSUnusedLocalSymbols
        let begin: (unlock: () => void) => void = unlock => {
        };

        this.mutex = this.mutex.then(() => {
            return new Promise(begin);
        });

        return new Promise(res => {
            begin = res;
        });
    }

    unlock() {
        this.mutex = Promise.resolve();
    }
}
