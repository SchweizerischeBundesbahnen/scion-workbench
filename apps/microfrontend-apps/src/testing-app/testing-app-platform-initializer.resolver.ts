/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ManifestRequestHandler } from './manifest/manifest-request-handler';
import { Injectable, NgZone } from '@angular/core';
import { AngularZoneMessageClientDecorator } from './angular-zone-message-client.decorator';
import { Beans, MessageClient, MicrofrontendPlatform, PlatformMessageClient, PlatformState, PlatformStates } from '@scion/microfrontend-platform';

const ports = [4200, 4201, 4202, 4203];

/**
 * Initializes the SCION Microfrontend Platform.
 *
 * An {@link APP_INITIALIZER} cannot be used in a lazy loaded module, because the
 * application has already initialized before. That is why we use a resolver instead.
 */
@Injectable({providedIn: 'root'})
export class TestingAppPlatformInitializerResolver implements Resolve<void> {

  constructor(private _zone: NgZone) {
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<void> {
    const port = coerceNumberProperty(window.location.port || 80);
    if (!ports.includes(port)) {
      return Promise.reject(`[PortError] Application served on port ${port} which is not supported. Supported ports are: ${JSON.stringify(ports)}`);
    }

    if (window === window.top) {
      return this.startHostPlatform(port);
    }
    else {
      return this.startClientPlatform(port);
    }
  }

  private startHostPlatform(port: number): Promise<void> {
    Beans.get(PlatformState).whenState(PlatformStates.Starting).then(() => {
      Beans.register(ManifestRequestHandler, {eager: true});
      Beans.register(NgZone, {useValue: this._zone});
      Beans.registerDecorator(MessageClient, {useClass: AngularZoneMessageClientDecorator});
      Beans.registerDecorator(PlatformMessageClient, {useClass: AngularZoneMessageClientDecorator});
    });

    const hostUrl = `${window.location.protocol}//${window.location.hostname}`;
    return MicrofrontendPlatform.forHost([
      {manifestUrl: `${hostUrl}:4200/testing-app/assets/app-4200-manifest.json`, symbolicName: 'app-4200'},
      {manifestUrl: `${hostUrl}:4201/testing-app/assets/app-4201-manifest.json`, symbolicName: 'app-4201'},
      {manifestUrl: `${hostUrl}:4202/testing-app/assets/app-4202-manifest.json`, symbolicName: 'app-4202'},
      {manifestUrl: `${hostUrl}:4203/testing-app/assets/app-4203-manifest.json`, symbolicName: 'app-4203'},
    ], {symbolicName: `app-${port}`});
  }

  private startClientPlatform(port: number): Promise<void> {
    Beans.get(PlatformState).whenState(PlatformStates.Starting).then(() => {
      Beans.register(NgZone, {useValue: this._zone});
      Beans.registerDecorator(MessageClient, {useClass: AngularZoneMessageClientDecorator});
    });

    return MicrofrontendPlatform.forClient({symbolicName: `app-${port}`});
  }
}
