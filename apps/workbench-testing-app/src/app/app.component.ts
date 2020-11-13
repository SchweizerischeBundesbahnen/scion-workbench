import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { WorkbenchRouter, WorkbenchService } from '@scion/workbench';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public showActivities = true;
  public showOpenNewViewTabAction = true;

  constructor(route: ActivatedRoute, workbench: WorkbenchService, wbRouter: WorkbenchRouter) {
    route.queryParamMap
      .pipe(takeUntil(this._destroy$))
      .subscribe(queryParams => {
        this.showActivities = coerceBooleanProperty(queryParams.get('show-activities') || true);
        this.showOpenNewViewTabAction = coerceBooleanProperty(queryParams.get('show-open-new-view-tab-action') || true);
      });

    const homeTabEnabled$ = route.queryParamMap.pipe(map(params => coerceBooleanProperty(params.get('home-tab-enabled') || false)));
    const views$ = workbench.views$;
    combineLatest([homeTabEnabled$, views$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([homeTabEnabled, views]) => {
        if (homeTabEnabled && views.length === 0) {
          wbRouter.navigate(['/welcome']).then();
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
