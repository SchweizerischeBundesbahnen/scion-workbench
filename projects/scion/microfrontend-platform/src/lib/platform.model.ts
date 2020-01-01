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
  intents: Intent[];
  /**
   * Functionality which the application provides.
   */
  capabilities: Capability[];
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
 * Metadata about an application.
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
}

/**
 * Represents a capability which an application provides.
 */
export interface Capability {
  /**
   * Type of functionality which this capability represents.
   */
  type: string;
  /**
   * Dictionary of key-value pairs to qualify this capability (optional).
   */
  qualifier?: Qualifier;
  /**
   * Specifies if this is an application private capability and not part of the public API.
   * If private (or if not specified), other applications cannot use this capability.
   */
  private?: boolean;
  /**
   * Description of this capability, if any.
   */
  description?: string;
  /**
   * Capability specific properties, if any.
   */
  properties?: {
    [key: string]: any;
  };
  /**
   * Metadata about the capability provider (read-only, exclusively managed by the platform).
   */
  metadata?: {
    /**
     * Identifier of this capability.
     */
    id: string;
    /**
     * Symbolic name of the application which provides this capability.
     */
    symbolicAppName: string;
  };
}

/**
 * Represents an intent which an application declares.
 */
export interface Intent {
  /**
   * Type of functionality which this intent represents.
   */
  type: string;
  /**
   * Dictionary of key-value pairs to express this intent (optional).
   */
  qualifier?: Qualifier;
  /**
   * Metadata about this intent (read-only, exclusively managed by the platform).
   */
  metadata?: {
    /**
     * Identifier of this intent.
     */
    id: string;
    /**
     * Symbolic name of the application which manifests this intent.
     */
    symbolicAppName: string;
    /**
     * Indicates if this is an implicit intent because the application provides the capability itself.
     */
    implicit: boolean;
  };
}

/**
 * Token to determine if this app instance is running as the platform host.
 */
export abstract class IS_PLATFORM_HOST { // tslint:disable-line:class-name
}
