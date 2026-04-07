/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, inject, Injector, input, Signal, untracked} from '@angular/core';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {VIEW_DRAG_TRANSFER_TYPE, ViewDragService} from '../../view-dnd/view-drag.service';
import {createElement} from '../../common/dom.util';
import {CdkPortalOutlet, ComponentPortal} from '@angular/cdk/portal';
import {WorkbenchConfig} from '../../workbench-config';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {ViewId, WORKBENCH_ID} from '../../workbench.identifiers';
import {WorkbenchView} from '../../view/workbench-view.model';
import {boundingClientRect} from '@scion/components/dimension';
import {UUID} from '@scion/toolkit/uuid';
import {SciTextPipe} from '@scion/sci-components/text';
import {IconComponent} from '../../icon/icon.component';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {WorkbenchViewContextMenuService} from '../view-context-menu/workbench-view-context-menu.service';

/**
 * IMPORTANT: HTML and CSS also used by {@link ViewTabDragImageComponent}.
 *
 * @see ViewTabDragImageComponent
 */
@Component({
  selector: 'wb-view-tab',
  templateUrl: './view-tab.component.html',
  styleUrls: ['./view-tab.component.scss'],
  imports: [
    CdkPortalOutlet,
    SciTextPipe,
    IconComponent,
  ],
  host: {
    '[attr.data-viewid]': 'view().id',
    '[attr.data-active]': `view().active() ? '' : null`,
    '[attr.data-dirty]': `view().dirty() ? '' : null`,
    '[attr.data-focus-within-view]': `view().focused() ? '' : null`,
    '[attr.draggable]': 'true',
    '[attr.tabindex]': '-1', // make the view focusable to install view menu accelerators
    '[class.view-drag]': 'viewDragService.dragging()',
    '[class]': 'view().classList.asList()',
    '[style.--sci-workbench-tab-title-offset-right]': 'viewTitleOffsetRight()',
    '(click)': 'onClick()',
    '(auxclick)': 'onAuxClick($event)',
    '(contextmenu)': 'onContextmenu($event)',
    '(mousedown)': 'onMouseDown($event)',
    '(dragstart)': 'onDragStart($event)',
    '(dragend)': 'onDragEnd()',
  },
})
export class ViewTabComponent {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _viewContextMenuService = inject(WorkbenchViewContextMenuService);
  private readonly _layout = inject(WorkbenchLayoutService).layout;

  public readonly host = inject(ElementRef).nativeElement as HTMLElement;
  public readonly view = input.required({alias: 'viewId', transform: (viewId: ViewId) => this._viewRegistry.get(viewId)});
  public readonly boundingClientRect = boundingClientRect(inject(ElementRef));

  protected readonly viewTabContentPortal: Signal<ComponentPortal<unknown>>;
  protected readonly viewDragService = inject(ViewDragService);
  protected readonly viewTitleOffsetRight = computed(() => this.view().closable() ? '1.5rem' : undefined); // offset for the title to not overlap the close button

  constructor() {
    this.installMenuAccelerators();
    this.viewTabContentPortal = this.createViewTabContentPortal();
  }

  protected onClick(): void {
    void this.view().activate();
  }

  protected onClose(event: MouseEvent): void {
    event.stopPropagation(); // prevent the view from being activated
    this.closeView(event);
  }

  protected onAuxClick(event: MouseEvent): void {
    if (event.button === 1) { // primary aux button
      event.preventDefault(); // prevent user-agent default action
      this.closeView(event);
    }
  }

  protected onMouseDown(event: MouseEvent): void {
    if (event.button === 1) { // primary aux button
      event.preventDefault(); // Prevent middle-click scrolling; necessary for aux click to work
    }
  }

  protected onContextmenu(event: MouseEvent): void {
    this._viewContextMenuService.open(event, {viewId: this.view().id});
  }

  protected onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }

    const view = this.view();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(VIEW_DRAG_TRANSFER_TYPE, view.id);
    // Use an invisible <div> as the native drag image because the workbench renders the drag image in {@link ViewTabDragImageRenderer}.
    event.dataTransfer.setDragImage(createElement('div', {style: {display: 'none'}}), 0, 0);

    this.viewDragService.setViewDragData({
      uid: UUID.randomUUID(),
      viewId: view.id,
      viewTitle: view.title(),
      viewHeading: view.heading(),
      viewDirty: view.dirty(),
      viewClosable: view.isClosable() || (view.closable() ? 'disabled' : false),
      navigation: view.navigation() && {
        path: view.navigation()!.path,
        hint: view.navigation()!.hint,
        data: view.navigation()!.data,
      },
      alternativeViewId: view.alternativeId,
      partId: view.part().id,
      viewTabPointerOffsetX: event.offsetX,
      viewTabPointerOffsetY: event.offsetY,
      viewTabWidth: this.host.getBoundingClientRect().width,
      viewTabHeight: this.host.getBoundingClientRect().height,
      viewTitleOffsetRight: this.viewTitleOffsetRight(),
      workbenchId: this._workbenchId,
      classList: view.classList.asMap(),
      activityId: this._layout().activity({viewId: view.id}, {orElse: null})?.id,
    });

    void view.activate();
  }

  protected onDragEnd(): void {
    this.viewDragService.unsetViewDragData();
  }

  /**
   * Closes the current view or other views if the 'Alt' key is pressed.
   */
  private closeView(event: MouseEvent): void {
    if (event.altKey) {
      void this.view().close('other-views');
    }
    else {
      void this.view().close();
    }
  }

  private installMenuAccelerators(): void {
    const host = inject(ElementRef);

    effect(onCleanup => {
      const view = this.view();

      untracked(() => {
        const accelerators = this._viewContextMenuService.installAccelerators(host, {viewId: view.id});
        onCleanup(() => accelerators.dispose());
      });
    });
  }

  private createViewTabContentPortal(): Signal<ComponentPortal<unknown>> {
    const injector = inject(Injector);

    return computed(() => {
      const componentType = this._workbenchConfig.viewTabComponent ?? ViewTabContentComponent;
      return new ComponentPortal(componentType, null, Injector.create({
        parent: injector,
        providers: [
          {provide: WorkbenchView, useValue: this.view()},
        ],
      }));
    });
  }
}
