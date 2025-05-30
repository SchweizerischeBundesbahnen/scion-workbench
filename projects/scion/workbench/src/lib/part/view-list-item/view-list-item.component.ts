/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, inject, Injector, input, Signal} from '@angular/core';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {WorkbenchConfig} from '../../workbench-config';
import {ViewId, WorkbenchView} from '../../view/workbench-view.model';
import {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from '../../workbench.constants';
import {TextPipe} from '../../text/text.pipe';
import {IconComponent} from '../../icon/icon.component';

@Component({
  selector: 'wb-view-list-item',
  templateUrl: './view-list-item.component.html',
  styleUrls: ['./view-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkPortalOutlet,
    TextPipe,
    IconComponent,
  ],
  host: {
    '[class.active]': 'view().active()',
    '[attr.data-viewid]': 'view().id',
  },
})
export class ViewListItemComponent {

  public readonly viewId = input.required<ViewId>();

  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);

  protected view = computed(() => this._viewRegistry.get(this.viewId()));
  protected viewTabContentPortal = this.computeViewTabContentPortal();

  protected onClose(): void {
    void this.view().close();
  }

  private computeViewTabContentPortal(): Signal<ComponentPortal<unknown>> {
    const injector = inject(Injector);
    const workbenchConfig = inject(WorkbenchConfig);

    return computed(() => {
      const componentType = workbenchConfig.viewTabComponent ?? ViewTabContentComponent;
      return new ComponentPortal(componentType, null, Injector.create({
        parent: injector,
        providers: [
          {provide: WorkbenchView, useValue: this.view()},
          {provide: VIEW_TAB_RENDERING_CONTEXT, useValue: 'list-item' satisfies ViewTabRenderingContext},
        ],
      }));
    });
  }
}
