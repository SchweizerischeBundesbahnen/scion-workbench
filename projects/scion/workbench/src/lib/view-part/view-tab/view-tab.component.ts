/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Attribute, Component, ElementRef, HostBinding, HostListener, Injector, Input, IterableChanges, IterableDiffers, NgZone, OnDestroy } from '@angular/core';
import { InternalWorkbenchView, WorkbenchView } from '../../workbench.model';
import { WorkbenchViewPartService } from '../workbench-view-part.service';
import { SciViewportComponent } from '@scion/viewport';
import { fromEvent, merge, noop, Subject } from 'rxjs';
import { InternalWorkbenchService } from '../../workbench.service';
import { WorkbenchLayoutService } from '../../workbench-layout.service';
import { WorkbenchViewRegistry } from '../../workbench-view-registry.service';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { VIEW_DRAG_TRANSFER_TYPE, ViewDragService } from '../../view-dnd/view-drag.service';
import { createElement } from '../../dom.util';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { VIEW_TAB_CONTEXT } from '../../workbench.constants';
import { WorkbenchConfig } from '../../workbench.config';
import { ViewTabContentComponent } from '../view-tab-content/view-tab-content.component';

@Component({
  selector: 'wb-view-tab',
  templateUrl: './view-tab.component.html',
  styleUrls: ['./view-tab.component.scss'],
})
export class ViewTabComponent implements OnDestroy {

  private _destroy$: Subject<void> = new Subject<void>();
  private _viewRefChange$ = new Subject<void>();
  private _context: 'tabbar' | 'tabbar-dropdown';

  public host: HTMLElement;
  public view: InternalWorkbenchView;
  public viewTabContentPortal: ComponentPortal<any>;

  @Input()
  @HostBinding('attr.viewref')
  public set viewRef(viewRef: string) {
    this.view = this._viewRegistry.getElseThrow(viewRef);
    this.viewTabContentPortal = this.createViewTabContentPortal();
    this._viewRefChange$.next();
  }

  constructor(host: ElementRef<HTMLElement>,
              // The context must be available during construction to create the portal for the view tab content.
              // The param is weak typed as a string (instead as a string literal) due to Angular restrictions when building prod.
              @Attribute('context') context: string,
              private _workbench: InternalWorkbenchService,
              private _config: WorkbenchConfig,
              private _viewRegistry: WorkbenchViewRegistry,
              private _workbenchLayout: WorkbenchLayoutService,
              private _viewport: SciViewportComponent,
              private _viewPartService: WorkbenchViewPartService,
              private _viewDragService: ViewDragService,
              private _differs: IterableDiffers,
              private _injector: Injector,
              zone: NgZone) {
    this._context = context as 'tabbar' | 'tabbar-dropdown';
    this.host = host.nativeElement;
    this.installMaximizeListener(zone);
    this.installViewCssClassListener();
  }

  @HostBinding('class.active')
  @HostBinding('class.e2e-active')
  public get active(): boolean {
    return this.view.active;
  }

  @HostBinding('class.e2e-dirty')
  public get dirty(): boolean {
    return this.view.dirty;
  }

  @HostBinding('class.blocked')
  public get blocked(): boolean {
    return this.view.blocked;
  }

  @HostListener('click')
  public onClick(): void {
    this._viewPartService.activateView(this.viewRef).then(noop);
  }

  @HostBinding('attr.draggable')
  public get draggable(): boolean {
    return this._context === 'tabbar';
  }

  @HostListener('dragstart', ['$event'])
  public onDragStart(event: DragEvent): void {
    this._viewPartService.activateView(this.viewRef).then(() => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(VIEW_DRAG_TRANSFER_TYPE, this.view.viewRef);
      // Use an invisible <div> as the native drag image because the effective drag image is rendered by {ViewTabDragImageRenderer}.
      event.dataTransfer.setDragImage(createElement('div', {style: {display: 'none'}}), 0, 0);

      this._viewDragService.setViewDragData({
        viewRef: this.view.viewRef,
        viewTitle: this.view.title,
        viewHeading: this.view.heading,
        viewClosable: this.view.closable,
        viewDirty: this.view.dirty,
        viewUrlSegments: this.view.urlSegments,
        viewPartRef: this.view.viewPart.viewPartRef,
        viewTabPointerOffsetX: event.offsetX,
        viewTabPointerOffsetY: event.offsetY,
        viewTabWidth: (event.target as HTMLElement).offsetWidth,
        viewTabHeight: (event.target as HTMLElement).offsetHeight,
        appInstanceId: this._workbench.appInstanceId,
      });
    });
  }

  @HostListener('dragend', ['$event'])
  public onDragEnd(event: DragEvent): void {
    // Ensure this view stays activated if the user cancels the drag operation.
    if (event.dataTransfer.dropEffect === 'none') {
      this._viewPartService.activateView(this.viewRef).then();
    }
    this._viewDragService.unsetViewDragData();
  }

  /**
   * Returns 'true' if this viewtab is fully scrolled into the viewport.
   */
  public isVisibleInViewport(): boolean {
    return this._viewport.isElementInView(this.host, 'full');
  }

  /**
   * Scrolls this viewtab into the viewport if not fully visible in the viewport.
   */
  public scrollIntoViewport(): void {
    if (!this.isVisibleInViewport()) {
      this._viewport.scrollIntoView(this.host);
    }
  }

  public get viewRef(): string {
    return this.view.viewRef;
  }

  /**
   * Listens for 'dblclick' events to maximize or minimize the application main content, unless closing views quickly.
   */
  private installMaximizeListener(zone: NgZone): void {
    // Install listeners outside the Angular zone to not change detect the application upon every mouse event.
    zone.runOutsideAngular(() => {
      let enabled = false;

      merge(fromEvent(this.host, 'mouseenter'), fromEvent(this.host, 'mousemove'), fromEvent(this.host, 'mouseleave'))
        .pipe(takeUntil(this._destroy$))
        .subscribe((event: Event) => {
          enabled = (event.type === 'mousemove');
        });

      fromEvent(this.host, 'dblclick')
        .pipe(takeUntil(this._destroy$))
        .subscribe((event: Event) => {
          event.stopPropagation(); // prevent `ViewPartBarComponent` handling the dblclick event which would undo maximization/minimization
          if (enabled) {
            zone.run(() => this._workbenchLayout.toggleMaximized());
          }
        });
    });
  }

  /**
   * Adds view specific CSS classes to the <view-tab>, e.g. used for e2e testing.
   */
  private installViewCssClassListener(): void {
    const differ = this._differs.find([]).create<string>();

    this._viewRefChange$
      .pipe(
        switchMap(() => this.view.cssClasses$),
        map(cssClasses => differ.diff(cssClasses)),
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((diff: IterableChanges<string>) => {
        diff.forEachAddedItem(({item}) => this.host.classList.add(item));
        diff.forEachRemovedItem(({item}) => this.host.classList.remove(item));
      });
  }

  private createViewTabContentPortal(): ComponentPortal<any> {
    const injector = new PortalInjector(
      this._injector,
      new WeakMap()
        .set(WorkbenchView, this.view)
        .set(VIEW_TAB_CONTEXT, this._context),
    );
    return new ComponentPortal(this._config.viewTabComponent || ViewTabContentComponent, null, injector);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
