import {GenericPouchDoc} from "../GenericPouchDAO";
import {Entity} from "../../../common/model/Entity";

export class GenericPouchMapper {
    /**
     * Converts a PouchDB document to a domain model.
     *
     * Note: This default implementation only maps the fixed fields `_id`, `_rev`, and `entityType` from the database document to the domain model.
     *
     * @param {GenericPouchDoc} dbDoc - The PouchDB document to convert.
     * @returns {Entity} The converted domain model.
     */
    static toDomain(dbDoc: GenericPouchDoc): Entity {
        const {_id, _rev, entityType} = dbDoc;
        if (!_id || !_rev || !entityType) {
            throw new Error(`Unable to map object with properties ID: ${_id} revision: ${_rev} entityType: ${entityType}`);
        }
        return {id: _id, revision: _rev, entityType: entityType};
    }

    /**
     * Converts a domain model to a PouchDB document.
     *
     * Note: This default implementation only maps the fixed fields `id`, `revision`, and `entityType` from the domain model to the database document.
     *
     * @param {Entity} domainDoc - The domain model to convert.
     * @returns {GenericPouchDoc} The converted PouchDB document.
     */
    static toDB(domainDoc: Entity): GenericPouchDoc {
        const {id, revision, entityType} = domainDoc;
        return {_id: id, _rev: revision, entityType: entityType};
    }
}