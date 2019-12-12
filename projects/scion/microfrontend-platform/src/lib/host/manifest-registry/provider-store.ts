/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { CapabilityProvider, Qualifier } from '../../platform.model';
import { isEqualQualifier, matchesIntentQualifier, matchesWildcardQualifier } from '../../qualifier-tester';
import { Observable, Subject } from 'rxjs';
import { Maps } from '@scion/toolkit/util';
import { CapabilityProviderFilter } from './manifest-registry';

/**
 * Provides an in-memory store for provided capabilities.
 */
export class ProviderStore {

  private readonly _providersByType = new Map<string, CapabilityProvider[]>();
  private readonly _providersById = new Map<string, CapabilityProvider>();
  private readonly _change$ = new Subject<void>();

  /**
   * Adds the given capability provider to this store.
   */
  public add(provider: CapabilityProvider): void {
    this._providersById.set(provider.metadata.id, provider);
    Maps.addListValue(this._providersByType, provider.type, provider);
    this._change$.next();
  }

  /**
   * Removes capability providers from this store that match the given filter.
   *
   * @param appSymbolicName
   *        Specify the app from which providers should be removed.
   *        Wildcards in the qualifier criterion, if any, are not interpreted as wildcards, but as exact values instead.
   * @param filter
   *        Control which providers to remove by specifying filter criteria which are "AND"ed together.
   */
  public remove(appSymbolicName: string, filter: CapabilityProviderFilter): CapabilityProvider[] {
    const providersToRemove = Array.from(this._providersById.values())
      .filter(provider => provider.metadata.appSymbolicName === appSymbolicName)
      .filter(provider => filter.id === undefined || filter.id === provider.metadata.id)
      .filter(provider => filter.type === undefined || filter.type === provider.type)
      .filter(provider => filter.qualifier === undefined || isEqualQualifier(filter.qualifier, provider.qualifier));
    this._remove(providersToRemove);
    return providersToRemove;
  }

  /**
   * Returns the provider of the given id, or `undefined` if not found.
   *
   * @deprecated remove as only used by tests; use find(...) instead
   */
  public findById(id: string): CapabilityProvider | undefined {
    return this._providersById.get(id);
  }

  /**
   * Finds providers that match the given filter.
   *
   * @param filter
   *        Control which providers to return. The filter allows to use wildcards in the qualifier.
   *        All specified filter criteria are "AND"ed together. If no filter criterion is specified,
   *        no filtering takes place.
   */
  public find(filter: CapabilityProviderFilter): CapabilityProvider[] {
    return Array.from(this._providersById.values())
      .filter(provider => filter.appSymbolicName === undefined || filter.appSymbolicName === provider.metadata.appSymbolicName)
      .filter(provider => filter.id === undefined || filter.id === provider.metadata.id)
      .filter(provider => filter.type === undefined || filter.type === provider.type)
      .filter(provider => filter.qualifier === undefined || matchesWildcardQualifier(filter.qualifier, provider.qualifier));
  }

  /**
   * Returns the providers of the given type matching the given qualifier.
   *
   * You can use either 'intentMatcher' or 'wildcardMatcher' strategy. Use the intent matcher strategy to find providers
   * matching the given intent qualifier.
   */
  public findByType(type: string, qualifier: Qualifier, options: { strategy: 'intentMatcher' | 'wildcardMatcher' }): CapabilityProvider[] {
    return (this._providersByType.get(type) || [])
      .filter(provider => options.strategy === 'intentMatcher' ? matchesIntentQualifier(provider.qualifier, qualifier) : matchesWildcardQualifier(provider.qualifier, qualifier));
  }

  /**
   * Returns the providers of the given application matching the given qualifier. The qualifier may contain wildcards.
   *
   * @deprecated remove as only used by tests; use find(...) instead
   */
  public findByApplication(appSymbolicName: string, qualifier: Qualifier): CapabilityProvider[] {
    return Array.from(this._providersById.values())
      .filter(provider => provider.metadata.appSymbolicName === appSymbolicName)
      .filter(provider => matchesWildcardQualifier(provider.qualifier, qualifier));
  }

  /**
   * Emits when a provider is added to or removed from this store.
   */
  public get change$(): Observable<void> {
    return this._change$.asObservable();
  }

  /**
   * Removes the providers from all internal maps.
   */
  private _remove(providers: CapabilityProvider[]): void {
    let deleted = false;
    providers.forEach(provider => {
      deleted = this._providersById.delete(provider.metadata.id);
      deleted = Maps.removeListValue(this._providersByType, provider.type, candidate => candidate.metadata.id === provider.metadata.id);
    });
    deleted && this._change$.next();
  }
}
