import { Audit } from "@/models/Audit";

export abstract class BaseViewModel<T extends Audit> {
    constructor() {
    }

    protected abstract mapToDTO(doc: any): T;
}
