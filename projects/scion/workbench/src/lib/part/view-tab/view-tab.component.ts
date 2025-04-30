/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, HostListener, inject, Injector, input, NgZone, Signal} from '@angular/core';
import {fromEvent, merge, withLatestFrom} from 'rxjs';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {map} from 'rxjs/operators';
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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WORKBENCH_ID} from '../../workbench-id';
import {boundingClientRect} from '@scion/components/dimension';
import {UUID} from '@scion/toolkit/uuid';
import {synchronizeCssClasses} from '../../common/css-class.util';
import {TextPipe} from '../../text/text.pipe';
import {IconComponent} from '../../icon/icon.component';

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
    PortalModule,
    TextPipe,
    IconComponent,
  ],
  host: {
    '[class.view-drag]': 'viewDragService.dragging()',
    '[class.active]': 'view().active()',
    '[class.part-active]': 'view().part().active()',
    '[class.e2e-dirty]': 'view().dirty()',
    '[attr.data-viewid]': 'view().id',
    '[attr.draggable]': 'true',
    '[attr.tabindex]': '-1', // make the view focusable to install view menu accelerators
    '[style.--sci-workbench-tab-title-offset-right]': 'viewTitleOffsetRight()',
  },
})
export class ViewTabComponent {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _workbenchConfig = inject(WorkbenchConfig);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _router = inject(ɵWorkbenchRouter);
  private readonly _viewMenuService = inject(ViewMenuService);
  private readonly _injector = inject(Injector);

  public readonly host = inject(ElementRef).nativeElement as HTMLElement;
  public readonly view = input.required({alias: 'viewId', transform: (viewId: ViewId) => this._viewRegistry.get(viewId)});
  public readonly boundingClientRect = boundingClientRect(inject(ElementRef));

  protected readonly viewTabContentPortal: Signal<ComponentPortal<unknown>>;
  protected readonly viewDragService = inject(ViewDragService);
  protected readonly viewTitleOffsetRight = computed(() => this.view().closable() ? '1.5rem' : undefined); // offset for the title to not overlap the close button

  constructor() {
    this.installMaximizeListener();
    this.addHostCssClasses();
    this.installMenuAccelerators();
    this.viewTabContentPortal = this.createViewTabContentPortal();
  }

  @HostListener('click')
  protected onClick(): void {
    void this.view().activate();
  }

  protected onClose(event: MouseEvent): void {
    event.stopPropagation(); // prevent the view from being activated

    if (event.altKey) {
      void this.view().close('other-views');
    }
    else {
      void this.view().close();
    }
  }

  @HostListener('mousedown', ['$event'])
  protected onMousedown(event: MouseEvent): void {
    if (event.buttons === AUXILARY_MOUSE_BUTTON) {
      void this.view().close();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  @HostListener('contextmenu', ['$event'])
  protected onContextmenu(event: MouseEvent): void {
    void this._viewMenuService.showMenu({x: event.clientX, y: event.clientY}, this.view().id);
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('dragstart', ['$event'])
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
    });

    if (!view.active()) {
      void view.activate();
    }
  }

  @HostListener('dragend')
  protected onDragEnd(): void {
    this.viewDragService.unsetViewDragData();
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
          void this._router.navigate(layout => layout.toggleMaximized());
        }
      });
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, computed(() => this.view().classList.asList()));
  }

  private installMenuAccelerators(): void {
    this._viewMenuService.installMenuAccelerators(this.host, this.view);
  }

  private createViewTabContentPortal(): Signal<ComponentPortal<unknown>> {
    return computed(() => {
      const componentType = this._workbenchConfig.viewTabComponent ?? ViewTabContentComponent;
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
