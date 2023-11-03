import {GenericPouchMapper} from "../../../src/services/dao/mapper/GenericPouchMapper";
import {GenericPouchDoc} from "../../../src/services/dao/types/DbTypes";
import {PouchEntity} from "../../../src/services/dao/types/DomainTypes";
import TestUtils from "../../../src/utils/TestUtils";

describe('GenericPouchMapper', () => {
    describe('toDomain', () => {
        it('should convert a PouchDB document to a domain model', () => {
            const pouchDoc: GenericPouchDoc = {
                _id: 'some-id',
                _rev: 'some-rev',
                entityType: 'some-type',
                appVersion: '0.0.1-alpha',
                createdDate: TestUtils.getRandomDate().toISOString()
            };

            const domainModel = (new GenericPouchMapper()).toDomain(pouchDoc);

            expect(domainModel).toEqual({
                id: 'some-id',
                revision: 'some-rev',
                entityType: 'some-type',
                createdDate: new Date(pouchDoc.createdDate!)
            });
        });
    });

    describe('toDB', () => {
        it('should convert a domain model to a PouchDB document', () => {
            const domainModel: PouchEntity = {
                id: 'some-id',
                revision: 'some-rev',
                entityType: 'some-type'
            };

            const pouchDoc = (new GenericPouchMapper()).toDB(domainModel);

            expect(pouchDoc).toEqual({
                _id: 'some-id',
                _rev: 'some-rev',
                entityType: 'some-type'
            });
        });
    });
});
