import { Capability, Intent } from '@scion/microfrontend-platform';

/**
 * Defines topics used in messaging app.
 */
export enum Topics {
  /**
   * Request-Reply topic to query applications.
   *
   * Replies with an array of {@link Application} objects.
   */
  Applications = 'applications',
  /**
   * Request-Reply topic to query capabilities of an application.
   *
   * Expects the 'symbolicAppName' to be provided as request payload.
   * Replies with an array of {@link Capability} objects.
   */
  Capabilities = 'capabilities',
  /**
   * Request-Reply topic to query intents of an application.
   *
   * Expects the 'symbolicAppName' to be provided as request payload.
   * Replies with an array of {@link Intent} objects.
   */
  Intents = 'intents',
  /**
   * Topic to register a capability.
   *
   * Expects a {@link CapabilityRegisterCommand} object to be provided as request payload.
   */
  RegisterCapability = 'register-capability',
  /**
   * Topic to unregister a capability.
   *
   * Expects a {@link CapabilityUnregisterCommand} object to be provided as request payload.
   */
  UnregisterCapability = 'unregister-capability',
  /**
   * Topic to register an intent.
   *
   * Expects a {@link IntentRegisterCommand} object to be provided as request payload.
   */
  RegisterIntent = 'register-intent',
  /**
   * Topic to unregister an intent.
   *
   * Expects a {@link IntentUnregisterCommand} object to be provided as request payload.
   */
  UnregisterIntent = 'unregister-intent',
}

export interface CapabilityRegisterCommand {
  symbolicAppName: string;
  capability: Capability;
}

export interface CapabilityUnregisterCommand {
  symbolicAppName: string;
  capabilityId: string;
}

export interface IntentRegisterCommand {
  symbolicAppName: string;
  intent: Intent;
}

export interface IntentUnregisterCommand {
  symbolicAppName: string;
  intentId: string;
}
