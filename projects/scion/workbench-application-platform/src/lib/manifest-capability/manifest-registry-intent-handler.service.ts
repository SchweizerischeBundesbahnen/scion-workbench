/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { IntentHandler } from '../core/metadata';
import { Application, Capability, Intent, IntentMessage, Manifest, ManifestQueries, ManifestRegistryIntentMessages, MessageEnvelope, NilQualifier, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';
import { MessageBus } from '../core/message-bus.service';
import { ApplicationRegistry } from '../core/application-registry.service';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { Logger } from '../core/logger.service';
import { matchesCapabilityQualifier, matchesIntentQualifier } from '../core/qualifier-tester';
import { Arrays } from '../core/array.util';
import { patchQualifier } from '../core/qualifier-patcher';

/**
 * Allows to query manifest registry.
 */
@Injectable()
export class ManifestRegistryIntentHandler implements IntentHandler {

  public readonly type: PlatformCapabilityTypes = PlatformCapabilityTypes.ManifestRegistry;
  public readonly qualifier = NilQualifier;
  public readonly description = 'Allows to query the manifest registry.';

  constructor(private _messageBus: MessageBus,
              private _applicationRegistry: ApplicationRegistry,
              private _manifestRegistry: ManifestRegistry,
              private _logger: Logger) {
  }

  public onIntent(envelope: MessageEnvelope<IntentMessage>): void {
    const query = envelope.message.payload.query;
    switch (query) {
      case ManifestQueries.FindManifests: {
        this.queryManifests(envelope as MessageEnvelope<ManifestRegistryIntentMessages.FindManifests>);
        break;
      }
      case ManifestQueries.FindManifest: {
        this.queryManifest(envelope as MessageEnvelope<ManifestRegistryIntentMessages.FindManifest>);
        break;
      }
      case ManifestQueries.FindCapabilityProviders: {
        this.queryCapabilityProviders(envelope as MessageEnvelope<ManifestRegistryIntentMessages.FindCapabilityProviders>);
        break;
      }
      case ManifestQueries.FindCapabilityConsumers: {
        this.queryCapabilityConsumers(envelope as MessageEnvelope<ManifestRegistryIntentMessages.FindCapabilityConsumers>);
        break;
      }
      case ManifestQueries.FindCapability: {
        this.queryCapability(envelope as MessageEnvelope<ManifestRegistryIntentMessages.FindCapability>);
        break;
      }
      case ManifestQueries.FindCapabilities: {
        this.queryCapabilities(envelope as MessageEnvelope<ManifestRegistryIntentMessages.FindCapabilities>);
        break;
      }
      default: {
        this._logger.error(`[UnsupportedQueryError] Query not supported [query=${query}]`);
        this._messageBus.publishReply(null, envelope.sender, envelope.replyToUid);
      }
    }
  }

  private queryManifests(envelope: MessageEnvelope<ManifestRegistryIntentMessages.FindManifests>): void {
    const manifests = this._applicationRegistry.getApplications()
      .map(application => this.loadManifest(application.symbolicName))
      .filter(Boolean);
    this._messageBus.publishReply(manifests, envelope.sender, envelope.replyToUid);
  }

  private queryManifest(envelope: MessageEnvelope<ManifestRegistryIntentMessages.FindManifest>): void {
    const symbolicAppName = envelope.message.payload.symbolicAppName;
    const manifest = this.loadManifest(symbolicAppName);
    this._messageBus.publishReply(manifest, envelope.sender, envelope.replyToUid);
  }

  /**
   * Finds applications which provide a capability for the given intent.
   */
  private queryCapabilityProviders(envelope: MessageEnvelope<ManifestRegistryIntentMessages.FindCapabilityProviders>): void {
    const intentId = envelope.message.payload.intentId;
    const intent: Intent = this._manifestRegistry.getIntent(intentId);

    const providers: Application[] = this._manifestRegistry.getCapabilitiesByType(intent.type)
      .filter(capability => this._manifestRegistry.isVisibleForApplication(capability, intent.metadata.symbolicAppName))
      .filter(capability => {
        const patchedQualifier: Qualifier = patchQualifier(intent.qualifier, capability.qualifier);
        return matchesCapabilityQualifier(capability.qualifier, patchedQualifier);
      })
      .map(capability => this._applicationRegistry.getApplication(capability.metadata.symbolicAppName));

    const distinctProviders: Application[] = Arrays.distinct(providers, (app) => app.symbolicName);
    this._messageBus.publishReply(distinctProviders, envelope.sender, envelope.replyToUid);
  }

  /**
   * Finds applications which consume given capability.
   */
  private queryCapabilityConsumers(envelope: MessageEnvelope<ManifestRegistryIntentMessages.FindCapabilityConsumers>): void {
    const capabilityId = envelope.message.payload.capabilityId;
    const capability: Capability = this._manifestRegistry.getCapability(capabilityId);
    const consumers: Application[] = [];

    this._applicationRegistry.getApplications().forEach(application => {
      const intents = this._manifestRegistry.getIntentsByApplication(application.symbolicName);
      const isConsumer = intents
        .filter(intent => !capability.private || this._manifestRegistry.isScopeCheckDisabled(intent.metadata.symbolicAppName) || intent.metadata.symbolicAppName === capability.metadata.symbolicAppName)
        .some(intent => intent.type === capability.type && matchesIntentQualifier(capability.qualifier, intent.qualifier));
      if (isConsumer) {
        consumers.push(application);
      }
    });

    this._messageBus.publishReply(consumers, envelope.sender, envelope.replyToUid);
  }

  /**
   * Finds capabilities of given type and qualifier.
   *
   * There are only capabilities returned for which the requesting application has manifested an intent.
   */
  private queryCapabilities(envelope: MessageEnvelope<ManifestRegistryIntentMessages.FindCapabilities>): void {
    const type: string = envelope.message.payload.type;
    const qualifier: Qualifier = envelope.message.payload.qualifier;

    const capabilities: Capability[] = this._manifestRegistry.getCapabilitiesByType(type)
      .filter(capability => this._manifestRegistry.isVisibleForApplication(capability, envelope.sender))
      .filter(capability => {
        const patchedQualifier: Qualifier = patchQualifier(qualifier, capability.qualifier);
        return matchesCapabilityQualifier(capability.qualifier, patchedQualifier);
      })
      .filter(capability => this._manifestRegistry.isScopeCheckDisabled(envelope.sender) || this._manifestRegistry.hasIntent(envelope.sender, capability.type, capability.qualifier));
    this._messageBus.publishReply(capabilities, envelope.sender, envelope.replyToUid);
  }

  private queryCapability(envelope: MessageEnvelope<ManifestRegistryIntentMessages.FindCapability>): void {
    const capabilityId = envelope.message.payload.capabilityId;
    const capability: Capability = this._manifestRegistry.getCapability(capabilityId);
    this._messageBus.publishReply(capability, envelope.sender, envelope.replyToUid);
  }

  private loadManifest(symbolicName: string): Manifest {
    const application = this._applicationRegistry.getApplication(symbolicName);
    if (!application) {
      this._logger.error(`[ApplicationNotFoundError] No application registered with given symbolic name '${symbolicName}'`);
      return null;
    }

    return {
      symbolicName: application.symbolicName,
      name: application.name,
      baseUrl: application.baseUrl,
      manifestUrl: application.manifestUrl,
      scopeCheckDisabled: application.scopeCheckDisabled,
      restrictions: application.restrictions,
      intents: this._manifestRegistry.getIntentsByApplication(application.symbolicName),
      capabilities: this._manifestRegistry.getCapabilitiesByApplication(application.symbolicName),
    };
  }
}

