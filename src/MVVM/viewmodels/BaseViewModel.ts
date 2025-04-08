import { Audit } from "@/MVVM/models/Audit";

export abstract class BaseViewModel<T extends Audit> {
    protected _disposed: boolean = false;

    constructor() {}

    get isDisposed(): boolean {
        return this._disposed;
    }

    dispose(): void {
        this._disposed = true;
    }

    protected assertNotDisposed(): void {
        if (this._disposed) {
            throw new Error('ViewModel is disposed');
        }
    }

    protected abstract mapToDTO(doc: any): T;

}
