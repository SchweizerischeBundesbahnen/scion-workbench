/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Application, ApplicationManifest } from '../platform.model';
import { Beans } from '../bean-manager';
import { Defined } from '@scion/toolkit/util';
import { Urls } from '../url.util';
import { ApplicationConfig } from './platform-config';
import { ManifestRegistry } from './manifest-registry/manifest-registry';
import { PlatformMessageClient } from './platform-message-client';
import { MessageHeaders, ResponseStatusCodes } from '../messaging.model';
import { PlatformTopics } from '../ɵmessaging.model';

/**
 * Registry with all registered applications.
 */
export class ApplicationRegistry {

  private static readonly SYMBOLIC_NAME_REGEXP = new RegExp('^[a-z0-9-]+$');

  private readonly _applications = new Map<string, Application>();

  constructor() {
  }

  /**
   * Registers the given application.
   *
   * Throws an error if the application's symbolic name is not unique or contains illegal characters.
   */
  public registerApplication(applicationConfig: ApplicationConfig, manifest: ApplicationManifest): void {
    Defined.orElseThrow(applicationConfig.symbolicName, () => Error('[ApplicationRegistrationError] Missing symbolic name'));
    Defined.orElseThrow(applicationConfig.manifestUrl, () => Error('[ApplicationRegistrationError] Missing manifest URL'));

    if (!ApplicationRegistry.SYMBOLIC_NAME_REGEXP.test(applicationConfig.symbolicName)) {
      throw Error(`[ApplicationRegistrationError] Symbolic name must be lowercase and contain alphanumeric and dash characters [symbolicName='${applicationConfig.symbolicName}'].`);
    }

    const notUniqueSymbolicName = Array.from(this._applications.values()).some(application => application.symbolicName === applicationConfig.symbolicName);
    if (notUniqueSymbolicName) {
      throw Error(`[ApplicationRegistrationError] Symbolic name must be unique [symbolicName='${applicationConfig.symbolicName}'].`);
    }

    this._applications.set(applicationConfig.symbolicName, {
      symbolicName: applicationConfig.symbolicName,
      name: manifest.name,
      baseUrl: this.computeBaseUrl(applicationConfig, manifest),
      manifestUrl: new URL(applicationConfig.manifestUrl, Urls.isAbsoluteUrl(applicationConfig.manifestUrl) ? applicationConfig.manifestUrl : window.origin).toString(),
      origin: new URL(this.computeBaseUrl(applicationConfig, manifest)).origin,
      scopeCheckDisabled: Defined.orElse(applicationConfig.scopeCheckDisabled, false),
      intentionRegisterApiDisabled: Defined.orElse(applicationConfig.intentionRegisterApiDisabled, true),
      intentionRegisteredCheckDisabled: Defined.orElse(applicationConfig.intentionRegisteredCheckDisabled, false),
    });

    manifest.capabilities && manifest.capabilities.forEach(capabilityProvider => Beans.get(ManifestRegistry).registerCapabilityProvider(capabilityProvider, applicationConfig.symbolicName));
    manifest.intentions && manifest.intentions.forEach(intention => Beans.get(ManifestRegistry).registerIntention(intention, applicationConfig.symbolicName));
    Beans.get(PlatformMessageClient).publish$(PlatformTopics.Applications, this.getApplications(), {retain: true, headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
  }

  public getApplication(symbolicName: string): Application {
    return this._applications.get(symbolicName);
  }

  public getApplications(): Application[] {
    return Array.from(this._applications.values());
  }

  /**
   * Returns whether or not provider 'scope check' is disabled for the given application.
   */
  public isScopeCheckDisabled(appSymbolicName: string): boolean {
    return this._applications.get(appSymbolicName).scopeCheckDisabled;
  }

  /**
   * Returns whether or not the 'Intention Registration API' is disabled for the given application.
   */
  public isIntentionRegisterApiDisabled(appSymbolicName: string): boolean {
    return this._applications.get(appSymbolicName).intentionRegisterApiDisabled;
  }

  /**
   * Returns whether or not 'intention registered check' is disabled for the given application.
   */
  public isIntentionRegisteredCheckDisabled(appSymbolicName: string): boolean {
    return this._applications.get(appSymbolicName).intentionRegisteredCheckDisabled;
  }

  /**
   * Computes the base URL as following:
   *
   * - if base URL is specified in the manifest, that URL is used (either as an absolute URL, or relative to the origin of 'manifestUrl')
   * - if base URL is not specified in the manifest, the origin from 'manifestUrl' is used as the base URL, or the origin from the current window if the 'manifestUrl' is relative
   */
  private computeBaseUrl(applicationConfig: ApplicationConfig, manifest: ApplicationManifest): string {
    const manifestURL = Urls.isAbsoluteUrl(applicationConfig.manifestUrl) ? new URL(applicationConfig.manifestUrl) : new URL(applicationConfig.manifestUrl, window.origin);

    if (!manifest.baseUrl) {
      return manifestURL.origin;
    }

    if (Urls.isAbsoluteUrl(manifest.baseUrl)) {
      return new URL(manifest.baseUrl).toString(); // normalize the URL
    }
    else {
      return new URL(manifest.baseUrl, manifestURL.origin).toString();
    }
  }
}
