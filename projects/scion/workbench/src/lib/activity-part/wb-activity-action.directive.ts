import { Directive, OnDestroy, Optional, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WbActivityDirective } from './wb-activity.directive';
import { WorkbenchActivityPartService } from './workbench-activity-part.service';

/**
 * Use this directive to model an action for an activity, which is displayed
 * in the upper right corner of the activity panel header.
 *
 * The host element of this modelling directive must be a <ng-template> in the context of an activity.
 *
 * Example usage:
 *
 * <ng-template wbActivityAction>
 *   <button [wbRouterLink]="['user', 'new']" mat-icon-button title="Create user">
 *     <mat-icon>add</mat-icon>
 *   </button>
 * </ng-template>
 */
@Directive({
  selector: 'ng-template[wbActivityAction]',
  exportAs: 'activityAction'
})
export class WbActivityActionDirective implements OnDestroy {

  private readonly _activity: WbActivityDirective;

  constructor(@Optional() private _template: TemplateRef<void>,
              activityService: WorkbenchActivityPartService,
              route: ActivatedRoute) {
    if (!this._template) {
      throw Error('Illegal usage: Host element of this modelling directive must be a <ng-template>');
    }

    this._activity = activityService.resolveElseThrow(route.snapshot);
    this._activity.registerAction(this._template);
  }

  public ngOnDestroy(): void {
    this._activity.unregisterAction(this._template);
  }
}
