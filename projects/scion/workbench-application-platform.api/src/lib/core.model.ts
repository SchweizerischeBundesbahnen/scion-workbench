/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Built in capability types.
 */
export enum PlatformCapabilityTypes {
  /**
   * Opens an application page as a workbench view.
   */
  View = 'view',
  /**
   * Shows an application page in a popup.
   */
  Popup = 'popup',
  /**
   * Shows an application page as a workbench activity.
   */
  Activity = 'activity',
  /**
   * Displays a message box.
   */
  MessageBox = 'messagebox',
  /**
   * Shows a notification.
   */
  Notification = 'notification',
  /**
   * Allows querying the manifest registry.
   */
  ManifestRegistry = 'manifest-registry',
}

/**
 * Represents a dictionary of key-value pairs to match a provider or intent.
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

export type Severity = 'info' | 'warn' | 'error';

/**
 * Metadata about an application.
 */
export interface Application {
  /**
   * Unique symbolic name of the application.
   */
  symbolicName: string;
  /**
   * Name of the application.
   */
  name: string;
  /**
   * URL to the application root.
   */
  baseUrl: string;
  /**
   * URL to the application manifest. Is not set for the host application.
   */
  manifestUrl?: string;
  /**
   * Indicates whether or not capability scope check is disabled for this application.
   *
   * With scope check disabled, the application can invoke private capabilities of other applications.
   *
   * By default, scope check is enabled, and should only be enabled for system applications like `DevTools`.
   */
  scopeCheckDisabled: boolean;
}

/**
 * Represents some capability which an application provides.
 *
 * Applications consuming a capability must specify a respective intent that fulfills the capability qualifier.
 */
export interface Capability {
  /**
   * Specifies the type of functionality which this capability represents, e.g. 'view' if providing a view.
   */
  type: string;
  /**
   * Optional qualifiers which this capability requires for intents to have.
   */
  qualifier?: Qualifier;
  /**
   * Specifies if this is an application private capability and not part of the public API.
   * If private (or if not specified), other applications cannot use this capability.
   */
  private?: boolean;
  /**
   * Optional description of this capability.
   */
  description?: string;
  /**
   * Optional capability specific properties.
   */
  properties?: {
    [key: string]: any;
  };
  /**
   * Metadata about the implementor providing this capability (read-only, exclusively managed by the platform).
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
    /**
     * Indicates if the capability implementor acts as a proxy through which intents are processed.
     *
     * For example, `ViewIntentHandler` is a proxy for application view capabilities which
     * reads config from registered view capability providers and dispatches intents to the Angular router.
     */
    proxy: boolean;
  };
}

/**
 * Represents some capability which an application intends to use.
 *
 * This may be a built-in workbench functionality like showing a message box or notification,
 * or some functionality provided by some application, or an intent handler registered in the host application.
 */
export interface Intent {
  /**
   * Specifies the type of functionality to use, e.g. 'view' to open a view.
   */
  type: string;

  /**
   * Optional qualifiers to identify the capability to use.
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
 * Declares the channels used to communicate via message bus or between the host outlet and its application.
 *
 * The following channels are supported:
 *
 * host:       To communicate between the host outlet and its application, and vice versa. Messages with this channel are not dispatched by the message bus.
 *             {HostMessage}
 *
 * intent:     To post or receive application intents
 *             {IntentMessage}
 *
 * capability: To post or receive messages from capability providers
 *             {CapabilityProviderMessage}
 *
 * reply:      To reply to a message
 */
export type Channel = 'host' | 'intent' | 'capability' | 'reply';

/**
 * Envelope for all messages sent over the message bus.
 */
export interface MessageEnvelope<Message = IntentMessage | CapabilityProviderMessage | HostMessage | any> {
  /**
   * Used to check if a message originates from the workbench application platform (if set to 'sci://workbench-application-platform')
   *
   * The protocol is set by the message bus.
   */
  protocol?: string;

  /**
   * The channel to dispatch this message.
   */
  channel: Channel;

  /**
   * The message to be transported.
   */
  message?: Message;

  /**
   * A unique identifier used in 'request-reply' communication to reply to this message.
   *
   * It is set by the sending application, if it expects the message receiver to reply, or is empty otherwise.
   * The replying application includes it in the respective reply message.
   */
  replyToUid?: string;

  /**
   * Used in 'request-reply' communication when replying to a message.
   * Specifies the application to receive the reply (symbolic app name).
   */
  replyTo?: string;

  /**
   * Identifies the sending application of a message (symbolic app name)
   */
  sender?: string;

  /**
   * Component injector of the outlet which hosts the application this message originates from.
   *
   * @transient
   * @internal
   */
  _injector?: any;

  /**
   * Component bounding box of the outlet which hosts the application this message originates from.
   *
   * @transient
   * @internal
   */
  _outletBoundingBox?: ClientRect;
}

/**
 * Represents a message posted by an application which provides some capability.
 *
 * It is dispatched to all applications which registered a respective intent that fulfills the capability qualifiers.
 * If the capability has private visibility, which is by default, it is only dispatched within the application itself.
 */
export interface CapabilityProviderMessage {
  type: string;
  qualifier: Qualifier;
  payload?: any;
}

/**
 * Represens a private message between the host outlet and the application which it shows.
 */
export interface HostMessage {
  type: string;
  payload?: any;
}

/**
 * Represents an application intent.
 *
 * It is posted by an application, which intends to interact with a respective capability that fulfills the indent's qualifier.
 */
export interface IntentMessage {
  type: string;
  qualifier: Qualifier;
  payload?: any;
}

/**
 * Specifies the protocol used for workbench application platform communication.
 */
export const PROTOCOL = 'sci://workbench-application-platform';

/**
 * Tests if data is a {MessageEnvelope} sent by workbench application platform or workbench application.
 *
 * Returns {MessageEnvelope} or {null} if not a valid message envelope.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#Security_concerns
 */
export function parseMessageEnvelopeElseNull(data: any): MessageEnvelope | null {
  if (isNullOrUndefined(data) || typeof data !== 'object') {
    return null;
  }
  if (data.protocol !== PROTOCOL) {
    return null;
  }
  if (isNullOrUndefined(data.channel)) {
    return null;
  }
  return data;
}

function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}
