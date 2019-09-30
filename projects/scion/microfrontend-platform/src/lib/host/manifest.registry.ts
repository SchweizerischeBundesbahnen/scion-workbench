/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability, Intent, Qualifier } from '../platform.model';
import { sha256 } from 'js-sha256';
import { Observable, Subject } from 'rxjs';
import { Defined } from '@scion/toolkit/util';
import { isEqualQualifier, matchesCapabilityQualifier, matchesIntentQualifier } from '../qualifier-tester';
import { patchQualifier } from '../qualifier-patcher';

/**
 * Registry with all registered application capabilities and intents.
 */
export class ManifestRegistry {

  private _capabilitiesByType = new Map<string, Capability[]>();
  private _capabilitiesById = new Map<string, Capability>();
  private _intentsByApplication = new Map<string, Intent[]>();
  private _intentsById = new Map<string, Intent>();
  private _scopeCheckDisabled = new Set<string>();

  private _capabilityChange$ = new Subject<void>();
  private _intentChange$ = new Subject<void>();

  /**
   * Returns capabilities which have the given required type.
   */
  public getCapabilitiesByType<T extends Capability>(type: string): T[] {
    return (this._capabilitiesByType.get(type) || []) as T[];
  }

  /**
   * Returns capabilities of given application.
   */
  public getCapabilitiesByApplication(symbolicName: string): Capability[] {
    return Array.from(this._capabilitiesById.values()).filter(capability => capability.metadata.symbolicAppName === symbolicName);
  }

  /**
   * Returns the capability of given id.
   */
  public getCapability<T extends Capability>(id: string): T {
    return this._capabilitiesById.get(id) as T;
  }

  /**
   * Returns capabilities which have the given required type and qualifier.
   */
  public getCapabilities<T extends Capability>(type: string, qualifier?: Qualifier, options?: { wildcardQuery?: boolean }): T[] {
    const wildcardQuery = Defined.orElse(options && options.wildcardQuery, false);
    return this.getCapabilitiesByType(type)
      .filter(capability => {
        const queryQualifier = wildcardQuery ? patchQualifier(qualifier, capability.qualifier) : qualifier;
        return matchesCapabilityQualifier(capability.qualifier, queryQualifier);
      }) as T[];
  }

  /**
   * Returns capabilities which match the given predicate.
   */
  public getCapabilitiesByPredicate(predicate: (capability: Capability) => boolean): Capability[] {
    return Array.from(this._capabilitiesById.values()).filter(predicate);
  }

  /**
   * Checks if the given capability is visible to the given application.
   */
  public isVisibleForApplication(capability: Capability, symbolicName: string): boolean {
    return !capability.private || this.isScopeCheckDisabled(symbolicName) || capability.metadata.symbolicAppName === symbolicName;
  }

  /**
   * Returns the intent of given id.
   */
  public getIntent(id: string): Intent {
    return this._intentsById.get(id);
  }

  /**
   * Returns intents which are registered by the given application.
   */
  public getIntentsByApplication(symbolicName: string): Intent[] {
    return this._intentsByApplication.get(symbolicName) || [];
  }

  /**
   * Tests if the specified application has registered an intent for the given type and qualifiers,
   * or whether the application has an implicit intent because it provides the capability itself.
   */
  public hasIntent(symbolicName: string, type: string, qualifier: Qualifier): boolean {
    return this.getIntentsByApplication(symbolicName).some(intent => {
      return intent.type === type && matchesIntentQualifier(intent.qualifier, qualifier);
    });
  }

  /**
   * Tests if the specified application has registered a capability for the given type and qualifiers.
   */
  public hasCapability(symbolicName: string, type: string, qualifier: Qualifier): boolean {
    return this.getCapabilities(type, qualifier)
      .some(capability => capability.metadata.symbolicAppName === symbolicName);
  }

  /**
   * Tests if some application is capable of handling the given intent.
   * The capability must be provided with public visibility unless provided by the requesting application itself.
   */
  public isHandled(symbolicName: string, type: string, qualifier: Qualifier): boolean {
    return this.getCapabilities(type, qualifier).some(capability => this.isVisibleForApplication(capability, symbolicName));
  }

  /**
   * Registers capabilities of the given application.
   */
  public registerCapability(symbolicName: string, capabilities: Capability[]): void {
    if (!capabilities || !capabilities.length) {
      return;
    }

    capabilities.forEach(it => {
      if (it.qualifier && it.qualifier.hasOwnProperty('*')) {
        throw Error(`[CapabilityRegistrationError] Capability qualifiers do not support \`*\` as key`);
      }

      const registeredCapabilities = this._capabilitiesByType.get(it.type) || [];
      const capability: Capability = {
        ...it,
        private: Defined.orElse(it.private, true),
        metadata: {
          id: sha256(JSON.stringify({application: symbolicName, type: it.type, ...it.qualifier})).substr(0, 7), // use the first 7 digits of the capability hash as capability id
          symbolicAppName: symbolicName,
        },
      };

      this._capabilitiesById.set(capability.metadata.id, capability);
      this._capabilitiesByType.set(capability.type, [...registeredCapabilities, capability]);
    });

    // Register implicit intents. These are intents for capabilities which the application provides itself.
    this.registerIntents(symbolicName, capabilities.map(capability => ({type: capability.type, qualifier: capability.qualifier})), true);

    this._capabilityChange$.next();
  }

  /**
   * Unregisters capabilities of given application which have the given type and qualifier.
   */
  public unregisterCapability(symbolicName: string, type: string, qualifier?: Qualifier): void {
    const capabilitiesToUnregister = this.getCapabilitiesByApplication(symbolicName)
      .filter(it => it.type === type && isEqualQualifier(it.qualifier, qualifier));

    if (!capabilitiesToUnregister.length) {
      return;
    }

    capabilitiesToUnregister.forEach(capabilityToUnregister => {
      this._capabilitiesById.delete(capabilityToUnregister.metadata.id);
      const capabilities = this._capabilitiesByType.get(capabilityToUnregister.type).filter(it => it.metadata.id !== capabilityToUnregister.metadata.id);
      if (capabilities.length) {
        this._capabilitiesByType.set(capabilityToUnregister.type, capabilities);
      }
      else {
        this._capabilitiesByType.delete(capabilityToUnregister.type);
      }
    });

    // Unregister implicit intents.
    this.unregisterImplicitIntents(symbolicName, type, qualifier);

    this._capabilityChange$.next();
  }

  public registerIntent(symbolicName: string, intent: Intent, implicit: boolean = false): void {
    this.registerIntents(symbolicName, [intent], implicit);
  }

  /**
   * Registers intents of the given application.
   *
   * The parameter 'implicit' indicates the intents to be implicit because the application provides the capability itself.
   */
  public registerIntents(symbolicName: string, intents: Intent[], implicit: boolean = false): void {
    if (!intents || !intents.length) {
      return;
    }

    intents.forEach(it => {
      const intent: Intent = {
        ...it,
        metadata: {
          id: sha256(JSON.stringify({application: symbolicName, type: it.type, ...it.qualifier})).substr(0, 7), // use the first 7 digits of the intent hash as intent id
          symbolicAppName: symbolicName,
          implicit: implicit,
        },
      };

      this._intentsById.set(intent.metadata.id, intent);
      this._intentsByApplication.set(symbolicName, [
        ...(this._intentsByApplication.get(symbolicName) || []),
        intent,
      ]);
    });

    this._intentChange$.next();
  }

  public unregisterIntent(symbolicName: string, intentId: string): void {
    const intentToUnregister = this.getIntent(intentId);

    if (!intentToUnregister) {
      throw Error(`[IntentUnregistrationError] Intent does not exist [id=${intentId}]`);
    }

    if (intentToUnregister.metadata.symbolicAppName !== symbolicName) {
      throw Error(`[IntentUnregistrationError] Intent cannot be unregistered by this application [id=${intentId}, appName=${symbolicName}]`);
    }

    this._intentsById.delete(intentId);
    this._intentsByApplication.set(symbolicName, this._intentsByApplication.get(symbolicName).filter(intent => intent.metadata.id !== intentId));
    this._intentChange$.next();
  }

  /**
   * Unregisters implicit intents of the given type and qualifier for the given application.
   */
  private unregisterImplicitIntents(symbolicName: string, type: string, qualifier: Qualifier): void {
    this.getIntentsByApplication(symbolicName)
      .filter(it => it.metadata.implicit && it.type === type && isEqualQualifier(it.qualifier, qualifier))
      .forEach(intentToUnregister => {
        this._intentsById.delete(intentToUnregister.metadata.id);
        this._intentsByApplication.set(symbolicName, this._intentsByApplication.get(symbolicName).filter(it => it.metadata.id !== intentToUnregister.metadata.id));
      });
  }

  /**
   * Disables capability scope check for given application.
   */
  public disableScopeChecks(symbolicName: string): void {
    this._scopeCheckDisabled.add(symbolicName);
  }

  /**
   * Returns whether or not capability scope check is disabled for given application.
   */
  public isScopeCheckDisabled(symbolicName: string): boolean {
    return this._scopeCheckDisabled.has(symbolicName);
  }

  /**
   * Returns an Observable that emits when a capability is added or removed.
   */
  public get capabilityChange$(): Observable<void> {
    return this._capabilityChange$;
  }

  public get intentChange$(): Observable<void> {
    return this._intentChange$;
  }
}
