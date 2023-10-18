import {GenericPouchDoc} from "../../../services/dao/GenericPouchDAO";

export interface TestDoc extends GenericPouchDoc {
    name: string;
    value: string;
}