/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { BrokerDiscoverCommand, MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics } from '../ɵmessaging.model';
import { TopicMessage } from '../messaging.model';

/**
 * Returns the JavaScript for the gateway to discover the message broker.
 */
export function getGatewayJavaScript(config: GatewayConfig): string {
  // Create an IIFE (Immediately Invoked Function Expression) which invokes the transpiled 'initGateway' function.
  return `
   (function () {
     var config = {
       clientAppName: '${config.clientAppName}',
       clientOrigin: '${config.clientOrigin}',
       discoverTimeout: ${config.discoverTimeout}
     };
     var constants = {
       transports: {
         ClientToBroker: '${MessagingTransport.ClientToBroker}',
         ClientToGateway: '${MessagingTransport.ClientToGateway}',
         GatewayToClient: '${MessagingTransport.GatewayToClient}',
         GatewayToBroker: '${MessagingTransport.GatewayToBroker}',
         BrokerToGateway: '${MessagingTransport.BrokerToGateway}',
       },
       channels: {
         Topic: '${MessagingChannel.Topic}',
       },
       topics: {
         BrokerDiscovery: '${PlatformTopics.BrokerDiscovery}',
         ClientDispose: '${PlatformTopics.ClientDispose}',
         GatewayInfoRequest: '${PlatformTopics.GatewayInfoRequest}',
       },
     };

     ${initGateway.name}(config, constants);
     ${initGateway.toString()}
   })();`;
}

/**
 * Note: DO NOT USE CODE FROM OTHER MODULES BECAUSE SOLELY THE 'TO-STRING' REPRESENTATION OF FOLLOWING FUNCTION
 *       IS LOADED INTO THE IFRAME. THE ONLY EXCEPTION ARE REFERENCES TO INTERFACE TYPES AS NOT TRANSPILED INTO
 *       JAVASCRIPT.
 */
function initGateway(config: GatewayConfig, constants: Constants): void {
  const noop = (): void => {
  };
  const whenUnload = createPageUnloadPromise();
  const whenBrokerDiscovered = discoverBroker();

  installClientMessageDispatcher();
  installGatewayInfoRequestReplier();
  installClientDisposeFunction();

  /**
   * Installs a message listener to dispatch messages received from the client to the message broker.
   */
  function installClientMessageDispatcher(): void {
    const onmessage = (event: MessageEvent): void => {
      if (event.origin !== config.clientOrigin) {
        return;
      }
      if (event.data.transport !== constants.transports.ClientToBroker) {
        return;
      }
      whenBrokerDiscovered
        .then(broker => broker.window.postMessage(event.data, broker.origin))
        .catch(noop); // avoid uncaught promise error
    };
    window.addEventListener('message', onmessage);
    whenUnload.then(() => window.removeEventListener('message', onmessage));
  }

  /**
   * Installs a message listener to reply to the gateway info request.
   */
  function installGatewayInfoRequestReplier(): void {
    const onmessage = (event: MessageEvent): void => {
      if (event.origin !== config.clientOrigin) {
        return;
      }
      if (event.data.transport !== constants.transports.ClientToGateway) {
        return;
      }
      if (event.data.channel !== constants.channels.Topic) {
        return;
      }
      if (event.data.message.topic !== constants.topics.GatewayInfoRequest) {
        return;
      }

      // remove the message handler after received the request.
      window.removeEventListener('message', onmessage);

      const requestEnvelope: MessageEnvelope<TopicMessage<void>> = event.data;

      const replyTo = requestEnvelope.message.replyTo;
      whenBrokerDiscovered
        .then(broker => {
          const reply = newReply(replyTo, {ok: true, brokerOrigin: broker.origin});
          (event.source as Window).postMessage(reply, event.origin);
        })
        .catch(error => {
          const reply = newReply(replyTo, {ok: false, error: error});
          (event.source as Window).postMessage(reply, event.origin);
        });
    };

    window.addEventListener('message', onmessage);
    whenUnload.then(() => window.removeEventListener('message', onmessage));

    function newReply(replyTo: string, response: GatewayInfoResponse): MessageEnvelope<TopicMessage<GatewayInfoResponse>> {
      return {
        messageId: randomUUID(),
        transport: constants.transports.GatewayToClient,
        channel: constants.channels.Topic,
        message: {
          topic: replyTo,
          payload: response,
        },
      };
    }
  }

  /**
   * Initiates broker discovery by sending a broker discover request to the parent windows.
   *
   * @return A Promise function that resolves to the message broker, or that rejects if discovery failed.
   */
  function discoverBroker(): Promise<BrokerInfo> {
    const replyTo = randomUUID();
    const disposables: (() => void)[] = [];

    const whenDiscovered = new Promise<BrokerInfo>((resolve, reject) => { // tslint:disable-line:typedef
      onSuccessResolve(resolve, reject);
      onTimeoutReject(reject);
    });
    whenDiscovered
      .then(() => disposables.forEach(fn => fn()))
      .catch(() => disposables.forEach(fn => fn()));

    const brokerDiscoverRequest: MessageEnvelope<TopicMessage<BrokerDiscoverCommand>> = {
      messageId: randomUUID(),
      transport: constants.transports.GatewayToBroker,
      channel: constants.channels.Topic,
      message: {
        topic: constants.topics.BrokerDiscovery,
        replyTo: replyTo,
        payload: {symbolicAppName: config.clientAppName},
      },
    };
    findBrokerWindowCandidates().forEach(candidate => candidate.postMessage(brokerDiscoverRequest, '*'));
    return whenDiscovered;

    function onSuccessResolve(resolve: (brokerInfo: BrokerInfo) => void, reject: (error: string) => void): void {
      const onmessage = (event: MessageEvent): void => {
        if (event.data.transport !== constants.transports.BrokerToGateway) {
          return;
        }
        if (event.data.channel !== constants.channels.Topic) {
          return;
        }
        if (event.data.message.topic !== replyTo) {
          return;
        }

        const envelope: MessageEnvelope<TopicMessage<MessageDeliveryStatus>> = event.data;
        const response = envelope.message.payload;
        if (response.ok) {
          resolve({window: event.source as Window, origin: event.origin});
        }
        else {
          reject(response.details);
        }
      };
      window.addEventListener('message', onmessage);
      disposables.push((): void => window.removeEventListener('message', onmessage));
    }

    /**
     * Rejects the discovery Promise when the broker does not acknowledge within the given timeout.
     */
    function onTimeoutReject(reject: (error: string) => void): void {
      const ontimeout = (): void => {
        reject(`[BrokerDiscoverTimeoutError] Message broker not discovered within the ${config.discoverTimeout}ms timeout. Messages cannot be published or received.`);
      };
      const timeoutHandle = setTimeout(ontimeout, config.discoverTimeout);
      disposables.push((): void => clearTimeout(timeoutHandle));
    }

    function findBrokerWindowCandidates(): Window[] {
      const candidates: Window[] = [];

      for (let windowParent = window.parent; windowParent !== window.top; windowParent = windowParent.parent) {
        candidates.unshift(windowParent);
      }

      candidates.unshift(window.top);
      return candidates;
    }
  }

  function createPageUnloadPromise(): Promise<void> {
    return new Promise<void>(resolve => window.addEventListener('unload', () => resolve(), {once: true})); // tslint:disable-line:typedef
  }

  /**
   * Sends a dispose message to the broker when this window unloads.
   */
  function installClientDisposeFunction(): void {
    whenUnload.then(() => whenBrokerDiscovered)
      .then(broker => {
        const clientDisposeMessage: MessageEnvelope<TopicMessage<void>> = {
          messageId: randomUUID(),
          transport: constants.transports.GatewayToBroker,
          channel: constants.channels.Topic,
          message: {topic: constants.topics.ClientDispose},
        };
        broker.window.postMessage(clientDisposeMessage, broker.origin);
      })
      .catch(noop); // avoid uncaught promise error
  }

  /**
   * Generates a 'pseudo-random' identifier.
   */
  function randomUUID(): string {
    let now = Date.now();
    if (typeof window !== 'undefined' && typeof window.performance !== 'undefined' && typeof window.performance.now === 'function') {
      now += performance.now(); // use high-precision timer if available
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const random = (now + Math.random() * 16) % 16 | 0; // tslint:disable-line:no-bitwise
      now = Math.floor(now / 16);
      return (char === 'x' ? random : (random & 0x3 | 0x8)).toString(16); // tslint:disable-line:no-bitwise
    });
  }
}

/**
 * Instruments the broker gateway.
 */
export interface GatewayConfig {
  clientAppName: string;
  clientOrigin: string;
  discoverTimeout: number;
}

/**
 * Response to a gateway info request.
 */
export interface GatewayInfoResponse {
  ok: boolean;
  error?: any;
  brokerOrigin?: string;
}

/**
 * Information about the broker.
 */
interface BrokerInfo {
  origin: string;
  window: Window;
}

/**
 * Defines constants available in the gateway script.
 */
interface Constants {
  transports: {
    ClientToBroker: MessagingTransport,
    ClientToGateway: MessagingTransport,
    GatewayToClient: MessagingTransport,
    GatewayToBroker: MessagingTransport,
    BrokerToGateway: MessagingTransport,
  };
  channels: {
    Topic: MessagingChannel,
  };
  topics: {
    BrokerDiscovery: string,
    ClientDispose: string,
    GatewayInfoRequest: string,
  };
}
