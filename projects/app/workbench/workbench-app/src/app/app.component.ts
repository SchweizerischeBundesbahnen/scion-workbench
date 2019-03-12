import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public showActivities = true;
  public ensureWelcomeView = false;

  constructor(route: ActivatedRoute) {
    route.queryParamMap
      .pipe(takeUntil(this._destroy$))
      .subscribe(queryParams => {
        this.showActivities = coerceBooleanProperty(queryParams.get('show-activities') || true);
        this.ensureWelcomeView = coerceBooleanProperty(queryParams.get('ensure-welcome-view') || false);
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
