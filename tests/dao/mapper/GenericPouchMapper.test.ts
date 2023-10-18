import {GenericPouchMapper} from "../../../../services/dao/mappers/GenericPouchMapper";
import {GenericPouchDoc} from "../../../../services/dao/GenericPouchDAO";
import {Entity} from "../../../../common/model/Entity";

describe('GenericPouchMapper', () => {
    describe('toDomain', () => {
        it('should convert a PouchDB document to a domain model', () => {
            const pouchDoc: GenericPouchDoc = {
                _id: 'some-id',
                _rev: 'some-rev',
                entityType: 'some-type',
            };

            const domainModel = GenericPouchMapper.toDomain(pouchDoc);

            expect(domainModel).toEqual({
                id: 'some-id',
                revision: 'some-rev',
                entityType: 'some-type'
            });
        });
    });

    describe('toDB', () => {
        it('should convert a domain model to a PouchDB document', () => {
            const domainModel: Entity = {
                id: 'some-id',
                revision: 'some-rev',
                entityType: 'some-type',
            };

            const pouchDoc = GenericPouchMapper.toDB(domainModel);

            expect(pouchDoc).toEqual({
                _id: 'some-id',
                _rev: 'some-rev',
                entityType: 'some-type',
            });
        });
    });
});
