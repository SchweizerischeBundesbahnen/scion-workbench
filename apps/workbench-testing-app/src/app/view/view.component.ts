import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { WorkbenchView } from '@scion/workbench';

@Component({
  selector: 'app-view',
  styleUrls: ['./view.component.scss'],
  templateUrl: './view.component.html',
})
export class ViewComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public params$: Observable<Params>;
  public queryParams$: Observable<Params>;

  constructor(route: ActivatedRoute, public view: WorkbenchView) {
    this.params$ = route.params;
    this.queryParams$ = route.queryParams;

    route.paramMap
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => {
        view.title = params.get('viewTitle');
        view.heading = 'General testing view';
        view.cssClass = params.get('viewCssClass');
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
