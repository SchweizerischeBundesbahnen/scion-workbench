/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { InjectionToken } from '@angular/core';
import { ApplicationRegistry } from './application-registry.service';
import { ManifestRegistry } from './manifest-registry.service';
import { Capability, Intent, IntentMessage, MessageEnvelope, Qualifier } from '@scion/workbench-application-platform.api';
import { Observable } from 'rxjs';

/**
 * DI injection token to register a class to handle intents of some type and qualifier.
 */
export const INTENT_HANDLER = new InjectionToken<IntentHandler[]>('INTENT_HANDLER');

/**
 * Symbolic name of the host application.
 */
export const HOST_APPLICATION_SYMBOLIC_NAME = 'host';

/**
 * Metadata that describes the application to register in the platform.
 */
export interface ApplicationConfig {
  /**
   * Unique symbolic name of the application.
   *
   * The symbolic name is used to create child routes to the application.
   * Choose a short, lowercase name which contains alphanumeric characters and optionally dash characters.
   */
  symbolicName: string;
  /**
   * URL to the application manifest.
   */
  manifestUrl: string;
  /**
   * Excludes the application from registration, e.g. to not register it in a specific environment.
   */
  exclude?: boolean;
  /**
   * Sets whether or not capability scope check is disabled for this application.
   *
   * With scope check disabled (discouraged), the application can invoke private capabilities of other applications.
   *
   * By default, scope check is enabled.
   */
  scopeCheckDisabled?: boolean;
  /**
   * Defines restrictions for this application, e.g. to not contribute activities.
   *
   * By default, the app has no restrictions.
   */
  restrictions?: {
    /**
     * Controls if this application is allowed to contribute activities.
     */
    activityContributionAllowed: boolean;
  };
}

/**
 * Represents the manifest of an application.
 */
export interface ApplicationManifest {
  /**
   * Name of the application.
   */
  name: string;
  /**
   * URL to the application root.
   * The base URL can be absolute, or relative to the origin of the 'manifestUrl'.
   * If not specified, the origin from 'manifestUrl' is used as the base URL.
   */
  baseUrl?: string;
  /**
   * Functionality which the application intends to use.
   */
  intents: Intent[];
  /**
   * Functionality which the application provides.
   */
  capabilities: Capability[];
}

/**
 * Handles intents of a specific type and qualifiers.
 *
 * There are some built-in handlers installed by the platform: 'view', 'popup', 'messagebox', 'notification' and 'manifest-registry'.
 *
 * To install a handler, register it via DI token {INTENT_HANDLER} as multi provider in the host application.
 *
 * ---
 * Example registration:
 *
 * @NgModule({
 *   imports: [
 *     WorkbenchModule.forRoot(),
 *     WorkbenchApplicationPlatformModule.forRoot(...),
 *   ],
 *   providers: [
 *     {provide: INTENT_HANDLER, useClass: YourHandler, multi: true},
 *   ],
 * })
 * export class AppModule {}
 */
export interface IntentHandler {
  /**
   * Specifies the type of functionality which this handler handles, e.g. 'selection' if handling selection intents.
   */
  readonly type: string;

  /**
   * Optional qualifiers which this handler requires. If not specified, {NilQualifier} is used.
   */
  readonly qualifier?: Qualifier;

  /**
   * Describes the capability this handler handles.
   */
  readonly description: string;

  /**
   * Indicates if this handler acts as a proxy through which intents are processed.
   *
   * For example, `ViewIntentHandler` is a proxy for application view capabilities which
   * reads config from registered view capability providers and dispatches intents to the Angular router.
   */
  readonly proxy?: boolean;

  /**
   * A lifecycle hook that is called after the platform completed registration of applications.
   *
   * Use this method to handle any initialization tasks which require the application or manifest registry.
   */
  onInit?(applicationRegistry: ApplicationRegistry, manifestRegistry: ManifestRegistry): void;

  /**
   * Method invoked upon the receipt of an intent which this handler qualifies to receive.
   */
  onIntent(envelope: MessageEnvelope<IntentMessage>): void;
}

/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of {ErrorHandler} shows error messages as notifications to the user.
 * For customized error handling, write a custom handler and register it in {WorkbenchApplicationPlatformConfig}.
 */
export abstract class ErrorHandler {

  /**
   * Method invoked if no application is found to provide a capability of that kind.
   *
   * @param application
   *        the application which issued the intent
   * @param type
   *        type of functionality requested
   * @param qualifier
   *        qualifier to identify the capability
   * @param message
   *        technical error message
   */
  public abstract handleNullProviderError?(application: string, type: string, qualifier: Qualifier, message: string): void;

  /**
   * Method invoked if the application is not qualified to publish intents of that kind.
   *
   * @param application
   *        the application which issued the intent
   * @param type
   *        type of functionality requested
   * @param qualifier
   *        qualifier to identify the provider
   * @param message
   *        technical error message
   */
  public abstract handleNotQualifiedIntentMessageError?(application: string, type: string, qualifier: Qualifier, message: string): void;

  /**
   * Method invoked if the application is not qualified to publish capability messages of that kind.
   *
   * @param application
   *        the application which published the capability message
   * @param type
   *        type of functionality which the capability provides
   * @param qualifier
   *        qualifiers which the capability requires
   * @param message
   *        technical error message
   */
  public abstract handleNotQualifiedCapabilityMessageError?(application: string, type: string, qualifier: Qualifier, message: string): void;
}

/**
 * Loads applications running in the platform.
 */
export abstract class ApplicationConfigLoader {

  /**
   * Loads applications running in the platform.
   */
  public abstract load$(): Observable<ApplicationConfig[]>;
}
