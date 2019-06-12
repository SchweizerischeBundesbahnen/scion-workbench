/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Service } from './metadata';
import { MessageBus } from './message-bus.service';
import { from, Observable } from 'rxjs';
import { Platform } from './platform';
import { Application, Capability, Manifest, ManifestQueries, ManifestRegistryIntentMessages, NilQualifier, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Allows to query manifest registry.
 */
export class ManifestRegistryService implements Service {

  /**
   * Queries the manifest registry for all application manifests.
   */
  public get manifests$(): Observable<Manifest[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindManifests = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        query: ManifestQueries.FindManifests,
      },
    };

    return from(Platform.getService(MessageBus).requestReply({channel: 'intent', message: intentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message || [])); // replyEnvelope is 'undefined' on shutdown
  }

  /**
   * Queries the manifest registry for the manifest of given application.
   */
  public manifest$(symbolicName: string): Observable<Manifest[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindManifest = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        query: ManifestQueries.FindManifest,
        symbolicAppName: symbolicName,
      },
    };

    return from(Platform.getService(MessageBus).requestReply({channel: 'intent', message: intentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message)); // replyEnvelope is 'undefined' on shutdown
  }

  /**
   * Queries the manifest registry for applications which provide a capability for the given intent.
   */
  public capabilityProviders$(intentId: string): Observable<Application[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapabilityProviders = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        query: ManifestQueries.FindCapabilityProviders,
        intentId: intentId,
      },
    };

    return from(Platform.getService(MessageBus).requestReply({channel: 'intent', message: intentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message || [])); // replyEnvelope is 'undefined' on shutdown
  }

  /**
   * Queries the manifest registry for applications which consume given capability.
   */
  public capabilityConsumers$(capabilityId: string): Observable<Application[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapabilityConsumers = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        query: ManifestQueries.FindCapabilityConsumers,
        capabilityId: capabilityId,
      },
    };

    return from(Platform.getService(MessageBus).requestReply({channel: 'intent', message: intentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message || [])); // replyEnvelope is 'undefined' on shutdown
  }

  /**
   * Queries the manifest registry for given capability.
   */
  public capability$(capabilityId: string): Observable<Capability> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapability = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        query: ManifestQueries.FindCapability,
        capabilityId: capabilityId,
      },
    };

    return from(Platform.getService(MessageBus).requestReply({channel: 'intent', message: intentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message)); // replyEnvelope is 'undefined' on shutdown
  }

  /**
   * Queries the manifest registry for capabilities of given type and qualifier.
   *
   * There are ony capabilities returned for which the requesting application has manifested an intent.
   */
  public capabilities$(type: string, qualifier: Qualifier): Observable<Capability[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapabilities = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        query: ManifestQueries.FindCapabilities,
        type: type,
        qualifier: qualifier,
      },
    };

    return from(Platform.getService(MessageBus).requestReply({channel: 'intent', message: intentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message || [])); // replyEnvelope is 'undefined' on shutdown
  }

  public onDestroy(): void {
    // noop
  }
}
