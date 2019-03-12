import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { WorkbenchRouter, WorkbenchService } from '@scion/workbench';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public showActivities = true;
  public showOpenNewViewTabAction = true;
  public ensureWelcomeView = false;

  constructor(route: ActivatedRoute, workbench: WorkbenchService, wbRouter: WorkbenchRouter) {
    route.queryParamMap
      .pipe(takeUntil(this._destroy$))
      .subscribe(queryParams => {
        this.showActivities = coerceBooleanProperty(queryParams.get('show-activities') || true);
        this.showOpenNewViewTabAction = coerceBooleanProperty(queryParams.get('show-open-new-view-tab-action') || true);
        this.ensureWelcomeView = coerceBooleanProperty(queryParams.get('ensure-welcome-view') || false);
      });

    workbench.views$
      .pipe(takeUntil(this._destroy$))
      .subscribe(views => {
        if (this.ensureWelcomeView && views.length === 0) {
          wbRouter.navigate(['/welcome']).then();
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
