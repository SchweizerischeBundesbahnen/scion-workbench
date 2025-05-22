/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, inject, input} from '@angular/core';
import {MActivity} from '../../workbench-activity.model';
import {ɵWorkbenchRouter} from '../../../routing/ɵworkbench-router.service';
import {synchronizeCssClasses} from '../../../common/css-class.util';
import {Arrays} from '@scion/toolkit/util';
import {IconComponent} from '../../../icon/icon.component';
import {text} from '../../../text/text';

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
    '[class.active]': 'active()',
    '[attr.data-activityid]': 'activity().id',
    '[attr.title]': 'tooltip()',
  },
})
export class ActivityItemComponent {

  public readonly activity = input.required<MActivity>();
  public readonly active = input.required<boolean>();

  protected readonly tooltip = text(computed(() => this.activity().tooltip ?? this.activity().label));

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
}
