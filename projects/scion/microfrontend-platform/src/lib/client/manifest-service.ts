/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { EMPTY, Observable } from 'rxjs';
import { Beans } from '../bean-manager';
import { mapToBody, MessageClient, throwOnErrorStatus } from '../client/message-client';
import { Application, CapabilityProvider, Intention } from '../platform.model';
import { mergeMapTo, take } from 'rxjs/operators';
import { PlatformTopics } from '../ɵmessaging.model';
import { ManifestRegistryTopics } from '../host/manifest-registry/ɵmanifest-registry';
import { CapabilityProviderFilter, IntentionFilter } from '../host/manifest-registry/manifest-registry';

/**
 * Central point for looking up or managing capability providers or intentions available in the system.
 */
export class ManifestService {

  constructor(private _messageClient: MessageClient = Beans.get(MessageClient)) {
  }

  /**
   * Allows to look up the applications installed in the system.
   *
   * @retun an Observable that emits the applications in the system and then completes.
   */
  public lookupApplications$(): Observable<Application[]> {
    return this._messageClient.observe$<Application[]>(PlatformTopics.Applications)
      .pipe(
        take(1),
        throwOnErrorStatus(),
        mapToBody(),
      );
  }

  /**
   * Allows to look up capabilities that match the given filter.
   *
   * Only those capabilities are returned for which the requesting application has declared an intention,
   * and which either have public visibility or are provided by the app itself.
   *
   * @param  filter
   *         Control which capabilities to return. If no or an empty filter is given, all capabilities visible
   *         to the requesting app are returned. Specified filter criteria are "AND"ed together.
   *         If given a qualifier in the filter, the qualifier can be either exact or contain wildcards to match multiple capabilities.
   *         If an asterisk wildcard ('*') is used as value for a qualifier entry, then capabilities must have such an entry but with any
   *         value. An even more lenient option is the optional wildcard ('?') which does not require the entry at all.
   *         If using the asterisk wildcard ('*') as the qualifier key, capabilities may contain additional entries in the qualifier.
   * @return An Observable that, when subscribed, emits the requested capabilities.
   *         It never completes and emits continuously when satisfying capabilities are registered or unregistered.
   */
  public lookupCapabilityProviders$<T extends CapabilityProvider>(filter?: CapabilityProviderFilter): Observable<T[]> {
    return this._messageClient.request$<T[]>(ManifestRegistryTopics.LookupCapabilityProviders, filter)
      .pipe(
        throwOnErrorStatus(),
        mapToBody(),
      );
  }

  /**
   * Allows to look up intentions that match the given filter.
   *
   * @param  filter
   *         Control which intentions to return. If no or an empty filter is given, no filtering takes place.
   *         Specified filter criteria are "AND"ed together.
   *         If given a qualifier in the filter, the qualifier can be either exact or contain wildcards to match multiple intentions.
   *         If an asterisk wildcard ('*') is used as value for a qualifier entry, then intentions must have such an entry but with any
   *         value. An even more lenient option is the optional wildcard ('?') which does not require the entry at all.
   *         If using the asterisk wildcard ('*') as the qualifier key, intentions may contain additional entries in the qualifier.
   * @return An Observable that, when subscribed, emits the requested intentions.
   *         It never completes and emits continuously when satisfying intentions are registered or unregistered.
   */
  public lookupIntentions$(filter?: IntentionFilter): Observable<Intention[]> {
    return this._messageClient.request$<Intention[]>(ManifestRegistryTopics.LookupIntentions, filter)
      .pipe(
        throwOnErrorStatus(),
        mapToBody(),
      );
  }

  /**
   * Registers the given capability provider for the requesting application.
   *
   * @return An Observable that emits the identity of the registered provider and then completes,
   *         or which throws an error if the registration failed.
   */
  public registerCapabilityProvider$(capabilityProvider: CapabilityProvider): Observable<string> {
    return this._messageClient.request$<string>(ManifestRegistryTopics.RegisterCapabilityProvider, capabilityProvider)
      .pipe(
        throwOnErrorStatus(),
        take(1),
        mapToBody(),
      );
  }

  /**
   * Unregisters capability providers of the requesting application which match the given filter.
   *
   * @param  filter
   *         Control which providers to unregister by specifying filter criteria which are "AND"ed together.
   *         If no or an empty filter is given, all providers of the requesting app are unregistered.
   *         If given a qualifier in the filter, wildcards, if any, are not interpreted as wildcards, but as exact values instead.
   *         If given an app symbolic name in the filter, it is ignored.
   * @return An Observable that completes immediately when unregistered the providers,
   *         or which throws an error if the unregistration failed.
   */
  public unregisterCapabilityProviders$(filter?: CapabilityProviderFilter): Observable<never> {
    return this._messageClient.request$<void>(ManifestRegistryTopics.UnregisterCapabilityProviders, filter)
      .pipe(
        throwOnErrorStatus(),
        take(1),
        mergeMapTo(EMPTY),
      );
  }

  /**
   * Registers the given intention for the requesting application.
   *
   * This operation requires that the 'Intention Registration API' is enabled for the requesting application.
   *
   * @return An Observable that emits the identity of the registered intention and then completes,
   *         or which throws an error if the registration failed.
   */
  public registerIntention$(intention: Intention): Observable<string> {
    return this._messageClient.request$<string>(ManifestRegistryTopics.RegisterIntention, intention)
      .pipe(
        throwOnErrorStatus(),
        take(1),
        mapToBody(),
      );
  }

  /**
   * Unregisters intentions of the requesting application which match the given filter.
   *
   * @param  filter
   *         Control which intentions to unregister by specifying filter criteria which are "AND"ed together.
   *         If no or an empty filter is given, all intentions of the requesting app are unregistered.
   *         If given a qualifier in the filter, wildcards, if any, are not interpreted as wildcards, but as exact values instead.
   *         If given an app symbolic name in the filter, it is ignored.
   * @return An Observable that completes immediately when unregistered the intentions,
   *         or which throws an error if the unregistration failed.
   */
  public unregisterIntentions$(filter?: IntentionFilter): Observable<never> {
    return this._messageClient.request$<void>(ManifestRegistryTopics.UnregisterIntentions, filter)
      .pipe(
        throwOnErrorStatus(),
        take(1),
        mergeMapTo(EMPTY),
      );
  }
}
