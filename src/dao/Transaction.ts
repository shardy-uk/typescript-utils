import {QueryRunner} from "typeorm";
import {createError, ErrorType} from "../errors/Errors";
import {GenericDAO} from "./GenericDAO";
import {GenericOrmDAO} from "./GenericOrmDAO";
import {GenericPouchDAO} from "./GenericPouchDAO";

export type UndoFunction = () => Promise<any>;

/**
 * Transaction Interface
 *
 * This interface defines the contract for transaction management.
 */
export interface Transaction {

    /**
     * Register an undo function to the transaction.
     *
     * This method is used for registering a function that will undo a specific operation if the transaction is rolled back.
     *
     * @param {UndoFunction} undoFunction - The function that will undo a specific operation.
     *
     * @example
     * ```typescript
     * transaction.registerUndo(async () => {
     *     // Undo some operation e.g., delete an inserted record
     * });
     * ```
     */
    registerUndo(undoFunction: UndoFunction): void;

    /**
     * Rollback the transaction.
     *
     * This method will undo all registered operations in reverse order of their registration. It should be used when an operation within the transaction fails and you want to revert to the initial state.
     *
     * @returns {Promise<void>} A Promise that will be resolved when all undo functions have been executed.
     *
     * @example
     * ```typescript
     * try {
     *     // Perform some operations
     * } catch (error) {
     *     await transaction.rollback();
     * }
     * ```
     */
    rollback(): Promise<void>;

    /**
     * Commit the transaction.
     *
     * This method should be called when all operations within the transaction are successful. It may also perform any necessary clean-up activities.
     *
     * @returns {Promise<void>} A Promise that will be resolved when the transaction has been successfully committed.
     *
     * @example
     * ```typescript
     * try {
     *     // Perform some operations
     *     await transaction.commit();
     * } catch (error) {
     *     await transaction.rollback();
     * }
     * ```
     */
    commit(): Promise<void>;

    /**
     * Release any resources held by the transaction.
     *
     * This method should be called after a commit or rollback to ensure that any resources held by the transaction are released.
     *
     * @returns {Promise<void>} A Promise that will be resolved when all resources have been released.
     *
     * @example
     * ```typescript
     * try {
     *     // Perform some operations
     *     await transaction.commit();
     * } finally {
     *     await transaction.release();
     * }
     * ```
     */
    release(): Promise<void>;
}

export class TransactionManager {
    public static createTransaction(dao: GenericDAO<any>): Transaction {
        if (dao instanceof GenericPouchDAO) {
            return new PouchTransaction();
        } else if (dao instanceof GenericOrmDAO) {
            if (!dao || !dao.getQueryRunner()) {
                throw createError(ErrorType.DatabaseError, `No Query Runner available in DAO`);
            }
            return new TypeORMTransactionWrapper(dao.getQueryRunner());
        } else {
            throw createError(ErrorType.DatabaseError, `DAO Type not recognised: ${typeof dao}`);
        }
    }
}

export class PouchTransaction implements Transaction {
    private undoFunctions: UndoFunction[] = [];

    registerUndo(undoFunction: UndoFunction) {
        this.undoFunctions.push(undoFunction);
    }

    async rollback() {
        try {
            for (const undo of this.undoFunctions.reverse()) {
                await undo();
            }
        } catch (error: any) {
            throw createError(ErrorType.RollbackError, `Failed during rollback: ${error.message}`, error);
        }
    }

    commit() {
        // No-op as nothing to do here with PouchDB
        return Promise.resolve();
    }

    release() {
        this.undoFunctions = [];
        return Promise.resolve();
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
            throw createError(ErrorType.RollbackError, 'Failed to rollback transaction:', error);
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
        if (this.queryRunner) {
            return this.queryRunner.release();
        } else {
            return Promise.resolve();
        }
    }

    private async start() {
        await this.queryRunner.connect();
        await this.queryRunner.startTransaction();
    }

}
