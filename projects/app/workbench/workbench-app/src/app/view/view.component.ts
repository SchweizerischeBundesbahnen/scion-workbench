import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { WorkbenchView } from '@scion/workbench';

@Component({
  selector: 'app-view',
  styleUrls: ['./view.component.scss'],
  templateUrl: './view.component.html',
})
export class ViewComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute, public view: WorkbenchView) {
    route.paramMap
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => {
        view.title = params.get('viewTitle');
        view.cssClass = params.get('viewCssClass');
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
