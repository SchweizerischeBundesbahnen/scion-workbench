/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, HostBinding, inject, input} from '@angular/core';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ActivityId, MActivity} from '../../workbench-activity.model';
import {ɵWorkbenchRouter} from '../../../routing/ɵworkbench-router.service';
import {synchronizeCssClasses} from '../../../common/css-class.util';
import {Arrays} from '@scion/toolkit/util';

@Component({
  selector: 'wb-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  imports: [
    SciMaterialIconDirective,
  ],
})
export class ActivityItemComponent {

  public readonly activity = input.required<MActivity>();
  public readonly isActive = input.required<boolean>();

  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  @HostBinding('attr.data-activityid')
  protected get activityId(): ActivityId {
    return this.activity().id;
  }

  @HostBinding('class.active')
  public get active(): boolean {
    return this.isActive();
  }

  constructor() {
    this.addHostCssClasses();
  }

  protected toggleActivity(id: ActivityId, enable: boolean): void {
    void this._workbenchRouter.navigate(layout => enable ? layout.activateActivity(id) : layout.deactivateActivity(id));
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, computed(() => Arrays.coerce(this.activity().cssClass)));
  }
}
