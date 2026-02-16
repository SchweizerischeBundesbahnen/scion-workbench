/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders, Type} from '@angular/core';
import {SESSION_STORAGE} from './session.storage';
import {CanMatchFn, Route, Router, Routes, ROUTES} from '@angular/router';
import ViewPageComponent from './view-page/view-page.component';
import DialogPageComponent from './dialog-page/dialog-page.component';
import MessageBoxPageComponent from './message-box-page/message-box-page.component';
import PopupPageComponent from './popup-page/popup-page.component';
import RouterPageComponent from './router-page/router-page.component';
import FocusTestPageComponent from './test-pages/focus-test-page/focus-test-page.component';
import TextTestPageComponent from './test-pages/text-test-page/text-test-page.component';
import {canMatchWorkbenchDialogCapability, canMatchWorkbenchMessageBoxCapability, canMatchWorkbenchNotificationCapability, canMatchWorkbenchPart, canMatchWorkbenchPartCapability, canMatchWorkbenchPopupCapability, canMatchWorkbenchView, canMatchWorkbenchViewCapability} from '@scion/workbench';
import {CanMatchWorkbenchCapabilityDescriptor, CanMatchWorkbenchElementDescriptor, prune, RouteDescriptor} from 'workbench-testing-app-common';
import PartPageComponent from './part-page/part-page.component';
import {DialogOpenerPageComponent as MicrofrontendDialogOpenerPageComponent, MessageBoxOpenerPageComponent as MicrofrontendMessageBoxOpenerPageComponent, NotificationParamReducerTestPageComponent, PopupOpenerPageComponent as MicrofrontendPopupOpenerPageComponent} from 'workbench-client-testing-app-common';
import SizeTestPageComponent from './test-pages/size-test-page/size-test-page.component';
import NotificationPageComponent from './notification-page/notification-page.component';

@Injectable({providedIn: 'root'})
export class RouteRegistrationService {

  private readonly _sessionStorage = inject(SESSION_STORAGE);
  private readonly _router = inject(Router);

  public register(route: RouteDescriptor): void {
    // Store routes in session storage, so they are available after a page reload or in new windows.
    const routes = this._sessionStorage.get<RouteDescriptor[]>(ROUTES_STORAGE_KEY) ?? [];
    this._sessionStorage.put(ROUTES_STORAGE_KEY, [...routes, route]);

    // Replace route config. Do not use Router.resetConfig(...) to not destroy currently routed components.
    // Add the route before existing routes for Angular to match it first (higher precedence).
    this._router.config = [parseRoute(route), ...this._router.config];
  }
}

/**
 * Provides routes from session storage.
 */
export function provideRoutesFromStorage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ROUTES,
      useFactory: (): Routes => inject(SESSION_STORAGE).get<RouteDescriptor[]>(ROUTES_STORAGE_KEY)?.map(parseRoute) ?? [],
      multi: true,
    },
  ]);
}

function parseRoute(route: RouteDescriptor): Route {
  return prune({
    path: route.path,
    component: parseComponent(route.component),
    data: route.data,
    canMatch: route.canMatch?.map(parseCanMatchFn),
  }, {pruneIfEmpty: true})!;

  function parseComponent(component: string): Type<unknown> {
    switch (component) {
      case 'part-page':
        return PartPageComponent;
      case 'view-page':
        return ViewPageComponent;
      case 'dialog-page':
        return DialogPageComponent;
      case 'messagebox-page':
        return MessageBoxPageComponent;
      case 'popup-page':
        return PopupPageComponent;
      case 'notification-page':
        return NotificationPageComponent;
      case 'router-page':
        return RouterPageComponent;
      case 'focus-test-page':
        return FocusTestPageComponent;
      case 'size-test-page':
        return SizeTestPageComponent;
      case 'text-test-page':
        return TextTestPageComponent;
      case 'notification-param-reducer-test-page':
        return NotificationParamReducerTestPageComponent;
      case 'microfrontend-dialog-opener-page':
        return MicrofrontendDialogOpenerPageComponent;
      case 'microfrontend-messagebox-opener-page':
        return MicrofrontendMessageBoxOpenerPageComponent;
      case 'microfrontend-popup-opener-page':
        return MicrofrontendPopupOpenerPageComponent;
      default:
        throw Error(`[PageObjectError] Missing mapping for component '${component}'.`);
    }
  }

  function parseCanMatchFn(canMatch: CanMatchWorkbenchElementDescriptor | CanMatchWorkbenchCapabilityDescriptor): CanMatchFn {
    const fn = canMatch.fn;
    switch (fn) {
      case 'canMatchWorkbenchPart':
        return canMatchWorkbenchPart(canMatch.hint);
      case 'canMatchWorkbenchView':
        return canMatchWorkbenchView(canMatch.hint);
      case 'canMatchWorkbenchPartCapability':
        return canMatchWorkbenchPartCapability(canMatch.qualifier);
      case 'canMatchWorkbenchViewCapability':
        return canMatchWorkbenchViewCapability(canMatch.qualifier);
      case 'canMatchWorkbenchDialogCapability':
        return canMatchWorkbenchDialogCapability(canMatch.qualifier);
      case 'canMatchWorkbenchMessageBoxCapability':
        return canMatchWorkbenchMessageBoxCapability(canMatch.qualifier);
      case 'canMatchWorkbenchPopupCapability':
        return canMatchWorkbenchPopupCapability(canMatch.qualifier);
      case 'canMatchWorkbenchNotificationCapability':
        return canMatchWorkbenchNotificationCapability(canMatch.qualifier);
      default:
        throw Error(`[PageObjectError] CanMatchFn not supported: ${fn}`);
    }
  }
}

/**
 * Storage key for routes in session storage.
 */
const ROUTES_STORAGE_KEY = 'workbench-host-app.routes';
