import { Observable, Subject } from 'rxjs';
import { WbBeforeDestroy, WorkbenchView } from '../workbench.model';
import { Component, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

// tslint:max-classes-per-file
export abstract class AbstractSpecViewComponent implements OnDestroy, WbBeforeDestroy {

  private _destroy$ = new Subject<void>();

  public destroyed: boolean;
  public activated: boolean;
  public dirty: boolean;
  public checked: boolean;
  public preventDestroy = false;

  constructor(public view: WorkbenchView) {
    view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => this.activated = active);
  }

  public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    return !this.preventDestroy;
  }

  public ngOnDestroy(): void {
    this.destroyed = true;
    this._destroy$.next();
  }

  public checkFromTemplate(): boolean {
    this.checked = true;
    return this.checked;
  }
}

// tslint:max-classes-per-file
@Component({selector: 'spec-view-1', template: 'View 1 {{checkFromTemplate()}}'})
export class SpecView1Component extends AbstractSpecViewComponent {
  constructor(view: WorkbenchView) {
    super(view);
  }
}

// tslint:max-classes-per-file
@Component({selector: 'spec-view-2', template: 'View 2 {{checkFromTemplate()}}'})
export class SpecView2Component extends AbstractSpecViewComponent {
  constructor(view: WorkbenchView) {
    super(view);
  }
}
