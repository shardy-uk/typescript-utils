import {GenericPouchMapper} from "../../../src/dao/mapper/GenericPouchMapper";
import {GenericPouchDoc} from "../../../src/dao/types/DbTypes";
import {PouchEntity} from "../../../src/dao/types/DomainTypes";
import TestUtils from "../../utils/TestUtils";

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

            const domainModel = GenericPouchMapper.toDomain(pouchDoc);

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

            const pouchDoc = GenericPouchMapper.toDB(domainModel);

            expect(pouchDoc).toEqual({
                _id: 'some-id',
                _rev: 'some-rev',
                entityType: 'some-type'
            });
        });
    });
});
