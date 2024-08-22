/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject, Injector, signal, Signal} from '@angular/core';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {WorkbenchConfig} from '../../workbench-config';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DOCUMENT} from '@angular/common';
import {WorkbenchView} from '../../view/workbench-view.model';

/**
 * @see ViewTabComponent
 */
@Component({
  selector: 'wb-view-tab-drag-image',
  templateUrl: '../view-tab/view-tab.component.html',
  styleUrls: [
    '../view-tab/view-tab.component.scss',
    './view-tab-drag-image.partial.component.scss',
  ],
  standalone: true,
  imports: [
    PortalModule,
  ],
})
export class ViewTabDragImageComponent {

  public readonly view = signal(inject(WorkbenchView));
  public readonly viewTabContentPortal: Signal<ComponentPortal<unknown>>;

  @HostBinding('class.active')
  public active = true;

  @HostBinding('class.part-active')
  public partActive = true;

  /**
   * Indicates if dragging this view tab over a tabbar.
   */
  @HostBinding('class.drag-over-tabbar')
  public isDragOverTabbar = false;

  /**
   * Indicates if dragging this view tab over a tabbar located in the peripheral area.
   */
  @HostBinding('class.drag-over-peripheral-tabbar')
  public isDragOverPeripheralTabbar = false;

  constructor(private _workbenchConfig: WorkbenchConfig,
              private _viewDragService: ViewDragService,
              private _injector: Injector) {
    this.installDragOverTabbarDetector();
    this.viewTabContentPortal = signal(this.createViewTabContentPortal());
  }

  public onClose(..._: unknown[]): void {
    throw Error('[UnsupportedOperationError]');
  }

  private createViewTabContentPortal(): ComponentPortal<unknown> {
    const componentType = this._workbenchConfig.viewTabComponent || ViewTabContentComponent;
    return new ComponentPortal(componentType, null, this._injector);
  }

  private installDragOverTabbarDetector(): void {
    const documentRoot = inject<Document>(DOCUMENT).documentElement;
    this._viewDragService.tabbarDragOver$
      .pipe(takeUntilDestroyed())
      .subscribe(partId => {
        // Compute if dragging this view tab over a tabbar.
        this.isDragOverTabbar = partId !== null;
        // Compute if dragging this view tab over a tabbar located in the peripheral area.
        this.isDragOverPeripheralTabbar = partId !== null && documentRoot.querySelector(`wb-workbench:has(wb-main-area-layout) wb-part[data-partid="${partId}"]:not(.main-area)`) !== null;
      });
  }
}
