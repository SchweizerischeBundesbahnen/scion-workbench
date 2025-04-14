/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, inject, input, Signal} from '@angular/core';
import {MActivity} from '../../workbench-activity.model';
import {ɵWorkbenchRouter} from '../../../routing/ɵworkbench-router.service';
import {synchronizeCssClasses} from '../../../common/css-class.util';
import {Arrays} from '@scion/toolkit/util';
import {NgComponentOutlet} from '@angular/common';
import {provideText} from '../../../text/text-provider';
import {provideIcon} from '../../../icon/icon-provider';
import {WorkbenchLayoutService} from '../../../layout/workbench-layout.service';
import {FocusTracker} from '../../../focus/focus-tracker.service';
import {isPartId, isViewId} from '../../../layout/ɵworkbench-layout';

@Component({
  selector: 'wb-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  imports: [
    NgComponentOutlet,
  ],
  host: {
    '[attr.data-activityid]': 'activity().id',
    '[attr.title]': 'tooltip()',
  },
})
export class ActivityItemComponent {

  public readonly activity = input.required<MActivity>();
  public readonly active = input.required<boolean>();

  protected readonly tooltip = provideText(computed(() => this.activity().tooltip ?? this.activity().label));
  protected readonly iconDescriptor = provideIcon(computed(() => this.activity().icon));
  protected readonly focusWithinActivity = this.computeFocusWithinActivity();

  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  constructor() {
    this.addHostCssClasses();
  }

  protected onToggle(): void {
    void this._workbenchRouter.navigate(layout => layout.toggleActivity(this.activity().id));
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, computed(() => Arrays.coerce(this.activity().cssClass)));
  }

  private computeFocusWithinActivity(): Signal<boolean> {
    const focusTracker = inject(FocusTracker);
    const layoutService = inject(WorkbenchLayoutService);

    return computed(() => {
      const activeElement = focusTracker.activeElement();
      const activity = this.activity();
      const layout = layoutService.layout()!;

      if (isPartId(activeElement)) {
        return layout.activity({partId: activeElement}, {orElse: null})?.id === activity.id;
      }
      if (isViewId(activeElement)) {
        const part = layout.part({viewId: activeElement});
        return layout.activity({partId: part.id}, {orElse: null})?.id === activity.id;
      }
      return false;
    });
  }
}
