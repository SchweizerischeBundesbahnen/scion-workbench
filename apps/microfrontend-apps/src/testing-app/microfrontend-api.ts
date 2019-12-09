import { Capability, Intent } from '@scion/microfrontend-platform';

/**
 * Defines topics used in messaging app.
 */
export enum Topics {
  /**
   * Allows observing applications installed in the platform.
   *
   * Messages published to this topic are retained, so that observers receive the applications immediately after they subscribe.
   *
   * Message: array of {@link Application} objects
   */
  Applications = 'applications',
  /**
   * Request-Reply topic to query capabilities of an application.
   *
   * Replies with an array of {@link Capability} objects of the requesting application.
   */
  Capabilities = 'capabilities',
  /**
   * Request-Reply topic to query intents of an application.
   *
   * Replies with an array of {@link Intent} objects of the requesting application.
   */
  Intents = 'intents',
  /**
   * Topic to register a capability.
   *
   * Expects a {@link CapabilityRegisterCommand} object to be provided as request body.
   */
  RegisterCapability = 'register-capability',
  /**
   * Topic to unregister a capability.
   *
   * Expects a {@link CapabilityUnregisterCommand} object to be provided as request body.
   */
  UnregisterCapability = 'unregister-capability',
  /**
   * Topic to register an intent.
   *
   * Expects a {@link IntentRegisterCommand} object to be provided as request body.
   */
  RegisterIntent = 'register-intent',
  /**
   * Topic to unregister an intent.
   *
   * Expects a {@link IntentUnregisterCommand} object to be provided as request body.
   */
  UnregisterIntent = 'unregister-intent',
}

export interface CapabilityRegisterCommand {
  capability: Capability;
}

export interface CapabilityUnregisterCommand {
  capabilityId: string;
}

export interface IntentRegisterCommand {
  intent: Intent;
}

export interface IntentUnregisterCommand {
  intentId: string;
}
