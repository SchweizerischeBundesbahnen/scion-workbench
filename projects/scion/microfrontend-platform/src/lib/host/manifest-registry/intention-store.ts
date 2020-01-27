/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { isEqualQualifier, matchesWildcardQualifier, QualifierMatcher } from '../../qualifier-tester';
import { Intention } from '../../platform.model';
import { Observable, Subject } from 'rxjs';
import { Arrays, Maps } from '@scion/toolkit/util';
import { IntentionFilter } from './manifest-registry';

/**
 * Provides an in-memory store for declared intentions.
 */
export class IntentionStore {

  private _intentionsById = new Map<string, Intention>();
  private _intentionsByType = new Map<string, Intention[]>();
  private _intentionsByApplication = new Map<string, Intention[]>();
  private readonly _change$ = new Subject<void>();

  /**
   * Adds the given intention to this store.
   */
  public add(intention: Intention): void {
    this._intentionsById.set(intention.metadata.id, intention);
    Maps.addListValue(this._intentionsByType, intention.type, intention);
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
   */
  public remove(appSymbolicName: string, filter: IntentionFilter): void {
    filter = {...filter, appSymbolicName};
    const intentionsToRemove = this.find(filter, isEqualQualifier);
    this._remove(intentionsToRemove);
  }

  /**
   * Finds intentions that match the given filter.
   *
   * @param filter
   *        Control which intentions to return. The filter allows to use wildcards in the qualifier.
   *        All specified filter criteria are "AND"ed together. If no filter criterion is specified,
   *        no filtering takes place.
   * @param qualifierMatcher
   *        Control how to match the qualifier, if any. If not specified, {@link matchesWildcardQualifier} is used.
   *        Use {@link matchesIntentQualifier} to find intentions matching the given intent qualifier, e.g. to check if the application has declared a respective intention.
   *        Use {@link matchesWildcardQualifier} to find intentions matching the given wildcard qualifier, e.g. to find all the intentions matching a pattern.
   */
  public find(filter: IntentionFilter, qualifierMatcher: QualifierMatcher = matchesWildcardQualifier): Intention[] {
    const filterById = filter.id !== undefined;
    const filterByType = filter.type !== undefined;
    const filterByApp = filter.appSymbolicName !== undefined;

    return Arrays
      .intersect(
        filterById ? Arrays.from(this._intentionsById.get(filter.id)) : undefined,
        filterByType ? Arrays.from(this._intentionsByType.get(filter.type)) : undefined,
        filterByApp ? Arrays.from(this._intentionsByApplication.get(filter.appSymbolicName)) : undefined,
        (filterById || filterByType || filterByApp) ? undefined : Array.from(this._intentionsById.values()),
      )
      .filter(intention => {
        return filter.qualifier === undefined || qualifierMatcher(intention.qualifier, filter.qualifier);
      });
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
      deleted = Maps.removeListValue(this._intentionsByType, intention.type, candidate => candidate.metadata.id === intention.metadata.id) || deleted;
      deleted = Maps.removeListValue(this._intentionsByApplication, intention.metadata.appSymbolicName, candidate => candidate.metadata.id === intention.metadata.id) || deleted;
    });
    deleted && this._change$.next();
  }
}
