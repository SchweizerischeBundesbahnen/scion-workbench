/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Attribute, Component, ElementRef, HostBinding, HostListener, Injector, Input, IterableChanges, IterableDiffers, NgZone, OnDestroy} from '@angular/core';
import {SciViewportComponent} from '@scion/components/viewport';
import {fromEvent, merge, Subject, withLatestFrom} from 'rxjs';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {VIEW_DRAG_TRANSFER_TYPE, ViewDragService} from '../../view-dnd/view-drag.service';
import {createElement} from '../../common/dom.util';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {VIEW_TAB_CONTEXT} from '../../workbench.constants';
import {WorkbenchModuleConfig} from '../../workbench-module-config';
import {ViewTabContentComponent} from '../view-tab-content/view-tab-content.component';
import {ViewMenuService} from '../view-context-menu/view-menu.service';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {subscribeInside} from '@scion/toolkit/operators';
import {ɵWorkbenchService} from '../../ɵworkbench.service';

/**
 * Indicates that the auxilary mouse button is pressed (usually the mouse wheel button or middle button).
 */
const AUXILARY_MOUSE_BUTTON = 4;

@Component({
  selector: 'wb-view-tab',
  templateUrl: './view-tab.component.html',
  styleUrls: ['./view-tab.component.scss'],
  standalone: true,
  imports: [PortalModule],
})
export class ViewTabComponent implements OnDestroy {

  private _destroy$: Subject<void> = new Subject<void>();
  private _viewIdChange$ = new Subject<void>();
  private _context: 'tabbar' | 'tabbar-dropdown';

  public host: HTMLElement;
  public view!: ɵWorkbenchView;
  public viewTabContentPortal!: ComponentPortal<any>;

  @Input()
  @HostBinding('attr.data-viewid')
  public set viewId(viewId: string) {
    this.view = this._viewRegistry.get(viewId);
    this.viewTabContentPortal = this.createViewTabContentPortal();
    this._viewIdChange$.next();
  }

  public get viewId(): string {
    return this.view.id;
  }

  constructor(host: ElementRef<HTMLElement>,
              // The context must be available during construction to create the portal for the view tab content.
              // The param is weak typed as a string (instead as a string literal) due to Angular restrictions when building prod.
              @Attribute('context') context: string,
              private _workbenchService: ɵWorkbenchService,
              private _workbenchModuleConfig: WorkbenchModuleConfig,
              private _viewRegistry: WorkbenchViewRegistry,
              private _router: WorkbenchRouter,
              private _viewport: SciViewportComponent,
              private _part: ɵWorkbenchPart,
              private _viewDragService: ViewDragService,
              private _differs: IterableDiffers,
              private _viewContextMenuService: ViewMenuService,
              private _injector: Injector,
              zone: NgZone) {
    this._context = context as 'tabbar' | 'tabbar-dropdown';
    this.host = host.nativeElement;
    this.installMaximizeListener(zone);
    this.installViewCssClassListener();
    this.installViewMenuItemAccelerators();
  }

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view.active;
  }

  @HostBinding('class.dirty')
  public get dirty(): boolean {
    return this.view.dirty;
  }

  @HostBinding('class.blocked')
  public get blocked(): boolean {
    return this.view.blocked;
  }

  @HostListener('click')
  public onClick(): void {
    this._part.activateView(this.viewId).then();
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
    this._viewContextMenuService.showMenu({x: event.clientX, y: event.clientY}, this.viewId).then();
    event.stopPropagation();
    event.preventDefault();
  }

  @HostBinding('attr.tabindex')
  public get tabindex(): number {
    return -1; // make the view focusable to install view menu accelerators
  }

  @HostBinding('attr.draggable')
  public get draggable(): boolean {
    return this._context === 'tabbar';
  }

  @HostListener('dragstart', ['$event'])
  public onDragStart(event: DragEvent): void {
    this._part.activateView(this.viewId).then(() => {
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
        viewTabWidth: (event.target as HTMLElement).offsetWidth,
        viewTabHeight: (event.target as HTMLElement).offsetHeight,
        appInstanceId: this._workbenchService.appInstanceId,
      });
    });
  }

  @HostListener('dragend', ['$event'])
  public onDragEnd(event: DragEvent): void {
    // Ensure this view stays activated if the user cancels the drag operation. But, do not push the navigation into browsing history stack.
    if (event.dataTransfer?.dropEffect === 'none') {
      this._part.activateView(this.viewId, {skipLocationChange: true}).then();
    }
    this._viewDragService.unsetViewDragData();
  }

  /**
   * Indicates whether this view tab is the drag source of a current view drag operation.
   */
  public isDragSource(): boolean {
    return this._viewDragService.viewDragData?.viewId === this.viewId;
  }

  /**
   * Returns whether this tab is fully scrolled into view.
   */
  public isScrolledIntoView(): boolean {
    return this._viewport.isElementInView(this.host, 'full');
  }

  /**
   * Scrolls this tab into view.
   */
  public scrollIntoView(): void {
    if (!this.isScrolledIntoView()) {
      this._viewport.scrollIntoView(this.host);
    }
  }

  /**
   * Listens for 'dblclick' events to maximize or minimize the main area.
   *
   * Note that the listener is not activated until the mouse is moved. Otherwise, closing successive
   * views (if they have different tab widths) could result in unintended maximization or minimization.
   */
  private installMaximizeListener(zone: NgZone): void {
    const enabled$ = merge(fromEvent(this.host, 'mouseenter'), fromEvent(this.host, 'mousemove'), fromEvent(this.host, 'mouseleave'))
      .pipe(
        map(event => event.type === 'mousemove'), // the 'mousemove' event arms the listener
        subscribeInside(continueFn => zone.runOutsideAngular(continueFn)),
      );

    fromEvent(this.host, 'dblclick')
      .pipe(
        withLatestFrom(enabled$),
        takeUntil(this._destroy$),
      )
      .subscribe(([event, enabled]) => {
        event.stopPropagation(); // prevent `PartBarComponent` handling the dblclick event which would undo maximization/minimization
        if (enabled && this._part.isInMainArea) {
          this._router.ɵnavigate(layout => layout.toggleMaximized()).then();
        }
      });
  }

  /**
   * Adds view specific CSS classes to the <view-tab>.
   */
  private installViewCssClassListener(): void {
    const differ = this._differs.find([]).create<string>();

    this._viewIdChange$
      .pipe(
        switchMap(() => this.view.cssClasses$),
        map(cssClasses => differ.diff(cssClasses)),
        filter((diff): diff is IterableChanges<string> => diff !== null),
        takeUntil(this._destroy$),
      )
      .subscribe((diff: IterableChanges<string>) => {
        diff.forEachAddedItem(({item}) => this.host.classList.add(item));
        diff.forEachRemovedItem(({item}) => this.host.classList.remove(item));
      });
  }

  private installViewMenuItemAccelerators(): void {
    this._viewIdChange$
      .pipe(
        switchMap(() => this._viewContextMenuService.installMenuItemAccelerators$(this.host, this.view)),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private createViewTabContentPortal(): ComponentPortal<any> {
    const injector = Injector.create({
      parent: this._injector,
      providers: [
        {provide: WorkbenchView, useValue: this.view},
        {provide: VIEW_TAB_CONTEXT, useValue: this._context},
      ],
    });
    return new ComponentPortal(this._workbenchModuleConfig.viewTabComponent || ViewTabContentComponent, null, injector);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
