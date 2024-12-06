/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, HostBinding, HostListener, inject, Injector, input, NgZone, Signal} from '@angular/core';
import {fromEvent, merge, withLatestFrom} from 'rxjs';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {map, switchMap} from 'rxjs/operators';
import {VIEW_DRAG_TRANSFER_TYPE, ViewDragService} from '../../view-dnd/view-drag.service';
import {createElement} from '../../common/dom.util';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from '../../workbench.constants';
import {WorkbenchConfig} from '../../workbench-config';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {ViewMenuService} from '../view-context-menu/view-menu.service';
import {ViewId, WorkbenchView} from '../../view/workbench-view.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {subscribeIn} from '@scion/toolkit/operators';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID} from '../../workbench-id';
import {NgClass} from '@angular/common';
import {boundingClientRect} from '@scion/components/dimension';
import {UUID} from '@scion/toolkit/uuid';

/**
 * IMPORTANT: HTML and CSS also used by {@link ViewTabDragImageComponent}.
 *
 * @see ViewTabDragImageComponent
 */
@Component({
  selector: 'wb-view-tab',
  templateUrl: './view-tab.component.html',
  styleUrls: ['./view-tab.component.scss'],
  standalone: true,
  imports: [
    PortalModule,
  ],
  hostDirectives: [
    NgClass,
  ],
})
export class ViewTabComponent {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _router = inject(ɵWorkbenchRouter);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _viewContextMenuService = inject(ViewMenuService);
  private readonly _injector = inject(Injector);

  public readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  public readonly view = input.required({alias: 'viewId', transform: ((viewId: ViewId) => this._viewRegistry.get(viewId))});
  public readonly viewTabContentPortal: Signal<ComponentPortal<unknown>>;
  public readonly boundingClientRect = boundingClientRect(inject(ElementRef));

  @HostBinding('attr.draggable')
  public draggable = true;

  @HostBinding('attr.tabindex')
  public tabindex = -1; // make the view focusable to install view menu accelerators

  /**
   * Indicates if dragging a view tab over this view tab's tabbar.
   */
  @HostBinding('class.drag-over-tabbar')
  public get isDragOverTabbar(): boolean {
    return this._viewDragService.isDragOverTabbar === this.view().part().id;
  }

  @HostBinding('attr.data-viewid')
  public get viewId(): ViewId {
    return this.view().id;
  }

  constructor() {
    this.installMaximizeListener();
    this.addHostCssClasses();
    this.installViewMenuItemAccelerators();
    this.viewTabContentPortal = this.createViewTabContentPortal();
  }

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view().active();
  }

  @HostBinding('class.part-active')
  public get partActive(): boolean {
    return this.view().part().active();
  }

  @HostBinding('class.e2e-dirty')
  public get dirty(): boolean {
    return this.view().dirty();
  }

  @HostListener('click')
  public onClick(): void {
    this.view().activate().then();
  }

  public onClose(event: Event): void {
    event.stopPropagation(); // prevent the view from being activated
    this.view().close().then();
  }

  @HostListener('mousedown', ['$event'])
  public onMousedown(event: MouseEvent): void {
    if (event.buttons === AUXILARY_MOUSE_BUTTON) {
      this.view().close().then();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  @HostListener('contextmenu', ['$event'])
  public onContextmenu(event: MouseEvent): void {
    this._viewContextMenuService.showMenu({x: event.clientX, y: event.clientY}, this.view().id).then();
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('dragstart', ['$event'])
  public onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }

    const view = this.view();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(VIEW_DRAG_TRANSFER_TYPE, view.id);
    // Use an invisible <div> as the native drag image because the workbench renders the drag image in {@link ViewTabDragImageRenderer}.
    event.dataTransfer.setDragImage(createElement('div', {style: {display: 'none'}}), 0, 0);

    this._viewDragService.setViewDragData({
      uid: UUID.randomUUID(),
      viewId: view.id,
      viewTitle: view.title(),
      viewHeading: view.heading(),
      viewDirty: view.dirty(),
      viewClosable: view.closable(),
      viewUrlSegments: view.urlSegments(),
      alternativeViewId: view.alternativeId,
      navigationHint: view.navigationHint(),
      navigationData: view.navigationData(),
      partId: view.part().id,
      viewTabPointerOffsetX: event.offsetX,
      viewTabPointerOffsetY: event.offsetY,
      viewTabWidth: this.host.getBoundingClientRect().width,
      viewTabHeight: this.host.getBoundingClientRect().height,
      workbenchId: this._workbenchId,
      classList: view.classList.asMap(),
    });

    if (!view.active()) {
      view.activate().then();
    }
  }

  @HostListener('dragend')
  public onDragEnd(): void {
    this._viewDragService.unsetViewDragData();
  }

  /**
   * Listens for 'dblclick' events to maximize or minimize the main area.
   *
   * Note that the listener is not activated until the mouse is moved. Otherwise, closing successive
   * views (if they have different tab widths) could result in unintended maximization or minimization.
   */
  private installMaximizeListener(): void {
    const zone = inject(NgZone);
    const enabled$ = merge(fromEvent<Event>(this.host, 'mouseenter'), fromEvent<Event>(this.host, 'mousemove'), fromEvent<Event>(this.host, 'mouseleave'))
      .pipe(
        subscribeIn(fn => zone.runOutsideAngular(fn)),
        map(event => event.type === 'mousemove'), // the 'mousemove' event arms the listener
      );

    fromEvent<Event>(this.host, 'dblclick')
      .pipe(
        withLatestFrom(enabled$),
        takeUntilDestroyed(),
      )
      .subscribe(([event, enabled]) => {
        event.stopPropagation(); // prevent `PartBarComponent` handling the dblclick event which would undo maximization/minimization
        if (enabled && this.view().part().isInMainArea) {
          this._router.navigate(layout => layout.toggleMaximized()).then();
        }
      });
  }

  private addHostCssClasses(): void {
    const ngClass = inject(NgClass);
    effect(() => ngClass.ngClass = this.view().classList.asList());
  }

  private installViewMenuItemAccelerators(): void {
    toObservable(this.view)
      .pipe(
        switchMap(view => this._viewContextMenuService.installMenuItemAccelerators$(this.host, view)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private createViewTabContentPortal(): Signal<ComponentPortal<unknown>> {
    return computed(() => {
      const componentType = this._workbenchConfig.viewTabComponent || ViewTabContentComponent;
      return new ComponentPortal(componentType, null, Injector.create({
        parent: this._injector,
        providers: [
          {provide: WorkbenchView, useValue: this.view()},
          {provide: VIEW_TAB_RENDERING_CONTEXT, useValue: 'tab' satisfies ViewTabRenderingContext},
        ],
      }));
    });
  }
}

/**
 * Indicates that the auxilary mouse button is pressed (usually the mouse wheel button or middle button).
 */
const AUXILARY_MOUSE_BUTTON = 4;
