/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ActivatedRouteSnapshot, Params, Resolve, RouterStateSnapshot } from '@angular/router';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Injectable, NgZone } from '@angular/core';
import { AngularZoneMessageClientDecorator } from './angular-zone-message-client.decorator';
import { ApplicationConfig, Beans, MessageClient, MicrofrontendPlatform, PlatformMessageClient, PlatformState, PlatformStates } from '@scion/microfrontend-platform';
import { environment } from '../environments/environment';

/**
 * Initializes the SCION Microfrontend Platform.
 *
 * The apps to be registered with the platform are read from the environment.
 *
 * An {@link APP_INITIALIZER} cannot be used in a lazy loaded module, because the
 * application has already initialized before. That is why we use a resolver instead.
 */
@Injectable({providedIn: 'root'})
export class TestingAppPlatformInitializerResolver implements Resolve<void> {

  private resolved = false;

  constructor(private _zone: NgZone) {
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<void> {
    // Make sure that this resolver is called only once per app instance.
    // For example, if activators are loaded via lazy-loaded routes, Angular will call this resolver twice.
    if (this.resolved) {
      return Promise.resolve();
    }
    this.resolved = true;

    if (window === window.top) {
      return this.startHostPlatform(route.queryParams);
    }
    else {
      return this.startClientPlatform();
    }
  }

  private startHostPlatform(queryParams: Params): Promise<void> {
    // Make the platform to run with Angular
    Beans.get(PlatformState).whenState(PlatformStates.Starting).then(() => {
      Beans.register(NgZone, {useValue: this._zone});
      Beans.registerDecorator(MessageClient, {useClass: AngularZoneMessageClientDecorator});
      Beans.registerDecorator(PlatformMessageClient, {useClass: AngularZoneMessageClientDecorator});
    });

    // Read the config from the query params
    const manifestClassifier = queryParams['manifestClassifier'] ? `-${queryParams['manifestClassifier']}` : '';
    const activatorApiDisabled = coerceBooleanProperty(queryParams['activatorApiDisabled']);
    const intentionRegisterApiDisabled = new Set((queryParams['intentionRegisterApiDisabled'] || '').split(','));

    // Read the apps from the environment
    const apps: ApplicationConfig[] = Object.values(environment.apps).map(app => {
      return {
        manifestUrl: `${app.url}/testing-app/assets/${app.symbolicName}-manifest${manifestClassifier}.json`,
        symbolicName: app.symbolicName,
        intentionRegisterApiDisabled: intentionRegisterApiDisabled.has(app.symbolicName),
      };
    });

    // Run as host app
    return MicrofrontendPlatform.forHost({
      apps: apps,
      properties: queryParams,
      restrictions: {activatorApiDisabled: activatorApiDisabled},
    }, {symbolicName: determineAppSymbolicName()});
  }

  private startClientPlatform(): Promise<void> {
    // Make the platform to run with Angular
    Beans.get(PlatformState).whenState(PlatformStates.Starting).then(() => {
      Beans.register(NgZone, {useValue: this._zone});
      Beans.registerDecorator(MessageClient, {useClass: AngularZoneMessageClientDecorator});
    });

    // Run as client app
    return MicrofrontendPlatform.forClient({symbolicName: determineAppSymbolicName()});
  }
}

/**
 * Identifies the currently running app based on the configured apps in the environment and the current URL.
 */
function determineAppSymbolicName(): string {
  const application = Object.values(environment.apps).find(app => new URL(app.url).host === window.location.host);
  if (!application) {
    throw Error(`[AppError] Application served on wrong URL. Supported URLs are: ${JSON.stringify(Object.values(environment.apps).map(app => app.url))}`);
  }
  return application.symbolicName;
}
