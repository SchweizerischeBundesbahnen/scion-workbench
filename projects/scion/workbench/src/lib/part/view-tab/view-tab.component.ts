/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, HostListener, Inject, inject, Injector, Input, IterableChanges, IterableDiffers, NgZone, OnChanges, SimpleChanges} from '@angular/core';
import {fromEvent, merge, Subject, withLatestFrom} from 'rxjs';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {filter, map, switchMap} from 'rxjs/operators';
import {VIEW_DRAG_TRANSFER_TYPE, ViewDragService} from '../../view-dnd/view-drag.service';
import {createElement} from '../../common/dom.util';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from '../../workbench.constants';
import {WorkbenchModuleConfig} from '../../workbench-module-config';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {ViewMenuService} from '../view-context-menu/view-menu.service';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {subscribeInside} from '@scion/toolkit/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NgIf} from '@angular/common';
import {WORKBENCH_ID} from '../../workbench-id';

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
    NgIf,
    PortalModule,
  ],
})
export class ViewTabComponent implements OnChanges {

  private _ngOnChanges$ = new Subject<void>();

  public host: HTMLElement;
  public view!: ɵWorkbenchView;
  public viewTabContentPortal!: ComponentPortal<unknown>;

  @Input({required: true})
  @HostBinding('attr.data-viewid')
  public viewId!: string;

  @HostBinding('attr.draggable')
  public draggable = true;

  @HostBinding('attr.tabindex')
  public tabindex = -1; // make the view focusable to install view menu accelerators

  /**
   * Indicates if dragging a view tab over this view tab's tabbar.
   */
  @HostBinding('class.drag-over-tabbar')
  public get isDragOverTabbar(): boolean {
    return this._viewDragService.isDragOverTabbar === this.view.part.id;
  }

  constructor(host: ElementRef<HTMLElement>,
              @Inject(WORKBENCH_ID) private _workbenchId: string,
              private _workbenchModuleConfig: WorkbenchModuleConfig,
              private _viewRegistry: WorkbenchViewRegistry,
              private _router: WorkbenchRouter,
              private _viewDragService: ViewDragService,
              private _differs: IterableDiffers,
              private _viewContextMenuService: ViewMenuService,
              private _injector: Injector) {
    this.host = host.nativeElement;
    this.installMaximizeListener();
    this.installViewCssClassListener();
    this.installViewMenuItemAccelerators();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.view = this._viewRegistry.get(this.viewId);
    this.viewTabContentPortal = this.createViewTabContentPortal();
    this._ngOnChanges$.next();
  }

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view.active;
  }

  @HostBinding('class.part-active')
  public get partActive(): boolean {
    return this.view.part.active;
  }

  @HostBinding('class.e2e-dirty')
  public get dirty(): boolean {
    return this.view.dirty;
  }

  @HostListener('click')
  public onClick(): void {
    this.view.activate().then();
  }

  public onClose(event: Event): void {
    event.stopPropagation(); // prevent the view from being activated
    this.view.close().then();
  }

  @HostListener('mousedown', ['$event'])
  public onMousedown(event: MouseEvent): void {
    if (event.buttons === AUXILARY_MOUSE_BUTTON) {
      this.view.close().then();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  @HostListener('contextmenu', ['$event'])
  public onContextmenu(event: MouseEvent): void {
    this._viewContextMenuService.showMenu({x: event.clientX, y: event.clientY}, this.view.id).then();
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('dragstart', ['$event'])
  public onDragStart(event: DragEvent): void {
    this.view.activate().then(() => {
      if (!event.dataTransfer) {
        return;
      }

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(VIEW_DRAG_TRANSFER_TYPE, this.view.id);
      // Use an invisible <div> as the native drag image because the effective drag image is rendered by {ViewTabDragImageRenderer}.
      event.dataTransfer.setDragImage(createElement('div', {style: {display: 'none'}}), 0, 0);

      this._viewDragService.setViewDragData({
        viewId: this.view.id,
        viewTitle: this.view.title ?? '',
        viewHeading: this.view.heading ?? '',
        viewClosable: this.view.closable,
        viewDirty: this.view.dirty,
        viewUrlSegments: this.view.urlSegments,
        partId: this.view.part.id,
        viewTabPointerOffsetX: event.offsetX,
        viewTabPointerOffsetY: event.offsetY,
        viewTabWidth: this.host.getBoundingClientRect().width,
        viewTabHeight: this.host.getBoundingClientRect().height,
        workbenchId: this._workbenchId,
        classList: this.view.classList.toMap(),
      });
    });
  }

  @HostListener('dragend', ['$event'])
  public onDragEnd(event: DragEvent): void {
    // Ensure this view stays activated if the user cancels the drag operation. But, do not push the navigation into browsing history stack.
    if (event.dataTransfer?.dropEffect === 'none') {
      this.view.activate({skipLocationChange: true}).then();
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
    const enabled$ = merge(fromEvent(this.host, 'mouseenter'), fromEvent(this.host, 'mousemove'), fromEvent(this.host, 'mouseleave'))
      .pipe(
        map(event => event.type === 'mousemove'), // the 'mousemove' event arms the listener
        subscribeInside(continueFn => zone.runOutsideAngular(continueFn)),
      );

    fromEvent(this.host, 'dblclick')
      .pipe(
        withLatestFrom(enabled$),
        takeUntilDestroyed(),
      )
      .subscribe(([event, enabled]) => {
        event.stopPropagation(); // prevent `PartBarComponent` handling the dblclick event which would undo maximization/minimization
        if (enabled && this.view.part.isInMainArea) {
          this._router.ɵnavigate(layout => layout.toggleMaximized()).then();
        }
      });
  }

  /**
   * Adds view specific CSS classes to the view-tab.
   */
  private installViewCssClassListener(): void {
    const differ = this._differs.find([]).create<string>();

    this._ngOnChanges$
      .pipe(
        switchMap(() => this.view.classList.value$),
        map(cssClasses => differ.diff(cssClasses)),
        filter((diff): diff is IterableChanges<string> => diff !== null),
        takeUntilDestroyed(),
      )
      .subscribe((diff: IterableChanges<string>) => {
        diff.forEachAddedItem(({item}) => this.host.classList.add(item));
        diff.forEachRemovedItem(({item}) => this.host.classList.remove(item));
      });
  }

  private installViewMenuItemAccelerators(): void {
    this._ngOnChanges$
      .pipe(
        switchMap(() => this._viewContextMenuService.installMenuItemAccelerators$(this.host, this.view)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  private createViewTabContentPortal(): ComponentPortal<unknown> {
    const componentType = this._workbenchModuleConfig.viewTabComponent || ViewTabContentComponent;
    return new ComponentPortal(componentType, null, Injector.create({
      parent: this._injector,
      providers: [
        {provide: WorkbenchView, useValue: this.view},
        {provide: VIEW_TAB_RENDERING_CONTEXT, useValue: 'tab' satisfies ViewTabRenderingContext},
      ],
    }));
  }
}

/**
 * Indicates that the auxilary mouse button is pressed (usually the mouse wheel button or middle button).
 */
const AUXILARY_MOUSE_BUTTON = 4;
