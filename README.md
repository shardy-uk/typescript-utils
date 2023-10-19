# Typescript Utils

## Table of Contents
1. [DAO](#dao)
## DAO

The DAO (Data Access Object) layer is responsible for abstracting the interaction with the data source. In this project, the DAO layer is implemented using PouchDB.

### Classes

#### `GenericDAO` Interface

This interface defines the standard CRUD operations along with some additional utility methods.

##### Methods

- `create(doc: D): Promise<D>`: Creates a new document of type `D`.
- `getOne(id: string): Promise<D>`: Retrieves a single document by its ID.
- `getAll(): Promise<D[]>`: Retrieves all documents.
- `update(doc: D): Promise<D>`: Updates an existing document.
- `delete(id: string): Promise<void | string>`: Deletes a document by its ID.
- `getNextSequenceId(sequenceId: string): Promise<number>`: Gets the next sequence ID for a given sequence.
- `getMany(ids: string[]): Promise<D[]>`: Retrieves multiple documents by their IDs.
- `findByField(fieldName: string, value: any): Promise<D[]>`: Finds documents by a specific field.

#### `GenericPouchDAO` Class

Implements the `GenericDAO` interface and provides additional functionalities specific to PouchDB.

##### Methods

- `getEntityType(): string`: Returns the entity type associated with the DAO.
- `getNextSequenceId(counterDocId: string): Promise<number>`: Gets the next sequence ID from a counter document.
- `createIndex(field: string): Promise<void>`: Creates an index on a field for optimized querying.
- `getAll(): Promise<D[]>`: Retrieves all documents of the entity type.
- `getOne(docId: string): Promise<D>`: Retrieves a single document by its ID.
- `getMany(docIds: string[]): Promise<D[]>`: Retrieves multiple documents by their IDs.
- `create(doc: D): Promise<D>`: Creates a new document.
- `update(doc: D): Promise<D>`: Updates an existing document.
- `restore(doc: D): Promise<D>`: Restores a deleted document.
- `delete(docId: string): Promise<string>`: Deletes a document by its ID.
- `bulkSave(docs: GenericPouchDoc[]): Promise<GenericPouchDoc[]>`: Performs a bulk save operation on an array of documents.
- `findByField(fieldName: string, value: any): Promise<D[]>`: Finds documents by a specific field.

#### `ValidatingPouchDAO` Class

Extends `GenericPouchDAO` and adds schema validation for documents.

##### Methods

- `getSchema(): Joi.ObjectSchema`: Returns the Joi schema for document validation.
- `create(doc: D): Promise<D>`: Creates a new document with validation.
- `update(doc: D): Promise<D>`: Updates an existing document with validation.

#### `GenericPouchMapper` Class

Provides utility methods for converting between PouchDB documents and domain models.

##### Methods

- `toDomain(dbDoc: GenericPouchDoc): PouchEntity`: Converts a PouchDB document to a domain model.
- `toDB(domainDoc: PouchEntity): GenericPouchDoc`: Converts a domain model to a PouchDB document.

### Interfaces

#### `GenericPouchDoc`

Defines the structure for documents that can be stored in PouchDB.

- `_id?: string`: The document ID.
- `_rev?: string`: The document revision.
- `entityType?: string`: The type of entity.
- `appVersion?: string`: The application version.
- `[key: string]: any`: Additional properties.

#### `IDocTypeProvider`

Defines a method for retrieving the entity type.

- `getEntityType(): string`: Returns the entity type.


## Errors Module

### ChainedError
This class extends JavaScript's native `Error` class. It allows for error chaining, i.e., wrapping one error within another. This is useful for providing context when exceptions propagate through multiple layers of an application.

- **parentError**: Parent error that caused this chained error.

#### CredentialsError
This is a specific type of `ChainedError` used for credential-related errors.

#### BulkSaveError
This is a specific type of `ChainedError` used when a bulk save operation fails.

#### UserExists
This is a specific type of `ChainedError` used when a user already exists in the system.

#### InvalidUserId
This is a specific type of `ChainedError` used when an invalid user ID is provided.

#### Database Errors
- **DatabaseGetError**: When there's an issue getting data from the database.
- **DatabaseUpdateError**: When there's an issue updating data in the database.
- **DatabaseDeleteError**: When there's an issue deleting data from the database.
- **DatabaseCreateError**: When there's an issue creating new data in the database.

### ErrorType
This enum lists all available error types.

### Error Factory Function
- **createError(type, message, parentError)**: Factory function to create new error objects.

### Utility Function for Error Handling
- **handleErrors**: A utility function for handling errors in async functions.

## Model Module

### Entity
The starting point for a domain model. It has a single field `id`.

### PouchEntity
Extends `Entity` and adds `revision` and `entityType` fields.

## Password Module

### PasswordUtils
Utility class for password hashing and verification.

- **hashPassword(password)**: Hashes a password and returns the salt and hashed password.
- **verifyPassword(storedHash, storedSalt, passwordAttempt)**: Verifies a password against a stored hash and salt.

## Utils Module

### StringUtils
Utility class for various string operations.

- **capitalizeFirstLetter**
- **truncateWithEllipsis**
- **toTitleCase**
- **padLeft**
- **padRight**
- **isNullOrEmpty**
- **isValidEmail**
- **replaceAll**
- **removeWhitespace**
- **stripHtmlTags**
- **setIfEmpty**

