import { Injectable, ViewContainerRef } from '@angular/core';
import { InternalWorkbenchView } from '../workbench.model';
import { filter, take } from 'rxjs/operators';

@Injectable()
export class FullScreenModeService {

  private _view: InternalWorkbenchView;
  private _viewContainerRef: ViewContainerRef;
  private _fullScreenViewContainerRef: ViewContainerRef;

  public enter(view: InternalWorkbenchView): void {
    // Wait for view to be active, otherwise the ViewContainerRef of the portal is null
    view.active$.pipe(
      filter(active => active),
      take(1)
    ).subscribe(() => this.updateView(view));
  }

  public leave(): void {
    this._view.portal.setViewContainerRef(this._viewContainerRef);
    this._view = null;
  }

  public get active(): boolean {
    return !!this._view;
  }

  public isViewActive(viewRef: string): boolean {
    return this._view && this._view.viewRef === viewRef;
  }

  public setViewContainerRef(viewContainerRef: ViewContainerRef): void {
    this._fullScreenViewContainerRef = viewContainerRef;
  }

  public updateView(view: InternalWorkbenchView): void {
    if (this._view) {
      this._view.portal.setViewContainerRef(this._viewContainerRef);
    }
    this._view = view;
    this._viewContainerRef = view.portal.viewContainerRef;
    view.portal.setViewContainerRef(this._fullScreenViewContainerRef);
  }
}
