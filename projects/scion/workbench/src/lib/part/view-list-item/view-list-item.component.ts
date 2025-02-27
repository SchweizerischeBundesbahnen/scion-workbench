/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, HostBinding, inject, Injector, Input} from '@angular/core';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {WorkbenchConfig} from '../../workbench-config';
import {ViewId, WorkbenchView} from '../../view/workbench-view.model';
import {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from '../../workbench.constants';

@Component({
  selector: 'wb-view-list-item',
  templateUrl: './view-list-item.component.html',
  styleUrls: ['./view-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    PortalModule,
  ],
})
export class ViewListItemComponent {

  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _injector = inject(Injector);

  public view!: ɵWorkbenchView;
  public viewTabContentPortal!: ComponentPortal<unknown>;

  @Input({required: true})
  public set viewId(viewId: ViewId) {
    this.view = this._viewRegistry.get(viewId);
    this.viewTabContentPortal = this.createViewTabContentPortal();
  }

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view.active();
  }

  public onClose(): void {
    void this.view.close();
  }

  private createViewTabContentPortal(): ComponentPortal<unknown> {
    const componentType = this._workbenchConfig.viewTabComponent ?? ViewTabContentComponent;
    return new ComponentPortal(componentType, null, Injector.create({
      parent: this._injector,
      providers: [
        {provide: WorkbenchView, useValue: this.view},
        {provide: VIEW_TAB_RENDERING_CONTEXT, useValue: 'list-item' satisfies ViewTabRenderingContext},
      ],
    }));
  }
}
