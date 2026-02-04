/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, input, Signal, untracked} from '@angular/core';
import {MActivity} from '../../workbench-activity.model';
import {ɵWorkbenchRouter} from '../../../routing/ɵworkbench-router.service';
import {IconComponent} from '../../../icon/icon.component';
import {text} from '../../../text/text';
import {WorkbenchLayoutService} from '../../../layout/workbench-layout.service';
import {isPartId, isViewId} from '../../../workbench.identifiers';
import {WorkbenchFocusMonitor} from '../../../focus/workbench-focus-tracker.service';
import {WorkbenchPartRegistry} from '../../../part/workbench-part.registry';
import {WorkbenchPart} from '../../../part/workbench-part.model';

/**
 * Renders a button to toggle the visibility of an activity.
 */
@Component({
  selector: 'wb-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  imports: [
    IconComponent,
  ],
  host: {
    '[attr.data-active]': `active() ? '' : null`,
    '[attr.data-focus-within-activity]': `focusWithinActivity() ? '' : null`,
    '[attr.data-activityid]': 'activity().id',
    '[attr.title]': 'tooltip()',
    '[class]': 'activity().cssClass',
  },
})
export class ActivityItemComponent {

  public readonly activity = input.required<MActivity>();
  public readonly active = input.required<boolean>();

  protected readonly tooltip = text(computed(() => this.activity().tooltip ?? this.activity().label));
  protected readonly focusWithinActivity = this.computeFocusWithinActivity();
  protected readonly referencePart = this.computeReferencePart();

  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  protected onToggle(): void {
    void this._workbenchRouter.navigate(layout => layout.toggleActivity(this.activity().id));
  }

  private computeFocusWithinActivity(): Signal<boolean> {
    const focusMonitor = inject(WorkbenchFocusMonitor);
    const layout = inject(WorkbenchLayoutService).layout;

    return computed(() => {
      const activeElement = focusMonitor.activeElement();
      const activity = this.activity();

      return untracked(() => {
        if (!activeElement) {
          return false;
        }
        if (isPartId(activeElement.id)) {
          return layout().activity({partId: activeElement.id}, {orElse: null})?.id === activity.id;
        }
        if (isViewId(activeElement.id)) {
          return layout().activity({viewId: activeElement.id}, {orElse: null})?.id === activity.id;
        }
        return false;
      });
    });
  }

  private computeReferencePart(): Signal<WorkbenchPart> {
    const layout = inject(WorkbenchLayoutService).layout;
    const partRegistry = inject(WorkbenchPartRegistry);

    return computed(() => {
      const activity = this.activity();
      const partId = layout().grids[activity.id]!.referencePartId!;

      return untracked(() => partRegistry.get(partId));
    });
  }
}
