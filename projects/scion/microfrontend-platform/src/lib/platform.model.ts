/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Manifest of an application.
 *
 * Each application in the platform must provide a manifest. If using intent-based communication, the app can declare
 * its intentions in the `intentions` section and capabilities that it provides in the `capabilities` section.
 * See {@link Intention} and {@link CapabilityProvider} for more information.
 *
 * @category Platform
 */
export interface ApplicationManifest {
  /**
   * Name of the application.
   */
  name: string;
  /**
   * URL to the application root.
   * The base URL can be absolute or relative to the origin of the `manifestUrl`.
   * If not specified, the origin of the `manifestUrl` is used as the base URL.
   */
  baseUrl?: string;
  /**
   * Functionality which this application intends to use.
   */
  intentions?: Intention[];
  /**
   *
   * Functionality which this application provides that qualified apps can call via intent.
   */
  capabilities?: CapabilityProvider[];
}

/**
 * Represents a dictionary of key-value pairs to qualify an intention, intent or capability.
 *
 * See {@link Intention}, {@link CapabilityProvider} or {@link Intent} for the usage of wildcards
 * in qualifier entries.
 *
 * @category Platform
 */
export interface Qualifier {
  [key: string]: string | number | boolean;
}

/**
 * Qualifies nothing.
 *
 * @category Platform
 */
export const NilQualifier = {};

/**
 * Qualifies anything.
 *
 * @category Platform
 */
export const AnyQualifier = {'*': '*'};

/**
 * Represents an application registered in the platform.
 *
 * @category Platform
 */
export interface Application {
  /**
   * Unique symbolic name of the application.
   */
  symbolicName: string;
  /**
   * Name of the application as specified in the manifest.
   */
  name: string;
  /**
   * URL to the application root.
   */
  baseUrl: string;
  /**
   * Origin of the application.
   */
  origin: string;
  /**
   * URL to the manifest of this application.
   */
  manifestUrl: string;
  /**
   * Indicates whether or not capability scope check is disabled for this application.
   */
  scopeCheckDisabled: boolean;
  /**
   * Indicates whether or not 'Intention Registration API' is disabled for this application.
   */
  intentionRegisterApiDisabled: boolean;
  /**
   * Indicates whether or not this application can issue intents for which it has not declared a respective intention.
   */
  intentionRegisteredCheckDisabled: boolean;
}

/**
 * Provides a capability which can be requested via intent.
 *
 * A capability can be provided with 'private' or 'public' scope. By default, capabilities have private scope and are
 * available to the app that provides it only. Public capabilities, however, are available to all apps in the system.
 *
 * When some app intends to use this capability, the intent is transported to all instances of the providing app. Typically,
 * intents are handled in the primary app activator. See {@link ActivatorProvider} for more information about how to
 * register an activator.
 *
 * @category Platform
 */
export interface CapabilityProvider {
  /**
   * Categorizes the functionality.
   */
  type: string;
  /**
   * The qualifier is an abstract description of the capability and is expressed in the form of a dictionary.
   * It should include enough information for the platform to determine which capabilities match an intent.
   *
   * The qualifier can be either exact or contain wildcards to match multiple intents simultaneously.
   * The asterisk wildcard (`*`), if used as a qualifier entry value, requires intents to have such an entry.
   * An even more lenient option is the optional wildcard (`?`), which does not require the qualifier entry at all.
   * And finally, if using the asterisk wildcard (`*`) as the qualifier key, intents may also contain additional
   * qualifier entries which are ignored by this provider.
   */
  qualifier?: Qualifier;
  /**
   * Specifies if this is an application private capability and not part of the application's public API.
   * If private (which is by default), other applications cannot issue an intent to this capability.
   */
  private?: boolean;
  /**
   * Describes this capability.
   */
  description?: string;
  /**
   * Declares provider specific properties.
   */
  properties?: {
    [key: string]: any;
  };
  /**
   * Metadata about the provider (read-only, exclusively managed by the platform).
   * @ignore
   */
  metadata?: {
    /**
     * Unique identity of this provider.
     */
    id: string;
    /**
     * Symbolic name of the application which provides this capability.
     */
    appSymbolicName: string;
  };
}

/**
 * An application must declare all its intentions in the application manifest.
 *
 * The app can only issue intents for which it declared an intention; otherwise, intents are rejected when issued, unless providing
 * the capability itself. An intent is the message passed to interact with functionality available in the system.
 *
 * The enforced declaration allows to analyze which app depends on which functionality in the system. Intentions or intents are
 * formulated in an abstract way and consist of a type and qualifier.
 *
 * Intent-based communication enables loose coupling between components. This can also be achieved with topic-based communication.
 * In contrast to topics, however, intents require the prior declaration of both sides. In addition, it allows the flexible
 * composition of web content by looking up available system functionality from the manifests.
 *
 * @category Platform
 */
export interface Intention {
  /**
   * Type of functionality to intend.
   */
  type: string;
  /**
   * The qualifier is an abstract description of the intention and is expressed in the form of a dictionary.
   *
   * The qualifier can be either exact or contain wildcards to declare multiple intentions simultaneously.
   * The asterisk wildcard (`*`), if used as a qualifier entry value, requires intents to have such an entry.
   * An even more lenient option is the optional wildcard (`?`), which does not require the qualifier entry at all.
   * And finally, if using the asterisk wildcard (`*`) as the qualifier key, intents may also contain additional
   * qualifier entries.
   */
  qualifier?: Qualifier;
  /**
   * Metadata about this intention (read-only, exclusively managed by the platform).
   * @ignore
   */
  metadata?: {
    /**
     * Unique identity of this intent declaration.
     */
    id: string;
    /**
     * Symbolic name of the application which declares this intention.
     */
    appSymbolicName: string;
  };
}

/**
 * Symbol to determine if this app instance is running as the platform host.
 *
 * ```ts
 * const isPlatformHost: boolean = Beans.get(IS_PLATFORM_HOST);
 * ```
 *
 * @category Platform
 */
export abstract class IS_PLATFORM_HOST { // tslint:disable-line:class-name
}

/**
 * Built in capability types.
 *
 * @category Platform
 */
export enum PlatformCapabilityTypes {
  /**
   * Defines the capability type under which applications can provide application activators.
   *
   * Activators are loaded on platform startup so that applications can interact with the system
   * even when no microfrontend of that app is currently displayed. For example, it allows an
   * application to handle intents, or to flexibly provide capabilities.
   *
   * Activator providers must have public visibility.
   *
   * @see ActivatorProvider
   */
  Activator = 'activator'
}

/**
 * Activators are loaded on platform startup so that applications can interact with the system
 * even when no microfrontend of that app is currently displayed.
 *
 * For example, it allows an application to handle intents, or to flexibly provide capabilities.
 *
 * Activators are provided via application manifest:
 *
 * ```json
 * "capabilities": [
 *   {
 *     "type": "activator",
 *     "private": false,
 *     "properties": {
 *       "path": "path/to/the/activator"
 *     }
 *   }
 * ]
 * ```
 *
 * An activator specifies a path to the microfrontend that operates as application activator. When the platform is started,
 * this microfrontend is loaded into the platform for the entire platform lifecycle. The microfrontend is mounted in a hidden
 * iframe and never shown to the user, thus should not provide a user interface.
 *
 * The platform nominates one activator of each app as primary activator. By requesting the {@link ActivationContext} via
 * {@link ContextService}, a microfrontend can test whether loaded by the primary activator.
 *
 * ```ts
 * Beans.get(ContextService).observe$(ACTIVATION_CONTEXT).subscribe((activationContext: ActivationContext) => {
 *   if (activationContext.primary) {
 *     ...
 *   }
 * });
 * ```
 *
 * @category Platform
 */
export interface ActivatorProvider extends CapabilityProvider {
  type: PlatformCapabilityTypes.Activator;
  private: false;
  properties: {
    /**
     * Path where the microfrontend is provided which operates as application activator.
     * When the platform is started, this microfrontend is loaded into the platform for the entire
     * platform lifecycle. The path is relative to the base URL as specified in the application manifest.
     *
     * The microfrontend is mounted in a hidden iframe and never shown to the user, thus should not
     * provide a user interface.
     */
    path: string;
  };
}
