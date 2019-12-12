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
  intentions: Intention[];
  /**
   * Functionality which the application provides.
   */
  capabilities: CapabilityProvider[];
}

/**
 * Represents a dictionary of key-value pairs to qualify an intent or capability.
 */
export interface Qualifier {
  [key: string]: string | number | boolean;
}

/**
 * Qualifies nothing.
 */
export const NilQualifier = {};

/**
 * Qualifies anything.
 */
export const AnyQualifier = {'*': '*'};

/**
 * Represents an application registered in the platform.
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
   * URL to the manifest.
   */
  manifestUrl: string;
  /**
   * Sets whether or not capability scope check is disabled for this application.
   */
  scopeCheckDisabled: boolean;
  /**
   * Sets whether or not 'Intention Registration API' is disabled for this application.
   */
  intentionRegisterApiDisabled: boolean;
}

/**
 * Provides a capability which can be requested via intent.
 */
export interface CapabilityProvider {
  /**
   * Defines the type of functionality which this provider provides.
   */
  type: string;
  /**
   * The qualifier is an abstract description of the capability and is expressed in the form of a dictionary.
   * It should include enough information for the platform to determine which capabilities match an intent.
   *
   * The qualifier can be either exact or contain wildcards to match multiple intents simultaneously.
   * If an asterisk wildcard ('*') is used as value for a qualifier entry, then intents must have such an entry but with any value allowed.
   * An even more lenient option is the optional wildcard ('?') which does not require the entry at all.
   * If using the asterisk wildcard ('*') as the qualifier key, intents may contain additional entries which are ignored by this provider.
   */
  qualifier?: Qualifier;
  /**
   * Specifies if this is an application private capability and not part of the aplication's public API.
   * If private (or if not specified), other applications cannot issue an intent to this capability.
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
 * An intent is the message that is passed to interact with functionality available in the system. An application must
 * declare all its intents in the application manifest in the form of intentions. Otherwise, intents are rejected when
 * issued. The enforced declaration allows to analyze which components depend on which functionality in the system.
 *
 * An intention or intent is formulated in an abstract way and consists of a type and an optional qualifier. When a
 * component intends to use some functionality, it issues a respective intent.
 *
 * Intent-based communication enables loose coupling between components. This can also be achieved with topic-based communication.
 * In contrast to topics, however, intents require the prior declaration of both sides. In addition, it allows the flexible
 * composition of web content by looking up available system functionality from the manifests.
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
   * If an asterisk wildcard ('*') is used as value for a qualifier entry, then this intention matches intents which have such an entry
   * regardless of their value. An even more lenient option is the optional wildcard ('?') which does not require the entry at all.
   * If using the asterisk wildcard ('*') as the qualifier key, the intention also matches intents which contain additional entries.
   */
  qualifier?: Qualifier;
  /**
   * Metadata about this intention (read-only, exclusively managed by the platform).
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
    /**
     * This field is only set for implicit intentions and allows to infer the capability provider.
     *
     * When providing a capability, the platform automatically declares an implicit intention for the providing application,
     * allowing the application to invoke its self-provided capabilities without prior intention declaration.
     */
    implicitlyProvidedBy?: string;
  };
}

/**
 * Token to determine if this app instance is running as the platform host.
 */
export abstract class IS_PLATFORM_HOST { // tslint:disable-line:class-name
}
