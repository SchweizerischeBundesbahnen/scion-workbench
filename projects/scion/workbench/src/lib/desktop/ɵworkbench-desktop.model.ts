/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChildrenOutletContexts, UrlSegment} from '@angular/router';
import {ComponentType} from '@angular/cdk/portal';
import {WbComponentPortal} from '../portal/wb-component-portal';
import {inject, InjectionToken} from '@angular/core';
import {WorkbenchDesktop} from './workbench-desktop.model';
import {DesktopComponent} from './desktop.component';
import {ClassList} from '../common/class-list';
import {provideDesktopContext} from './desktop-context-provider';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {DESKTOP_OUTLET} from '../layout/workbench-layout';
import {ViewState} from '../routing/routing.model';

export class ɵWorkbenchDesktop implements WorkbenchDesktop {

  private readonly _childrenOutletContexts = inject(ChildrenOutletContexts);

  public navigationId: string | undefined;
  public navigationHint: string | undefined;
  public urlSegments: UrlSegment[] = [];
  public state: ViewState = {};
  public readonly portal: WbComponentPortal;
  public readonly classList = new ClassList();

  constructor(options: {component: ComponentType<DesktopComponent>}) {
    this.portal = this.createPortal(options.component);
  }

  /**
   * Method invoked when the workbench layout has changed.
   *
   * This method:
   * - is called on every layout change, including changes not relevant for this view.
   * - is called after successful navigation, i.e., after {@link onRouteActivate}.
   */
  public onLayoutChange(layout: ɵWorkbenchLayout): void {
    this.urlSegments = layout.urlSegments({name: DESKTOP_OUTLET});
    this.navigationId = layout.desktop.navigation?.id;
    this.navigationHint = layout.desktop.navigation?.hint;
    this.state = layout.navigationalState({id: DESKTOP_OUTLET});
    this.classList.set(layout.desktop.navigation?.cssClass, {scope: 'navigation'});
  }

  private createPortal(desktopComponent: ComponentType<DesktopComponentAny>): WbComponentPortal {
    return new WbComponentPortal(desktopComponent, {
      providers: [
        provideDesktopContext(this),
        // For each desktop, the workbench registers auxiliary routes of all top-level routes, enabling routing on a per-desktop basis.
        // But, if the workbench component itself is displayed in a router outlet, desktop outlets are not top-level outlets.
        // Therefore, we instruct the outlet to act as a top-level outlet to be the target of the registered top-level desktop routes.
        {provide: ChildrenOutletContexts, useValue: this._childrenOutletContexts},
      ],
    });
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    this.classList.set(cssClass, {scope: 'application'});
  }

  /** @inheritDoc */
  public get cssClass(): string[] {
    return this.classList.get({scope: 'application'});
  }

  public destroy(): void {
    this.portal.destroy();
  }
}

/**
 * Represents a pseudo-type for the actual {@link DesktopComponent} which must not be referenced in order to avoid import cycles.
 */
type DesktopComponentAny = any;

/**
 * DI token to get a unique token for this app instance. This token is different each time the app is reloaded.
 */
export const WORKBENCH_DESKTOP = new InjectionToken<ɵWorkbenchDesktop>('WORKBENCH_DESKTOP', {
  providedIn: 'root',
  factory: () => new ɵWorkbenchDesktop({component: DesktopComponent}),
});
