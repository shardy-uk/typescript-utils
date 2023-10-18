import {GenericPouchDoc} from "../../src/dao/GenericPouchDAO";

export interface TestDoc extends GenericPouchDoc {
    name: string;
    value: string;
}