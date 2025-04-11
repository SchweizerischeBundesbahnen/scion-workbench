/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject, Injector, NgZone, signal} from '@angular/core';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {WorkbenchConfig} from '../../workbench-config';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DOCUMENT} from '@angular/common';
import {WorkbenchView} from '../../view/workbench-view.model';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {WORKBENCH_PART_REGISTRY} from '../workbench-part.registry';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {TextPipe} from '../../text/text.pipe';

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
  imports: [
    PortalModule,
    TextPipe,
  ],
})
export class ViewTabDragImageComponent {

  private readonly _viewDragService = inject(ViewDragService);

  protected readonly view = signal(inject(WorkbenchView)).asReadonly();
  protected readonly viewTabContentPortal = signal(createViewTabContentPortal()).asReadonly();

  @HostBinding('class.active')
  protected active = true;

  /**
   * Indicates if dragging this view tab over a tabbar.
   */
  @HostBinding('class.drag-over-tabbar')
  protected isDragOverTabbar = false;

  /**
   * Indicates if dragging this view tab over a valid drop target.
   */
  @HostBinding('class.can-drop')
  protected canDrop = false;

  /**
   * Indicates if dragging this view tab over a tabbar located in the peripheral area.
   */
  @HostBinding('class.drag-over-peripheral-tabbar')
  protected isDragOverPeripheralTabbar = false;

  constructor() {
    this.installDragOverTabbarDetector();
    this.installCanDropDetector();
  }

  protected onClose(..._: unknown[]): void {
    throw Error('[UnsupportedOperationError]');
  }

  private installDragOverTabbarDetector(): void {
    const partRegistry = inject(WORKBENCH_PART_REGISTRY);
    this._viewDragService.tabbarDragOver$
      .pipe(takeUntilDestroyed())
      .subscribe(partId => {
        // Compute if dragging this view tab over a tabbar.
        this.isDragOverTabbar = !!partId;
        // Compute if dragging this view tab over a tabbar located in the peripheral area.
        this.isDragOverPeripheralTabbar = !!partId && partRegistry.has(MAIN_AREA) && !partRegistry.get(partId).isInMainArea;
      });
  }

  private installCanDropDetector(): void {
    const documentRoot = inject(DOCUMENT).documentElement;
    const zone = inject(NgZone);
    this._viewDragService.viewDrag$(documentRoot, {eventType: 'dragover'})
      .pipe(
        subscribeIn(fn => zone.runOutsideAngular(fn)),
        map(event => event.defaultPrevented),
        distinctUntilChanged(),
        observeIn(fn => zone.run(fn)),
        takeUntilDestroyed(),
      )
      .subscribe(canDrop => {
        this.canDrop = canDrop;
      });
  }
}

function createViewTabContentPortal(): ComponentPortal<unknown> {
  const componentType = inject(WorkbenchConfig).viewTabComponent ?? ViewTabContentComponent;
  return new ComponentPortal(componentType, null, inject(Injector));
}
