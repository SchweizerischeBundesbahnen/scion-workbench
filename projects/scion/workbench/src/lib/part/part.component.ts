/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, DestroyRef, effect, ElementRef, inject, Injector, OnInit, untracked} from '@angular/core';
import {ViewDropZoneDirective, WbViewDropEvent} from '../view-dnd/view-drop-zone.directive';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {Logger, LoggerNames} from '../logging';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {PartBarComponent} from './part-bar/part-bar.component';
import {WorkbenchPortalOutletDirective} from '../portal/workbench-portal-outlet.directive';
import {ViewPortalPipe} from '../view/view-portal.pipe';
import {WORKBENCH_ID} from '../workbench-id';
import {SciViewportComponent} from '@scion/components/viewport';
import {RouterOutletRootContextDirective} from '../routing/router-outlet-root-context.directive';
import {RouterOutlet} from '@angular/router';
import {dasherize} from '../common/dasherize.util';
import {NullContentComponent} from '../null-content/null-content.component';
import {registerFocusTracker, WorkbenchFocusTracker} from '../focus/workbench-focus-tracker.service';
import {synchronizeCssClasses} from '../common/css-class.util';
import {WORKBENCH_PART_REGISTRY} from './workbench-part.registry';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {WORKBENCH_POPUP_REGISTRY} from '../popup/workbench-popup.registry';

@Component({
  selector: 'wb-part',
  templateUrl: './part.component.html',
  styleUrls: ['./part.component.scss'],
  imports: [
    PartBarComponent,
    ViewDropZoneDirective,
    WorkbenchPortalOutletDirective,
    RouterOutlet,
    RouterOutletRootContextDirective,
    ViewPortalPipe,
    SciViewportComponent,
    NullContentComponent,
  ],
  host: {
    '[attr.data-partid]': 'part.id',
    '[attr.data-peripheral]': `part.peripheral() ? '' : undefined`,
    '[attr.data-grid]': 'dasherize(part.gridName())',
    '[attr.data-focus]': `focusTracker.activeElement() === part.id ? '' : null`,
    '[attr.data-active]': `part.active() ? '' : null`,
    '[attr.data-activation-instant]': `part.activationInstant()`,
    '[attr.tabindex]': '-1',
    // TODO remove and migrate tests to data-active
    '[class.active]': 'part.active()',
  },
})
export class PartComponent implements OnInit {

  private readonly _workbenchId = inject(WORKBENCH_ID);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _injector = inject(Injector);
  private readonly _cd = inject(ChangeDetectorRef);

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly canDrop = inject(ViewDragService).canDrop(inject(ɵWorkbenchPart));
  protected readonly dasherize = dasherize;
  protected readonly focusTracker = inject(WorkbenchFocusTracker);

  constructor() {
    this.part.partComponent = inject(ElementRef).nativeElement as HTMLElement;
    this.installComponentLifecycleLogger();
    this.constructInactiveViewComponents();
    this.addHostCssClasses();

    const host = inject(ElementRef).nativeElement as HTMLElement;
    const focusTracker = inject(WorkbenchFocusTracker);
    const viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
    const partRegistry = inject(WORKBENCH_PART_REGISTRY);
    const popupRegistry = inject(WORKBENCH_POPUP_REGISTRY);

    registerFocusTracker(host, () => this.part.viewIds().length ? this.part.activeViewId() : this.part.id);

    // Activate on Focus-In
    effect(() => {
      const activeElement = focusTracker.activeElement();
      if (!activeElement) {
        return;
      }

      untracked(() => {
        if (activeElement === this.part.id) {
          void this.part.activate({force: true});
        }
        else if (activeElement === this.part.activeViewId()) {
          void viewRegistry.get(this.part.activeViewId()!).activate({force: true});
        }
      });
    });

    const dialogRegistry = inject(WorkbenchDialogRegistry);

    // Focus on actication.
    effect(() => {
      this.part.activationInstant();
      const activeView = this.part.activeViewId() ? untracked(() => viewRegistry.get(this.part.activeViewId()!)) : null;
      activeView?.activationInstant();

      untracked(() => {
        if (!this.part.active()) {
          return;
        }

        const hasViews = this.part.viewIds().length > 0;
        if (hasViews && activeView) {
          if (!activeView.activationInstant()) {
            return;
          }

          if (popupRegistry.objects().some(popup => popup.context.view?.id === this.part.activeViewId())) {
            console.log('>>> BLOCKED BY POPUP');
            return;
          }
          if (dialogRegistry.dialogs().some(dialog => dialog.context.view?.id === this.part.activeViewId())) {
            console.log('>>> BLOCKED BY DIALOG');
            return;
          }

          // Do not activate if other view or part is activated later on (e.g., when restoring layout after minimize)
          if (partRegistry.objects().find(part => part.activationInstant() > activeView.activationInstant()) || viewRegistry.objects().find(view => view.activationInstant() > activeView.activationInstant())) {
            return;
          }

          if (focusTracker.activeElement() !== activeView.id) {
            requestAnimationFrame(() => activeView.focus());
          }
        }
        else if (!hasViews) {
          if (!this.part.activationInstant()) {
            return;
          }
          console.log('>>> active part', this.part.id, this.part.activationInstant());

          // Do not activate if other part or view is activated later on (e.g., when restoring layout after minimize)
          if (partRegistry.objects().find(part => part.activationInstant() > this.part.activationInstant()) || viewRegistry.objects().find(view => view.activationInstant() > this.part.activationInstant())) {
            console.log('>>> active part [skip focus]', this.part.id);
            return;
          }
          console.log('>>> active part [FOCUS]', this.part.id);
          if (focusTracker.activeElement() !== this.part.id) {
            requestAnimationFrame(() => host.focus());
          }
        }
      });

    });
  }

  public ngOnInit(): void {
    // Perform a manual change detection run to avoid `ExpressionChangedAfterItHasBeenCheckedError` that would occur
    // when the view sets view properties in its constructor. Because the view tab is located before the view in the
    // Angular component tree, Angular checks the view tab for changes before the view. Therefore, if the view sets
    // its title during construction, then the view tab label will also change, causing the error.
    this._cd.detectChanges();
  }

  /**
   * Method invoked to move a view into this part.
   */
  protected onViewDrop(event: WbViewDropEvent): void {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        workbenchId: event.dragData.workbenchId,
        partId: event.dragData.partId,
        viewId: event.dragData.viewId,
        alternativeViewId: event.dragData.alternativeViewId,
        navigation: event.dragData.navigation,
        classList: event.dragData.classList,
      },
      target: {
        workbenchId: this._workbenchId,
        elementId: this.part.id,
        region: event.dropRegion === 'center' ? undefined : event.dropRegion,
      },
      dragData: event.dragData,
    });
  }

  /**
   * Constructs view components of inactive views, so they can initialize, e.g., to set the view tab title.
   */
  private constructInactiveViewComponents(): void {
    effect(() => {
      const viewIds = this.part.viewIds();
      untracked(() => viewIds
        .map(viewId => this._viewRegistry.get(viewId))
        .filter(view => !view.active() && !view.portal.isConstructed)
        .forEach(inactiveView => {
          inactiveView.portal.createComponentFromInjectionContext(this._injector);
        }));
    });
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, this.part.classList.asList);
  }

  private installComponentLifecycleLogger(): void {
    const logger = inject(Logger);
    logger.debug(() => `Constructing PartComponent [partId=${this.part.id}]`, LoggerNames.LIFECYCLE);
    inject(DestroyRef).onDestroy(() => logger.debug(() => `Destroying PartComponent [partId=${this.part.id}]'`, LoggerNames.LIFECYCLE));
  }
}
