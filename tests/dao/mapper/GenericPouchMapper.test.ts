import {GenericPouchMapper} from "../../../src/dao/mapper/GenericPouchMapper";
import {GenericPouchDoc} from "../../../src/dao/GenericPouchDAO";
import {PouchEntity} from "../../../src/model/PouchEntity";

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
            const domainModel: PouchEntity = {
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
