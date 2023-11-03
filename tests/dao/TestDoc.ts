import {GenericPouchDoc} from "../../src/services/dao/types/DbTypes";

export interface TestDoc extends GenericPouchDoc {
    name: string;
    value: string;
}