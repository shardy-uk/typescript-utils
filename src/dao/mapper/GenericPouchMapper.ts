import {GenericPouchDoc} from "../GenericPouchDAO";
import {PouchEntity} from "../../model/PouchEntity";

export class GenericPouchMapper {
    /**
     * Converts a PouchDB document to a domain model.
     *
     * Note: This default implementation only maps the fixed fields `_id`, `_rev`, and `entityType` from the database document to the domain model.
     *
     * @param {GenericPouchDoc} dbDoc - The PouchDB document to convert.
     * @returns {PouchEntity} The converted domain model.
     */
    static toDomain(dbDoc: GenericPouchDoc): PouchEntity {
        const {_id, _rev, entityType, appVersion} = dbDoc;
        if (!_id || !_rev || !entityType) {
            throw new Error(`Unable to map object with properties ID: ${_id} revision: ${_rev} entityType: ${entityType}`);
        }
        return {id: _id, revision: _rev, entityType: entityType, appVersion: appVersion};
    }

    /**
     * Converts a domain model to a PouchDB document.
     *
     * Note: This default implementation only maps the fixed fields `id`, `revision`, and `entityType` from the domain model to the database document.
     *
     * @param {PouchEntity} domainDoc - The domain model to convert.
     * @returns {GenericPouchDoc} The converted PouchDB document.
     */
    static toDB(domainDoc: PouchEntity): GenericPouchDoc {
        const {id, revision, entityType, appVersion} = domainDoc;
        return {_id: id, _rev: revision, entityType: entityType, appVersion: appVersion};
    }
}