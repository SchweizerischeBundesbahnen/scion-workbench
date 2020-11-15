/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { ViewComponent } from './view.component';
import { ViewActivationInstantProvider } from './view-activation-instant-provider.service';
import { Router, UrlSegment } from '@angular/router';
import { ViewDragService } from '../view-dnd/view-drag.service';
import { WorkbenchViewPartRegistry } from '../view-part/workbench-view-part.registry';
import { WorkbenchLayoutService } from '../layout/workbench-layout.service';
import { map } from 'rxjs/operators';
import { filterArray, mapArray } from '@scion/toolkit/operators';
import { Arrays } from '@scion/toolkit/util';
import { Injector, Type } from '@angular/core';
import { Disposable } from '../disposable';
import { WorkbenchMenuItem, WorkbenchMenuItemFactoryFn } from '../workbench.model';
import { WorkbenchView } from './workbench-view.model';
import { WorkbenchViewPart } from '../view-part/workbench-view-part.model';
import { ɵWorkbenchService } from '../ɵworkbench.service';

export class ɵWorkbenchView implements WorkbenchView { // tslint:disable-line:class-name

  private readonly _menuItemProviders$ = new BehaviorSubject<WorkbenchMenuItemFactoryFn[]>([]);
  private readonly _workbench: ɵWorkbenchService;
  private readonly _layoutService: WorkbenchLayoutService;
  private readonly _viewPartRegistry: WorkbenchViewPartRegistry;
  private readonly _viewDragService: ViewDragService;
  private readonly _router: Router;
  private readonly _viewActivationInstantProvider: ViewActivationInstantProvider;

  public title: string;
  public heading: string;
  public dirty: boolean;
  public closable: boolean;
  public blocked: boolean;

  public scrollTop: number | null;
  public scrollLeft: number | null;
  public activationInstant: number;

  public readonly active$: BehaviorSubject<boolean>;
  public readonly cssClasses$: BehaviorSubject<string[]>;
  public readonly menuItems$: Observable<WorkbenchMenuItem[]>;

  constructor(public readonly viewId: string,
              public readonly portal: WbComponentPortal<ViewComponent>,
              active: boolean,
              injector: Injector) {
    this._workbench = injector.get(ɵWorkbenchService);
    this._layoutService = injector.get(WorkbenchLayoutService);
    this._viewPartRegistry = injector.get(WorkbenchViewPartRegistry);
    this._viewDragService = injector.get(ViewDragService);
    this._router = injector.get(Router);
    this._viewActivationInstantProvider = injector.get(ViewActivationInstantProvider);

    this.active$ = new BehaviorSubject<boolean>(active);
    this.cssClasses$ = new BehaviorSubject<string[]>([]);
    this.title = viewId;
    this.closable = true;

    this.menuItems$ = combineLatest([this._menuItemProviders$, this._workbench.viewMenuItemProviders$])
      .pipe(
        map(([localMenuItemProviders, globalMenuItemProviders]) => localMenuItemProviders.concat(globalMenuItemProviders)),
        mapArray<WorkbenchMenuItemFactoryFn, WorkbenchMenuItem>(menuItemFactoryFn => menuItemFactoryFn(this)),
        filterArray<WorkbenchMenuItem>(Boolean),
      );
  }

  public get first(): boolean {
    return this.position === 0;
  }

  public get last(): boolean {
    return this.position === this.part.viewIds.length - 1;
  }

  public get position(): number {
    return this.part.viewIds.indexOf(this.viewId);
  }

  public set cssClass(cssClass: string | string[]) {
    this.cssClasses$.next(Arrays.coerce(cssClass));
  }

  public get cssClasses(): string[] {
    return this.cssClasses$.value;
  }

  public get active(): boolean {
    return this.active$.getValue();
  }

  public activate(activate: boolean): void {
    if (activate) {
      this.activationInstant = this._viewActivationInstantProvider.instant;
    }
    this.active$.next(activate);
  }

  public get part(): WorkbenchViewPart {
    // DO NOT resolve the part at construction time because it can change, e.g. when this view is moved to another part.

    // Lookup the part from the element injector.
    // The element injector is only available for the currently active view. Inactive views are removed
    // from the Angular component tree and have, therefore, no element injector.
    const viewPart = this.portal.injector.get(WorkbenchViewPart as Type<WorkbenchViewPart>, null);
    if (viewPart !== null) {
      return viewPart;
    }

    const part = this._layoutService.layout.findPartByViewId(this.viewId, {orElseThrow: true});
    return this._viewPartRegistry.getElseThrow(part.partId);
  }

  public close(target?: 'self' | 'all-views' | 'other-views' | 'views-to-the-right' | 'views-to-the-left'): Promise<boolean> {
    switch (target || 'self') {
      case 'self': {
        return this._workbench.destroyView(this.viewId);
      }
      case 'all-views': {
        return this._workbench.destroyView(...this.part.viewIds);
      }
      case 'other-views': {
        return this._workbench.destroyView(...this.part.viewIds.filter(viewId => viewId !== this.viewId));
      }
      case 'views-to-the-right': {
        const viewIds = this.part.viewIds;
        return this._workbench.destroyView(...viewIds.slice(viewIds.indexOf(this.viewId) + 1));
      }
      case 'views-to-the-left': {
        const viewIds = this.part.viewIds;
        return this._workbench.destroyView(...viewIds.slice(0, viewIds.indexOf(this.viewId)));
      }
    }
  }

  public move(region: 'north' | 'south' | 'west' | 'east' | 'blank-window'): Promise<boolean> {
    this._viewDragService.dispatchViewMoveEvent({
      source: {
        appInstanceId: this._workbench.appInstanceId,
        partId: this.part.partId,
        viewId: this.viewId,
        viewUrlSegments: this.urlSegments,
      },
      target: {
        appInstanceId: region === 'blank-window' ? 'new' : this._workbench.appInstanceId,
        partId: region === 'blank-window' ? null : this.part.partId,
        region: region === 'blank-window' ? 'center' : region,
      },
    });
    return Promise.resolve(true);
  }

  public get urlSegments(): UrlSegment[] {
    const urlTree = this._router.parseUrl(this._router.url);
    const urlSegmentGroups = urlTree.root.children;

    const viewOutlet = urlSegmentGroups[this.viewId];
    if (!viewOutlet) {
      throw Error(`[NullOutletError] View outlet not part of the URL [outlet=${this.viewId}]`);
    }

    return viewOutlet.segments;
  }

  public registerMenuItem(menuItem: WorkbenchMenuItem): Disposable {
    const factoryFn = (): WorkbenchMenuItem => menuItem;
    this._menuItemProviders$.next([...this._menuItemProviders$.value, factoryFn]);
    return {
      dispose: (): void => this._menuItemProviders$.next(Arrays.remove(this._menuItemProviders$.value, factoryFn, {firstOnly: false})),
    };
  }

  public get destroyed(): boolean {
    return this.portal.isDestroyed;
  }
}
