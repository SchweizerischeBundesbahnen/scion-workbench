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
import { Beans } from '../../bean-manager';
import { mapToBody, MessageClient, throwOnErrorStatus } from '../messaging/message-client';
import { Application, CapabilityProvider, Intention } from '../../platform.model';
import { mergeMapTo, take } from 'rxjs/operators';
import { PlatformTopics } from '../../ɵmessaging.model';
import { ManifestRegistryTopics } from '../../host/manifest-registry/ɵmanifest-registry';
import { ManifestObjectFilter } from '../../host/manifest-registry/manifest-object-store';

/**
 * Allows looking up capabilities available to the current app and managing the capabilities it provides.
 *
 * The app can query all capabilities which are visible to it, i.e., for which the app has declared an intention
 * and which are also publicly available. Capabilities that the app provides itself are always visible to the app.
 *
 * The app can also provide new capabilities to the system or remove self-provided ones. If the *Intention Registration API*
 * is enabled for the app, the app can also manage its intentions, which, however, is strongly discouraged. Instead, apps should
 * declare the required functionality in their manifests using wildcard intentions.
 *
 * @category Manifest
 */
export class ManifestService {

  constructor(private _messageClient: MessageClient = Beans.get(MessageClient)) {
  }

  /**
   * Allows to lookup the applications installed in the system.
   *
   * @return an Observable that emits the applications in the system and then completes.
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
   * Allows to lookup capabilities that match the given filter.
   *
   * <strong>
   * The app can query all capabilities which are visible to it, i.e., for which the app has declared an intention and which are also
   * publicly available. Capabilities that the app provides itself are always visible to the app.
   * </strong>
   *
   * @param  filter - Control which capabilities to return. If no or an empty filter is given, all capabilities visible to the requesting
   *         app are returned. Specified filter criteria are "AND"ed together.\
   *         <p>
   *         If given a qualifier in the filter, the qualifier can be either exact or contain wildcards to match
   *         multiple capabilities. The asterisk wildcard (`*`), if used as a qualifier entry value, requires capabilities to have such
   *         an entry. An even more lenient option is the optional wildcard (`?`), which does not require the qualifier entry at all.
   *         And finally, if using the asterisk wildcard (`*`) as the qualifier key, capabilities may contain additional qualifier entries.
   * @return An Observable that, when subscribed, emits the requested capabilities.
   *         It never completes and emits continuously when satisfying capabilities are registered or unregistered.
   */
  public lookupCapabilityProviders$<T extends CapabilityProvider>(filter?: ManifestObjectFilter): Observable<T[]> {
    return this._messageClient.request$<T[]>(ManifestRegistryTopics.LookupCapabilityProviders, filter)
      .pipe(
        throwOnErrorStatus(),
        mapToBody(),
      );
  }

  /**
   * Allows to lookup any intentions that match the given filter.
   *
   * @param  filter - Control which intentions to return. If no or an empty filter is given, no filtering takes place. Specified filter
   *         criteria are "AND"ed together.\
   *         <p>
   *         If given a qualifier in the filter, the qualifier can be either exact or contain wildcards to match
   *         multiple intentions. The asterisk wildcard (`*`), if used as a qualifier entry value, requires intentions to have such
   *         an entry. An even more lenient option is the optional wildcard (`?`), which does not require the qualifier entry at all.
   *         And finally, if using the asterisk wildcard (`*`) as the qualifier key, intentions may contain additional qualifier entries.
   * @return An Observable that, when subscribed, emits the requested intentions.
   *         It never completes and emits continuously when satisfying intentions are registered or unregistered.
   */
  public lookupIntentions$(filter?: ManifestObjectFilter): Observable<Intention[]> {
    return this._messageClient.request$<Intention[]>(ManifestRegistryTopics.LookupIntentions, filter)
      .pipe(
        throwOnErrorStatus(),
        mapToBody(),
      );
  }

  /**
   * Registers the current app as provider for the given capability.
   *
   * @return An Observable that emits the identity of the registered capability and then completes,
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
   * Unregisters the current app as provider for capabilities matching the given filter.
   *
   * <strong>The app can only unregister capabilities it provides itself.</strong>
   *
   * @param  filter - Control which providers to unregister by specifying filter criteria which are "AND"ed together.\
   *         <p>
   *         If no or an empty filter is given, all providers of the requesting app are unregistered.\
   *         If given a qualifier in the filter, wildcards, if any, are not interpreted as wildcards, but as exact values instead.\
   *         If given an app symbolic name in the filter, it is ignored.
   * @return An Observable that completes immediately when unregistered the providers,
   *         or which throws an error if the unregistration failed.
   */
  public unregisterCapabilityProviders$(filter?: ManifestObjectFilter): Observable<never> {
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
   * <strong>This operation requires that the 'Intention Registration API' is enabled for the requesting application.</strong>
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
   * <strong>This operation requires that the 'Intention Registration API' is enabled for the requesting application.</strong>
   *
   * @param  filter - Control which intentions to unregister by specifying filter criteria which are "AND"ed together.\
   *         <p>
   *         If no or an empty filter is given, all intentions of the requesting app are unregistered.\
   *         If given a qualifier in the filter, wildcards, if any, are not interpreted as wildcards, but as exact values instead.\
   *         If given an app symbolic name in the filter, it is ignored.
   * @return An Observable that completes immediately when unregistered the intentions,
   *         or which throws an error if the unregistration failed.
   */
  public unregisterIntentions$(filter?: ManifestObjectFilter): Observable<never> {
    return this._messageClient.request$<void>(ManifestRegistryTopics.UnregisterIntentions, filter)
      .pipe(
        throwOnErrorStatus(),
        take(1),
        mergeMapTo(EMPTY),
      );
  }
}
