import {GenericPouchDoc} from "../../src/dao/types/DbTypes";

export interface TestDoc extends GenericPouchDoc {
    name: string;
    value: string;
}