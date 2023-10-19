// Base class for all chained errors
export class ChainedError extends Error {
    public parentError?: Error;

    constructor(message: string, parentError?: Error, name: string = "ChainedError") {
        super(parentError ? `${message} | Caused by: ${parentError.message}` : message);
        this.parentError = parentError;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        if (this.parentError) {
            this.stack = `${this.stack}\n### Caused by: ###\n${this.parentError.stack}`;
        }
    }
}

// Derived error classes
export class VerificationError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "VerificationError");
    }
}

export class HashingError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "HashingError");
    }
}

export class BulkSaveError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "BulkSaveError");
    }
}

export class UserExists extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "UserExists");
    }
}

export class InvalidUserId extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "InvalidUserId");
    }
}

export class DatabaseGetError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "DatabaseGetError");
    }
}

export class DatabaseUpdateError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "DatabaseUpdateError");
    }
}

export class DatabaseDeleteError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "DatabaseDeleteError");
    }
}

export class DatabaseCreateError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "DatabaseCreateError");
    }
}

export class DatabaseError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "DatabaseError");
    }
}

export class ValidationError extends ChainedError {
    constructor(message: string, parentError?: Error) {
        super(message, parentError, "ValidationError");
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
    VerificationError = 'VerificationError',
    HashingError = 'HashingError',
    UserExists = 'UserExists',
    InvalidUserId = 'InvalidUserId',
    DatabaseError = 'DatabaseError'
}

// Error Class Map
const ErrorClassMap: Record<ErrorType, typeof ChainedError> = {
    [ErrorType.ChainedError]: ChainedError,
    [ErrorType.DatabaseGetError]: DatabaseGetError,
    [ErrorType.DatabaseCreateError]: DatabaseCreateError,
    [ErrorType.DatabaseUpdateError]: DatabaseUpdateError,
    [ErrorType.DatabaseDeleteError]: DatabaseDeleteError,
    [ErrorType.VerificationError]: VerificationError,
    [ErrorType.ValidationError]: ValidationError,
    [ErrorType.BulkSaveError]: BulkSaveError,
    [ErrorType.HashingError]: HashingError,
    [ErrorType.UserExists]: UserExists,
    [ErrorType.InvalidUserId]: InvalidUserId,
    [ErrorType.DatabaseError]: DatabaseError
};

// Error Factory Function
export function createError(type: ErrorType, message: string, parentError?: Error): Error {
    const ErrorClass = ErrorClassMap[type] || ChainedError;
    return new ErrorClass(message, parentError);
}

// Utility Function for Error Handling
export async function handleErrors<T>(asyncFunction: () => Promise<T>, message: string, errorType: ErrorType): Promise<T> {
    try {
        return await asyncFunction();
    } catch (originalError: unknown) {
        if (originalError instanceof Error) {
            throw createError(errorType, message, originalError);
        }
        throw originalError;
    }
}
