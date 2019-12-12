/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { isEqualQualifier, matchesIntentQualifier, matchesWildcardQualifier } from '../../qualifier-tester';
import { Intention, Qualifier } from '../../platform.model';
import { Observable, Subject } from 'rxjs';
import { Maps } from '@scion/toolkit/util';
import { IntentionFilter } from './manifest-registry';

/**
 * Provides an in-memory store for declared intentions.
 */
export class IntentionStore {

  private _intentionsByApplication = new Map<string, Intention[]>();
  private _intentionsById = new Map<string, Intention>();
  private readonly _change$ = new Subject<void>();

  /**
   * Adds the given intention to this store.
   */
  public add(intention: Intention): void {
    this._intentionsById.set(intention.metadata.id, intention);
    Maps.addListValue(this._intentionsByApplication, intention.metadata.appSymbolicName, intention);
    this._change$.next();
  }

  /**
   * Removes intentions from this store that match the given filter.
   *
   * @param appSymbolicName
   *        Specify the app from which intentions should be removed.
   * @param filter
   *        Control which intentions to remove by specifying filter criteria which are "AND"ed together.
   *        Wildcards in the qualifier criterion, if any, are not interpreted as wildcards, but as exact values instead.
   * @param options
   *        Control if to remove implicit or explicit (which is by default) intentions.
   */
  public remove(appSymbolicName: string, filter: IntentionFilter & { providedBy?: string }, options?: { kind: 'implicit' | 'explicit' }): void {
    const kind = options && options.kind || 'explicit';
    const intentionsToRemove = (this._intentionsByApplication.get(appSymbolicName) || [])
      .filter(intention => kind === 'explicit' ? (intention.metadata.implicitlyProvidedBy === undefined) : (intention.metadata.implicitlyProvidedBy !== undefined))
      .filter(intention => filter.id === undefined || filter.id === intention.metadata.id)
      .filter(intention => filter.type === undefined || filter.type === intention.type)
      .filter(intention => filter.qualifier === undefined || isEqualQualifier(filter.qualifier, intention.qualifier))
      .filter(intention => filter.providedBy === undefined || filter.providedBy === intention.metadata.implicitlyProvidedBy);
    this._remove(intentionsToRemove);
  }

  /**
   * Returns the intention of the given id, or `undefined` if not found.
   *
   * @deprecated remove as only used by tests; use find(...) instead
   */
  public findById(id: string): Intention | undefined {
    return this._intentionsById.get(id);
  }

  /**
   * Finds intentions that match the given filter.
   *
   * @param filter
   *        Control which intentions to return. The filter allows to use wildcards in the qualifier.
   *        All specified filter criteria are "AND"ed together. If no filter criterion is specified,
   *        no filtering takes place.
   */
  public find(filter: IntentionFilter): Intention[] {
    return Array.from(this._intentionsById.values())
      .filter(intention => filter.appSymbolicName === undefined || filter.appSymbolicName === intention.metadata.appSymbolicName)
      .filter(intention => filter.id === undefined || filter.id === intention.metadata.id)
      .filter(intention => filter.type === undefined || filter.type === intention.type)
      .filter(intention => filter.qualifier === undefined || matchesWildcardQualifier(filter.qualifier, intention.qualifier));
  }

  /**
   * Returns the intentions of the given application which match the given qualifier.
   *
   * You can use either 'intentMatcher' or 'wildcardMatcher' strategy. Use the intent matcher strategy to find intentions
   * matching the given intent qualifier, e.g. to check if the application has declared a respective intention.
   */
  public findByApplication(appSymbolicName: string, qualifier: Qualifier, options: { strategy: 'intentMatcher' | 'wildcardMatcher' }): Intention[] {
    return (this._intentionsByApplication.get(appSymbolicName) || [])
      .filter(intention => options.strategy === 'intentMatcher' ? matchesIntentQualifier(intention.qualifier, qualifier) : matchesWildcardQualifier(intention.qualifier, qualifier));
  }

  /**
   * Emits when an intention is added to or removed from this store.
   */
  public get change$(): Observable<void> {
    return this._change$.asObservable();
  }

  /**
   * Removes the intents from all internal maps.
   */
  private _remove(intentions: Intention[]): void {
    let deleted = false;
    intentions.forEach(intention => {
      deleted = this._intentionsById.delete(intention.metadata.id) || deleted;
      deleted = Maps.removeListValue(this._intentionsByApplication, intention.metadata.appSymbolicName, candidate => candidate.metadata.id === intention.metadata.id) || deleted;
    });
    deleted && this._change$.next();
  }
}
