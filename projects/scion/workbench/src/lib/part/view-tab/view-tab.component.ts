/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, HostBinding, HostListener, Inject, inject, Injector, input, NgZone, Signal} from '@angular/core';
import {fromEvent, merge, withLatestFrom} from 'rxjs';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
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
import {subscribeInside} from '@scion/toolkit/operators';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID} from '../../workbench-id';
import {NgClass} from '@angular/common';

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

  public host: HTMLElement;

  public readonly view = input.required({alias: 'viewId', transform: ((viewId: ViewId) => this._viewRegistry.get(viewId))});
  public readonly viewTabContentPortal: Signal<ComponentPortal<unknown>>;

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

  constructor(host: ElementRef<HTMLElement>,
              @Inject(WORKBENCH_ID) private _workbenchId: string,
              private _workbenchConfig: WorkbenchConfig,
              private _viewRegistry: WorkbenchViewRegistry,
              private _router: ɵWorkbenchRouter,
              private _viewDragService: ViewDragService,
              private _viewContextMenuService: ViewMenuService,
              private _injector: Injector) {
    this.host = host.nativeElement;
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
    const view = this.view();

    view.activate().then(() => {
      if (!event.dataTransfer) {
        return;
      }

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(VIEW_DRAG_TRANSFER_TYPE, view.id);
      // Use an invisible <div> as the native drag image because the effective drag image is rendered by {ViewTabDragImageRenderer}.
      event.dataTransfer.setDragImage(createElement('div', {style: {display: 'none'}}), 0, 0);

      this._viewDragService.setViewDragData({
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
    });
  }

  @HostListener('dragend', ['$event'])
  public onDragEnd(event: DragEvent): void {
    // Ensure this view stays activated if the user cancels the drag operation. But, do not push the navigation into browsing history stack.
    if (event.dataTransfer?.dropEffect === 'none') {
      this.view().activate({skipLocationChange: true}).then();
    }
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
        map(event => event.type === 'mousemove'), // the 'mousemove' event arms the listener
        subscribeInside(continueFn => zone.runOutsideAngular(continueFn)),
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
