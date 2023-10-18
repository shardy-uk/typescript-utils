export class ChainedError extends Error {
    public parentError?: Error;

    constructor(message: string, parentError?: Error) {
        super(parentError ? `${message} | Caused by: ${parentError.message}` : message);
        this.parentError = parentError;
        // Set the prototype explicitly (TypeScript requirement)
        Object.setPrototypeOf(this, ChainedError.prototype);

        if (this.parentError) {
            this.stack = `${this.stack}\nCaused by: \n${this.parentError.stack}`;
        }
    }
}

export class CredentialsError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        // Set the prototype explicitly (TypeScript requirement)
        Object.setPrototypeOf(this, CredentialsError.prototype);
    }
}

export class BulkSaveError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        // Set the prototype explicitly (TypeScript requirement)
        Object.setPrototypeOf(this, BulkSaveError.prototype);
    }
}

export class UserExists extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, UserExists.prototype);
    }
}

export class InvalidUserId extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, InvalidUserId.prototype);
    }
}

export class DatabaseGetError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, DatabaseGetError.prototype);
    }
}

export class DatabaseUpdateError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, DatabaseUpdateError.prototype);
    }
}

export class DatabaseDeleteError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, DatabaseDeleteError.prototype);
    }
}

export class DatabaseCreateError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, DatabaseCreateError.prototype);
    }
}

export class DatabaseError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}

export class ValidationError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

// Enum for Error Types
export enum ErrorType {
    ChainedError = 'ChainedError',
    DatabaseGetError = 'DatabaseGetError',
    DatabaseCreateError = 'DatabaseCreateError',
    DatabaseUpdateError = 'DatabaseUpdateError',
    DatabaseDeleteError = 'DatabaseDeleteError',
    ValidationError = 'ValidationError',
    BulkSaveError = 'BulkSaveError',
    CredentialsError = 'CredentialsError',
    UserExists = 'UserExists',
    InvalidUserId = 'InvalidUserId',
    DatabaseError = 'DatabaseError'
}

// Error Factory Function
export function createError(type: ErrorType, message: string, parentError?: Error): Error {
    switch (type) {
        case ErrorType.ChainedError:
            return new ChainedError(message, parentError);
        case ErrorType.DatabaseGetError:
            return new DatabaseGetError(message, parentError);
        case ErrorType.DatabaseCreateError:
            return new DatabaseCreateError(message, parentError);
        case ErrorType.DatabaseUpdateError:
            return new DatabaseUpdateError(message, parentError);
        case ErrorType.DatabaseDeleteError:
            return new DatabaseDeleteError(message, parentError);
        case ErrorType.ValidationError:
            return new ValidationError(message, parentError);
        case ErrorType.DatabaseError:
            return new DatabaseError(message, parentError);
        case ErrorType.BulkSaveError:
            return new BulkSaveError(message, parentError);
        case ErrorType.CredentialsError:
            return new CredentialsError(message, parentError);
        case ErrorType.UserExists:
            return new UserExists(message, parentError);
        case ErrorType.InvalidUserId:
            return new InvalidUserId(message, parentError);
        default:
            return new ChainedError(message, parentError);
    }
}

// Utility Function for Error Handling
export async function handleErrors<T>(asyncFunction: () => Promise<T>, message: string, errorType: ErrorType): Promise<T> {
    try {
        return await asyncFunction();
    } catch (originalError: any) {
        throw createError(errorType, message, originalError);
    }
}