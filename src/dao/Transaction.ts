import {QueryRunner} from "typeorm";
import {createError, ErrorType} from "../errors/Errors";
import {GenericDAO} from "./GenericDAO";
import {GenericOrmDAO} from "./GenericOrmDAO";
import {GenericPouchDAO} from "./GenericPouchDAO";

export type UndoFunction = () => Promise<any>;

export interface Transaction {
    registerUndo(undoFunction: UndoFunction): void;

    rollback(): void;

    commit(): void;

    release(): void;
}

export class TransactionManager {
    public static createTransaction(dao: GenericDAO<any>): Transaction {
        if (dao instanceof GenericPouchDAO) {
            return new PouchTransaction();
        } else if (dao instanceof GenericOrmDAO) {
            return new TypeORMTransactionWrapper(dao.getQueryRunner());
        } else {
            throw new Error("Unsupported DAO type");
        }
    }
}

export class PouchTransaction implements Transaction {
    private undoFunctions: UndoFunction[] = [];

    registerUndo(undoFunction: UndoFunction) {
        this.undoFunctions.push(undoFunction);
    }

    async rollback() {
        for (const undo of this.undoFunctions.reverse()) {
            await undo();
        }
    }

    commit() {
        // No-op as nothing to do here with PouchDB
    }

    release() {
        this.undoFunctions = [];
    }
}


export class TypeORMTransactionWrapper implements Transaction {
    private undoFunctions: UndoFunction[] = [];

    constructor(public readonly queryRunner: QueryRunner) {
        this.start().catch(async error => {
            if (this.queryRunner) {
                await this.queryRunner.release();
            }
            throw createError(ErrorType.DatabaseError, 'Failed to start transaction:', error);
        });
    }

    registerUndo(undoFunction: UndoFunction) {
        this.undoFunctions.push(undoFunction);
    }

    async rollback() {
        try {
            await this.queryRunner.rollbackTransaction();
            for (const undo of this.undoFunctions.reverse()) {
                await undo();
            }
        } catch (error: any) {
            throw createError(ErrorType.DatabaseError, 'Failed to rollback transaction:', error);
        } finally {
            await this.release();
        }
    }

    async commit() {
        try {
            await this.queryRunner.commitTransaction();
        } catch (error: any) {
            throw createError(ErrorType.DatabaseError, 'Failed to commit transaction:', error);
        } finally {
            await this.release();
        }
    }

    release() {
        return this.queryRunner.release();
    }

    private async start() {
        await this.queryRunner.connect();
        await this.queryRunner.startTransaction();
    }

}
