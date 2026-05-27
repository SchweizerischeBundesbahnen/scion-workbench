import {noop} from 'rxjs';

export class DestroyRef {

  private _callbacks = new Set<() => void>();
  private _destroyed = false;

  public onDestroy(callback: () => void): () => void {
    if (this._destroyed) {
      callback();
      return noop;
    }

    this._callbacks.add(callback);
    return () => this._callbacks.delete(callback);
  }

  public destroy(): void {
    if (this._destroyed) {
      return;
    }

    this._destroyed = true;
    this._callbacks.forEach(callback => callback());
    this._callbacks.clear();
  }
}
