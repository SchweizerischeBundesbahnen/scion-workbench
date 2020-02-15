/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { CapabilityProvider, Intention } from '../../platform.model';
import { Intent } from '../../messaging.model';

/**
 * Central point for looking up or managing capability providers or intentions available in the system.
 *
 * @ignore
 */
export abstract class ManifestRegistry {

  /**
   * Returns capability providers which are visible to the given application and which satisfy the given intent.
   * The intent is not allowed to contain wildcards in its qualifier.
   */
  abstract getCapabilityProvidersByIntent(intent: Intent, appSymbolicName: string): CapabilityProvider[];

  /**
   * Tests whether the given app has declared an intention for the given intent, or is providing a capability fulfilling the given intent.
   */
  abstract hasIntention(intent: Intent, appSymbolicName: string): boolean;

  /**
   * Registers the given capability provider for the given application.
   */
  abstract registerCapabilityProvider(provider: CapabilityProvider, appSymbolicName: string): string | undefined;

  /**
   * Registers the given intention for the given application.
   */
  abstract registerIntention(intention: Intention, appSymbolicName: string): string | undefined;
}
