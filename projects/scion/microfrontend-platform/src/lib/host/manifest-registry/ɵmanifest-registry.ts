/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { CapabilityProvider, Intention, NilQualifier } from '../../platform.model';
import { sha256 } from 'js-sha256';
import { Defined } from '@scion/toolkit/util';
import { ManifestObjectFilter, ManifestObjectStore } from './manifest-object-store';
import { defer, merge, of, Subject } from 'rxjs';
import { Beans, PreDestroy } from '../../bean-manager';
import { distinctUntilChanged, expand, mergeMapTo, take, takeUntil } from 'rxjs/operators';
import { PlatformMessageClient } from '../platform-message-client';
import { Intent, MessageHeaders, ResponseStatusCodes, TopicMessage } from '../../messaging.model';
import { takeUntilUnsubscribe } from '../../client/message-client';
import { ApplicationRegistry } from '../application-registry';
import { runSafe } from '../../safe-runner';
import { filterArray } from '@scion/toolkit/operators';
import { ManifestRegistry } from './manifest-registry';
import { matchesIntentQualifier, matchesWildcardQualifier } from '../../qualifier-tester';

// tslint:disable:unified-signatures
export class ɵManifestRegistry implements ManifestRegistry, PreDestroy { // tslint:disable-line:class-name

  private _providerStore: ManifestObjectStore<CapabilityProvider>;
  private _intentionStore: ManifestObjectStore<Intention>;
  private _destroy$ = new Subject<void>();

  constructor() {
    this._providerStore = new ManifestObjectStore<CapabilityProvider>();
    this._intentionStore = new ManifestObjectStore<Intention>();

    this.installProviderRegisterRequestHandler();
    this.installProviderUnregisterRequestHandler();

    this.installIntentionRegisterRequestHandler();
    this.installIntentionUnregisterRequestHandler();

    this.installProvidersLookupRequestHandler();
    this.installIntentionsLookupRequestHandler();
  }

  /**
   * @inheritDoc
   */
  public getCapabilityProvidersByIntent(intent: Intent, appSymbolicName: string): CapabilityProvider[] {
    const filter: ManifestObjectFilter = {type: intent.type, qualifier: intent.qualifier || {}};
    return this._providerStore.find(filter, matchesIntentQualifier)
      .filter(provider => this.isProviderVisibleToApplication(provider, appSymbolicName));
  }

  /**
   * @inheritDoc
   */
  public hasIntention(intent: Intent, appSymbolicName: string): boolean {
    const filter: ManifestObjectFilter = {appSymbolicName, type: intent.type, qualifier: intent.qualifier || {}};
    return (
      this._intentionStore.find(filter, matchesIntentQualifier).length > 0 ||
      this._providerStore.find(filter, matchesIntentQualifier).length > 0
    );
  }

  /**
   * Tests whether the given app has declared a satisfying intention for the given provider.
   */
  private hasIntentionForProvider(appSymbolicName: string, provider: CapabilityProvider): boolean {
    return (
      provider.metadata.appSymbolicName === appSymbolicName ||
      this._intentionStore.find({appSymbolicName, type: provider.type, qualifier: provider.qualifier}, matchesWildcardQualifier).length > 0
    );
  }

  /**
   * Tests whether the given app can see the given provider, i.e. the app provides the provider itself, or the provider has public visibility,
   * or scope check is disabled for the app.
   */
  private isProviderVisibleToApplication(provider: CapabilityProvider, appSymbolicName: string): boolean {
    return !provider.private || provider.metadata.appSymbolicName === appSymbolicName || Beans.get(ApplicationRegistry).isScopeCheckDisabled(appSymbolicName);
  }

  public registerCapabilityProvider(provider: CapabilityProvider, appSymbolicName: string): string | undefined {
    if (!provider) {
      throw Error('[ProviderRegisterError] Missing required provider.');
    }
    if (provider.qualifier && provider.qualifier.hasOwnProperty('*')) {
      throw Error('[ProviderRegisterError] Asterisk wildcard (\'*\') not allowed in the qualifier key.');
    }

    const registeredProvider: CapabilityProvider = {
      ...provider,
      qualifier: Defined.orElse(provider.qualifier, NilQualifier),
      private: Defined.orElse(provider.private, true),
      metadata: {
        id: sha256(JSON.stringify({application: appSymbolicName, type: provider.type, ...provider.qualifier})).substr(0, 7), // use the first 7 digits of the provider hash as provider id
        appSymbolicName: appSymbolicName,
      },
    };

    // Register the provider.
    this._providerStore.add(registeredProvider);

    return registeredProvider.metadata.id;
  }

  private unregisterCapabilityProviders(appSymbolicName: string, filter: ManifestObjectFilter): void {
    this._providerStore.remove({...filter, appSymbolicName});
  }

  public registerIntention(intention: Intention, appSymbolicName: string): string | undefined {
    if (!intention) {
      throw Error(`[IntentionRegisterError] Missing required intention.`);
    }

    const registeredIntention: Intention = {
      ...intention,
      metadata: {
        id: sha256(JSON.stringify({application: appSymbolicName, type: intention.type, ...intention.qualifier})).substr(0, 7), // use the first 7 digits of the intent hash as intent id
        appSymbolicName: appSymbolicName,
      },
    };

    this._intentionStore.add(registeredIntention);
    return registeredIntention.metadata.id;
  }

  private unregisterIntention(appSymbolicName: string, filter: ManifestObjectFilter): void {
    this._intentionStore.remove({...filter, appSymbolicName});
  }

  private installProviderRegisterRequestHandler(): void {
    Beans.get(PlatformMessageClient).observe$(ManifestRegistryTopics.RegisterCapabilityProvider)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<CapabilityProvider>) => runSafe(() => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);
        const provider = request.body;
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);

        try {
          const providerId = this.registerCapabilityProvider(provider, appSymbolicName);
          Beans.get(PlatformMessageClient).publish$(replyTo, providerId, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
        }
        catch (error) {
          Beans.get(PlatformMessageClient).publish$(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)}).subscribe();
        }
      }));
  }

  private installProviderUnregisterRequestHandler(): void {
    Beans.get(PlatformMessageClient).observe$(ManifestRegistryTopics.UnregisterCapabilityProviders)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<ManifestObjectFilter>) => runSafe(() => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);
        const providerFilter = request.body || {};
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);

        try {
          this.unregisterCapabilityProviders(appSymbolicName, providerFilter);
          Beans.get(PlatformMessageClient).publish$(replyTo, undefined, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
        }
        catch (error) {
          Beans.get(PlatformMessageClient).publish$(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)}).subscribe();
        }
      }));
  }

  private installIntentionRegisterRequestHandler(): void {
    Beans.get(PlatformMessageClient).observe$(ManifestRegistryTopics.RegisterIntention)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<Intention>) => runSafe(() => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);
        const intent = request.body;
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);

        try {
          assertIntentionRegisterApiEnabled(appSymbolicName);
          const intentionId = this.registerIntention(intent, appSymbolicName);
          Beans.get(PlatformMessageClient).publish$(replyTo, intentionId, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
        }
        catch (error) {
          Beans.get(PlatformMessageClient).publish$(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)}).subscribe();
        }
      }));
  }

  private installIntentionUnregisterRequestHandler(): void {
    Beans.get(PlatformMessageClient).observe$(ManifestRegistryTopics.UnregisterIntentions)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<ManifestObjectFilter>) => runSafe(() => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);
        const intentFilter = request.body || {};
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);

        try {
          assertIntentionRegisterApiEnabled(appSymbolicName);
          this.unregisterIntention(appSymbolicName, intentFilter);
          Beans.get(PlatformMessageClient).publish$(replyTo, undefined, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
        }
        catch (error) {
          Beans.get(PlatformMessageClient).publish$(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)}).subscribe();
        }
      }));
  }

  private installProvidersLookupRequestHandler(): void {
    Beans.get(PlatformMessageClient).observe$(ManifestRegistryTopics.LookupCapabilityProviders)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<ManifestObjectFilter>) => runSafe(() => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);
        const appSymbolicName = request.headers.get(MessageHeaders.AppSymbolicName);
        const lookupFilter = request.body || {};

        // The queried capabilities may change on both, provider or intention change, because the computation
        // of visible and qualified capabilities depends on registered providers and manifested intentions.
        const registryChange$ = merge(this._providerStore.change$, this._intentionStore.change$);
        const finder$ = defer(() => of(this._providerStore.find(lookupFilter, matchesWildcardQualifier)));
        return finder$
          .pipe(
            expand(() => registryChange$.pipe(take(1), mergeMapTo(finder$))),
            filterArray(provider => this.isProviderVisibleToApplication(provider, appSymbolicName)),
            filterArray(provider => this.hasIntentionForProvider(appSymbolicName, provider)),
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            takeUntilUnsubscribe(replyTo, PlatformMessageClient),
          )
          .subscribe(providers => {
            Beans.get(PlatformMessageClient).publish$<CapabilityProvider[]>(replyTo, providers, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
          });
      }));
  }

  private installIntentionsLookupRequestHandler(): void {
    Beans.get(PlatformMessageClient).observe$(ManifestRegistryTopics.LookupIntentions)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<ManifestObjectFilter>) => runSafe(() => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);
        const lookupFilter = request.body || {};

        const finder$ = defer(() => of(this._intentionStore.find(lookupFilter, matchesWildcardQualifier)));
        return finder$
          .pipe(
            expand(() => this._intentionStore.change$.pipe(take(1), mergeMapTo(finder$))),
            distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
            takeUntilUnsubscribe(replyTo, PlatformMessageClient),
          )
          .subscribe(intentions => {
            Beans.get(PlatformMessageClient).publish$<Intention[]>(replyTo, intentions, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
          });
      }));
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Defines the topics to interact with the manifest registry from {@link ManifestService}.
 */
export enum ManifestRegistryTopics {
  LookupCapabilityProviders = 'ɵLOOKUP_CAPABILITY_PROVIDERS',
  LookupIntentions = 'ɵLOOKUP_INTENTIONS',
  RegisterCapabilityProvider = 'ɵREGISTER_CAPABILITY_PROVIDER',
  UnregisterCapabilityProviders = 'ɵUNREGISTER_CAPABILITY_PROVIDERS',
  RegisterIntention = 'ɵREGISTER_INTENTION',
  UnregisterIntentions = 'ɵUNREGISTER_INTENTIONS',
}

/**
 * Returns the error message if given an error object, or the `toString` representation otherwise.
 */
function readErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return error.toString();
}

/**
 * Checks if the 'Intention Registration API' is enabled for the given app. If not, an error is thrown.
 */
function assertIntentionRegisterApiEnabled(appSymbolicName: string): void {
  if (Beans.get(ApplicationRegistry).isIntentionRegisterApiDisabled(appSymbolicName)) {
    throw Error(`[IntentionRegisterError] The 'Intention Registration API' is disabled for the application '${appSymbolicName}'. Contact the platform administrator to enable this API.`);
  }
}
