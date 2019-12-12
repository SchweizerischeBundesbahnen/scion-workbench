/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { CapabilityProvider, Intention, Qualifier } from '../../platform.model';
import { Intent } from '../../messaging.model';

/**
 * Central point for looking up or managing capability providers or intentions available in the system.
 */
export abstract class ManifestRegistry {

  /**
   * Returns capability providers which are visible to the given application and which satisfy the given intent.
   * The intent is not allowed to contain wildcards in its qualifier.
   */
  abstract getCapabilityProvidersByIntent(intent: Intent, appSymbolicName: string): CapabilityProvider[];

  /**
   * Tests whether the given app has declared an intention (explicit or implicit) for the given intent.
   */
  abstract hasIntention(intent: Intent, appSymbolicName: string): boolean;

  /**
   * Registers the given capability provider for the given application.
   */
  abstract registerCapabilityProvider(provider: CapabilityProvider, appSymbolicName: string): string | undefined;

  /**
   * Unregisters capability providers which match the given filter from the given application.
   *
   * If given a qualifier in the filter, wildcards, if any, are not interpreted as wildcards, but as exact values instead.
   */
  abstract unregisterCapabilityProviders(appSymbolicName: string, providerFilter: CapabilityProviderFilter): void;

  /**
   * Registers the given intention for the given application.
   *
   * If registering the intention as an implicit intention, also provide the provider's identity.
   */
  abstract registerIntention(intention: Intention, appSymbolicName: string, providerId?: string): string | undefined;

  /**
   * Unregisters intentions which match the given filter from the given application.
   *
   * If given a qualifier in the filter, wildcards, if any, are not interpreted as wildcards, but as exact values instead.
   */
  abstract unregisterIntention(appSymbolicName: string, intentFilter: IntentionFilter): void;
}

/**
 * Allows filtering capability providers.
 *
 * All specified filter criteria are "AND"ed together. If no filter criterion is specified, no filtering takes place.
 */
export interface CapabilityProviderFilter {
  id?: string;
  type?: string;
  qualifier?: Qualifier;
  appSymbolicName?: string;
}

/**
 * Allows filtering intentions.
 *
 * All specified filter criteria are "AND"ed together. If no filter criterion is specified, no filtering takes place.
 */
export interface IntentionFilter {
  id?: string;
  type?: string;
  qualifier?: Qualifier;
  appSymbolicName?: string;
}
