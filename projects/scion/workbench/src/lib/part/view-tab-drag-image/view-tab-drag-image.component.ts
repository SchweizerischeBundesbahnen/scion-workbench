/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Injector, NgZone, Signal, signal, untracked} from '@angular/core';
import {ViewDragService} from '../../view-dnd/view-drag.service';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {WorkbenchConfig} from '../../workbench-config';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {toSignal} from '@angular/core/rxjs-interop';
import {DOCUMENT} from '@angular/common';
import {WorkbenchView} from '../../view/workbench-view.model';
import {subscribeIn} from '@scion/toolkit/operators';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {WORKBENCH_PART_REGISTRY} from '../workbench-part.registry';
import {MAIN_AREA} from '../../layout/workbench-layout';
import {TextPipe} from '../../text/text.pipe';
import {IconComponent} from '../../icon/icon.component';
import {PartId} from '../workbench-part.model';

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
    IconComponent,
  ],
  host: {
    '[class.view-drag]': 'true',
    '[class.drag-image]': 'true',
    '[class.active]': 'true',
    '[class.can-drop]': 'canDrop()',
    '[class.drag-over-tabbar]': 'isDragOverTabbar()',
    '[class.drag-over-peripheral-tabbar]': 'isDragOverPeripheralTabbar()',
  },
})
export class ViewTabDragImageComponent {

  protected readonly view = signal(inject(WorkbenchView)).asReadonly();
  protected readonly viewTabContentPortal = signal(createViewTabContentPortal()).asReadonly();

  /**
   * Indicates if dragging this view tab over a tabbar.
   */
  protected readonly isDragOverTabbar = this.computeDragOverTabbar();

  /**
   * Indicates if dragging this view tab over a tabbar located in the peripheral area.
   */
  protected readonly isDragOverPeripheralTabbar = this.computeDragOverPeripheralTabbar();

  /**
   * Indicates if dragging this view tab over a valid drop target.
   */
  protected readonly canDrop = this.computeCanDrop();

  protected onClose(..._: unknown[]): void {
    throw Error('[UnsupportedOperationError]');
  }

  /**
   * Computes if dragging this view tab over a tabbar.
   */
  private computeDragOverTabbar(): Signal<PartId | false> {
    return toSignal(inject(ViewDragService).tabbarDragOver$, {requireSync: true});
  }

  /**
   * Computes if dragging this view tab over a tabbar located in the peripheral area.
   */
  private computeDragOverPeripheralTabbar(): Signal<boolean> {
    const partRegistry = inject(WORKBENCH_PART_REGISTRY);
    return computed(() => {
      const partId = this.isDragOverTabbar();
      return untracked(() => partId && partRegistry.has(MAIN_AREA) && !partRegistry.get(partId).isInMainArea);
    });
  }

  /**
   * Computes if dragging this view tab over a valid drop target.
   */
  private computeCanDrop(): Signal<boolean> {
    const documentRoot = inject(DOCUMENT).documentElement;
    const zone = inject(NgZone);
    const canDrop$ = inject(ViewDragService).viewDrag$(documentRoot, {eventType: 'dragover'})
      .pipe(
        subscribeIn(fn => zone.runOutsideAngular(fn)),
        map(event => event.defaultPrevented),
        distinctUntilChanged(),
      );
    return toSignal(canDrop$, {initialValue: false});
  }
}

function createViewTabContentPortal(): ComponentPortal<unknown> {
  const componentType = inject(WorkbenchConfig).viewTabComponent ?? ViewTabContentComponent;
  return new ComponentPortal(componentType, null, inject(Injector));
}
