/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { CapabilityProvider } from '../../platform.model';
import { isEqualQualifier, matchesWildcardQualifier, QualifierMatcher } from '../../qualifier-tester';
import { Observable, Subject } from 'rxjs';
import { Arrays, Maps } from '@scion/toolkit/util';
import { CapabilityProviderFilter } from './manifest-registry';

/**
 * Provides an in-memory store for provided capabilities.
 */
export class ProviderStore {

  private readonly _providersById = new Map<string, CapabilityProvider>();
  private readonly _providersByType = new Map<string, CapabilityProvider[]>();
  private readonly _providersByApplication = new Map<string, CapabilityProvider[]>();
  private readonly _change$ = new Subject<void>();

  /**
   * Adds the given capability provider to this store.
   */
  public add(provider: CapabilityProvider): void {
    this._providersById.set(provider.metadata.id, provider);
    Maps.addListValue(this._providersByType, provider.type, provider);
    Maps.addListValue(this._providersByApplication, provider.metadata.appSymbolicName, provider);
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
   *        Wildcards in the qualifier criterion, if any, are not interpreted as wildcards, but as exact values instead.
   */
  public remove(appSymbolicName: string, filter: CapabilityProviderFilter): void {
    filter = {...filter, appSymbolicName};
    const providersToRemove = this.find(filter, isEqualQualifier);
    this._remove(providersToRemove);
  }

  /**
   * Finds providers that match the given filter.
   *
   * @param filter
   *        Control which providers to return.
   *        All specified filter criteria are "AND"ed together. If no filter criterion is specified, no filtering takes place.
   * @param qualifierMatcher
   *        Control how to match the qualifier, if any. If not specified, {@link matchesWildcardQualifier} is used.
   */
  public find(filter: CapabilityProviderFilter, qualifierMatcher: QualifierMatcher = matchesWildcardQualifier): CapabilityProvider[] {
    const filterById = filter.id !== undefined;
    const filterByType = filter.type !== undefined;
    const filterByApp = filter.appSymbolicName !== undefined;

    return Arrays
      .intersect(
        filterById ? Arrays.from(this._providersById.get(filter.id)) : undefined,
        filterByType ? Arrays.from(this._providersByType.get(filter.type)) : undefined,
        filterByApp ? Arrays.from(this._providersByApplication.get(filter.appSymbolicName)) : undefined,
        (filterById || filterByType || filterByApp) ? undefined : Array.from(this._providersById.values()),
      )
      .filter(provider => {
        return filter.qualifier === undefined || qualifierMatcher(provider.qualifier, filter.qualifier);
      });
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
      deleted = this._providersById.delete(provider.metadata.id) || deleted;
      deleted = Maps.removeListValue(this._providersByType, provider.type, candidate => candidate.metadata.id === provider.metadata.id) || deleted;
      deleted = Maps.removeListValue(this._providersByApplication, provider.metadata.appSymbolicName, candidate => candidate.metadata.id === provider.metadata.id) || deleted;
    });
    deleted && this._change$.next();
  }
}
