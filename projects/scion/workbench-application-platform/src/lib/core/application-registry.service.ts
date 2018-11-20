/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { ApplicationManifest, HOST_APPLICATION_SYMBOLIC_NAME, ApplicationConfig } from './metadata';
import { Defined } from './defined.util';
import { ManifestRegistry } from './manifest-registry.service';
import { Application } from '@scion/workbench-application-platform.api';
import { Url } from './url.util';

/**
 * Registry with all registered applications.
 */
@Injectable()
export class ApplicationRegistry {

  private static readonly SYMBOLIC_NAME_REGEXP = new RegExp('^[a-z0-9-]+$');

  private _applications = new Map<string, Application>();

  constructor(private _manifestRegistry: ManifestRegistry) {
    this._applications.set(HOST_APPLICATION_SYMBOLIC_NAME, {
      symbolicName: HOST_APPLICATION_SYMBOLIC_NAME,
      name: 'Host application',
      baseUrl: location.origin,
      scopeCheckDisabled: false,
    });
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

    const scopeCheckDisabled = applicationConfig.scopeCheckDisabled || false;
    this._applications.set(applicationConfig.symbolicName, {
      symbolicName: applicationConfig.symbolicName,
      name: manifest.name,
      baseUrl: this.computeBaseUrl(applicationConfig, manifest),
      manifestUrl: new URL(applicationConfig.manifestUrl, Url.isAbsoluteUrl(applicationConfig.manifestUrl) ? applicationConfig.manifestUrl : window.origin).toString(),
      scopeCheckDisabled: scopeCheckDisabled,
    });

    this._manifestRegistry.registerCapability(applicationConfig.symbolicName, manifest.capabilities);
    this._manifestRegistry.registerIntents(applicationConfig.symbolicName, manifest.intents);
    scopeCheckDisabled && this._manifestRegistry.disableScopeChecks(applicationConfig.symbolicName);
  }

  public getApplication(symbolicName: string): Application {
    return this._applications.get(symbolicName);
  }

  public getApplications(): Application[] {
    return Array.from(this._applications.values());
  }

  /**
   * Computes the base URL as following:
   *
   * - if base URL is specified in the manifest, that URL is used (either as an absolute URL, or relative to the origin of 'manifestUrl')
   * - if base URL is not specified in the manifest, the origin from 'manifestUrl' is used as the base URL, or the origin from the current window if the 'manifestUrl' is relative
   */
  private computeBaseUrl(applicationConfig: ApplicationConfig, manifest: ApplicationManifest): string {
    const manifestOrigin = Url.isAbsoluteUrl(applicationConfig.manifestUrl) ? new URL(applicationConfig.manifestUrl).origin : window.origin;

    if (!manifest.baseUrl) {
      return manifestOrigin;
    }

    return new URL(manifest.baseUrl, manifestOrigin).toString();
  }
}
