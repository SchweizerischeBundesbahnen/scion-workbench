/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { first } from 'rxjs/operators';
import { Beans, Initializer } from '../bean-manager';
import { PlatformConfigLoader } from './platform-config-loader';
import { Defined } from '@scion/toolkit/util';
import { ApplicationConfig, PlatformConfig, PlatformRestrictions } from './platform-config';
import { ApplicationRegistry } from './application-registry';
import { HttpClient } from './http-client';
import { Logger } from '../logger';
import { HostPlatformAppProvider } from './host-platform-app-provider';
import { PlatformMessageClient } from '../host/platform-message-client';
import { PlatformTopics } from '../ɵmessaging.model';

/**
 * Collects manifests of registered applications.
 *
 * This collector is registered as {@link Initializer}. The platform waits to initialize until manifests are collected.
 * @ignore
 */
export class ManifestCollector implements Initializer {

  public init(): Promise<void> {
    return Beans.get(PlatformConfigLoader).load$()
      .pipe(first())
      .toPromise()
      .then((platformConfig: PlatformConfig) => {
        Defined.orElseThrow(platformConfig, () => Error('[PlatformConfigError] No platform config provided.'));
        Defined.orElseThrow(platformConfig.apps, () => Error('[PlatformConfigError] Missing \'apps\' property in platform config. Did you forget to register applications?'));
        Beans.register(PlatformRestrictions, {useValue: this.computePlatformRestrictions(platformConfig)});
        Beans.get(PlatformMessageClient).publish$(PlatformTopics.PlatformProperties, platformConfig.properties || {}, {retain: true}).subscribe();
        return [Beans.get(HostPlatformAppProvider).appConfig, ...platformConfig.apps];
      })
      .then((appConfigs: ApplicationConfig[]): Promise<void> => {
        return Promise.all(this.fetchAndRegisterManifests(appConfigs)).then();
      });
  }

  private fetchAndRegisterManifests(appConfigs: ApplicationConfig[]): Promise<void>[] {
    return appConfigs
      .filter(appConfig => !appConfig.exclude)
      .map(appConfig => this.fetchAndRegisterManifest(appConfig));
  }

  private async fetchAndRegisterManifest(appConfig: ApplicationConfig): Promise<void> {
    if (!appConfig.manifestUrl) {
      Beans.get(Logger).error(`[AppConfigError] Failed to fetch manifest for application '${appConfig.symbolicName}'. Manifest URL must not be empty.`);
      return;
    }

    try {
      const response = await Beans.get(HttpClient).fetch(appConfig.manifestUrl);
      if (!response.ok) {
        Beans.get(Logger).error(`[ManifestFetchError] Failed to fetch manifest for application '${appConfig.symbolicName}'. Maybe the application is currently unavailable. [httpStatusCode=${response.status}, httpStatusText=${response.statusText}]`, appConfig, response.status);
        return;
      }

      Beans.get(ApplicationRegistry).registerApplication(appConfig, await response.json());
      Beans.get(Logger).info(`Application '${appConfig.symbolicName}' registered in microfrontend platform.`);
    }
    catch (error) {
      // The Promise returned from fetch() won’t reject on HTTP error status even if the response is an HTTP 404 or 500.
      // It will only reject on network failure or if anything prevented the request from completing.
      // See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Checking_that_the_fetch_was_successful
      Beans.get(Logger).error(`[ManifestFetchError] Failed to fetch manifest for application '${appConfig.symbolicName}':`, error);
    }
  }

  private computePlatformRestrictions(platformConfig: PlatformConfig): PlatformRestrictions {
    return {
      ...platformConfig.restrictions,
      activatorApiDisabled: Defined.orElse(platformConfig.restrictions && platformConfig.restrictions.activatorApiDisabled, false),
    };
  }
}
