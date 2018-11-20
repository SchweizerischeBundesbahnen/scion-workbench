/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability, Intent, IntentMessage, PlatformCapabilityTypes, Qualifier } from './core.model';

/**
 * Represents message types used for communication between the manifest application outlet and the application.
 */
export enum ManifestQueries {
  FindManifests = 'find-manifests',
  FindManifest = 'find-manifest',
  FindCapabilityProviders = 'find-capability-providers',
  FindCapabilityConsumers = 'find-capability-consumers',
  FindCapability = 'find-capability',
  FindCapabilities = 'find-capabilities',
}

export namespace ManifestRegistryIntentMessages {
  /**
   * Queries the manifest registry for all application manifests.
   */
  export interface FindManifests extends IntentMessage {
    type: PlatformCapabilityTypes.ManifestRegistry;
    payload: {
      query: ManifestQueries.FindManifests;
    };
  }

  /**
   * Queries the manifest registry for the manifest of given application.
   */
  export interface FindManifest extends IntentMessage {
    type: PlatformCapabilityTypes.ManifestRegistry;
    payload: {
      query: ManifestQueries.FindManifest;
      symbolicAppName: string;
    };
  }

  /**
   * Queries the manifest registry for applications which provide a capability for the given intent.
   */
  export interface FindCapabilityProviders extends IntentMessage {
    type: PlatformCapabilityTypes.ManifestRegistry;
    payload: {
      query: ManifestQueries.FindCapabilityProviders;
      intentId: string;
    };
  }

  /**
   * Queries the manifest registry for applications which consume given capability.
   */
  export interface FindCapabilityConsumers extends IntentMessage {
    type: PlatformCapabilityTypes.ManifestRegistry;
    payload: {
      query: ManifestQueries.FindCapabilityConsumers;
      capabilityId: string;
    };
  }

  /**
   * Queries the manifest registry for given capability.
   */
  export interface FindCapability extends IntentMessage {
    type: PlatformCapabilityTypes.ManifestRegistry;
    payload: {
      query: ManifestQueries.FindCapability;
      capabilityId: string;
    };
  }

  /**
   * Queries the manifest registry for capabilities of given type and qualifier.
   *
   * There are ony capabilities returned for which the requesting application has manifested an intent.
   */
  export interface FindCapabilities extends IntentMessage {
    type: PlatformCapabilityTypes.ManifestRegistry;
    payload: {
      query: ManifestQueries.FindCapabilities;
      type: string;
      qualifier: Qualifier;
    };
  }
}

/**
 * Represents the manifest of an application.
 */
export interface Manifest {
  /**
   * Unique symbolic name of the application.
   */
  symbolicName: string;
  /**
   * Name of the application.
   */
  name: string;
  /**
   * URL to the application root.
   */
  baseUrl: string;
  /**
   * URL to the application manifest. Is not set for the host application.
   */
  manifestUrl?: string;
  /**
   * Functionality which the application intends to use.
   */
  intents: Intent[];
  /**
   * Functionality which the application provides.
   */
  capabilities: Capability[];
  /**
   * Indicates whether or not capability scope check is disabled for this application.
   */
  scopeCheckDisabled: boolean;
}
