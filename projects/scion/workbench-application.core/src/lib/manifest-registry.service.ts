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
import { EMPTY, Observable, OperatorFunction, throwError } from 'rxjs';
import { Platform } from './platform';
import { Application, Capability, Manifest, ManifestCommands, ManifestRegistryIntentMessages, ManifestRegistryStatusMessage, MessageEnvelope, NilQualifier, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';
import { map, mergeMap } from 'rxjs/operators';

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
        command: ManifestCommands.FindManifests,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(extractMessage([]));
  }

  /**
   * Queries the manifest registry for the manifest of given application.
   */
  public manifest$(symbolicName: string): Observable<Manifest[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindManifest = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        command: ManifestCommands.FindManifest,
        symbolicAppName: symbolicName,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(extractMessage([]));
  }

  /**
   * Queries the manifest registry for applications which provide a capability for the given intent.
   */
  public capabilityProviders$(intentId: string): Observable<Application[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapabilityProviders = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        command: ManifestCommands.FindCapabilityProviders,
        intentId: intentId,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(extractMessage([]));
  }

  /**
   * Queries the manifest registry for applications which consume given capability.
   */
  public capabilityConsumers$(capabilityId: string): Observable<Application[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapabilityConsumers = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        command: ManifestCommands.FindCapabilityConsumers,
        capabilityId: capabilityId,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(extractMessage([]));
  }

  /**
   * Queries the manifest registry for given capability.
   */
  public capability$(capabilityId: string): Observable<Capability> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapability = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        command: ManifestCommands.FindCapability,
        capabilityId: capabilityId,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(extractMessage(null));
  }

  /**
   * Queries the manifest registry for capabilities of given type and qualifier.
   *
   * There are only capabilities returned for which the requesting application has manifested an intent.
   */
  public capabilities$(type: string, qualifier: Qualifier): Observable<Capability[]> {
    const intentMessage: ManifestRegistryIntentMessages.FindCapabilities = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        command: ManifestCommands.FindCapabilities,
        type: type,
        qualifier: qualifier,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(extractMessage([]));
  }

  /**
   * Registers given capability.
   */
  public registerCapability$(capability: Capability): Observable<ManifestRegistryStatusMessage> {
    const intentMessage: ManifestRegistryIntentMessages.RegisterCapability = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        command: ManifestCommands.RegisterCapability,
        capability: capability,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(
        extractMessage(null),
        mergeMap(reply => {
          const success = reply && reply.status === 'ok';
          return success ? EMPTY : throwError(reply.message);
        }));
  }

  /**
   * Unregisters capability of given type and qualifier.
   *
   * The requesting application can only unregister its own capabilities.
   */
  public unregisterCapability$(type: string, qualifier: Qualifier): Observable<void> {
    const intentMessage: ManifestRegistryIntentMessages.UnregisterCapability = {
      type: PlatformCapabilityTypes.ManifestRegistry,
      qualifier: NilQualifier,
      payload: {
        command: ManifestCommands.UnregisterCapability,
        type: type,
        qualifier: qualifier,
      },
    };

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage}, {once: true})
      .pipe(
        extractMessage(null),
        mergeMap(reply => {
          const success = reply && reply.status === 'ok';
          return success ? EMPTY : throwError(reply.message);
        }));
  }

  public onDestroy(): void {
    // noop
  }
}

/**
 * Extracts the message from the envelope.
 *
 * @param valueOnShutdown
 *        Value which is emitted when the platform is about to shutdown.
 */
function extractMessage<T>(valueOnShutdown: T): OperatorFunction<MessageEnvelope, T> {
  return map(envelope => envelope ? envelope.message : valueOnShutdown);
}
