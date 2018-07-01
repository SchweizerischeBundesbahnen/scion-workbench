import { Injectable, ViewContainerRef } from '@angular/core';

/**
 * Represents the location in the DOM where to append overlays and iframes of remote sites.
 *
 * Note: This host element is a top-level workbench DOM element, so the iframe is not reparented
 * upon a workbench layout change.
 */
@Injectable()
export class OverlayHostRef {

  private _vcr: ViewContainerRef;

  public set(vcr: ViewContainerRef): void {
    if (this._vcr) {
      throw Error('`ViewContainerRef` already set');
    }
    this._vcr = vcr;
  }

  public get(): ViewContainerRef {
    return this._vcr;
  }
}
