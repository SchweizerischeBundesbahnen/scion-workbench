/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ConnackMessage, MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics } from '../ɵmessaging.model';
import { MessageHeaders, TopicMessage } from '../messaging.model';

/**
 * Returns the JavaScript for the gateway to connect to the message broker.
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
         ClientConnect: '${PlatformTopics.ClientConnect}',
         ClientDisconnect: '${PlatformTopics.ClientDisconnect}',
         GatewayInfoRequest: '${PlatformTopics.RequestGatewayInfo}',
       },
       headers: {
         ReplyTo: '${MessageHeaders.ReplyTo}',
         ClientId: '${MessageHeaders.ClientId}',
         AppSymbolicName: '${MessageHeaders.AppSymbolicName}',
       }
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
  const whenConnected = discoverBrokerAndConnect();

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
      whenConnected
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

      const replyTo = requestEnvelope.message.headers.get(constants.headers.ReplyTo);
      whenConnected
        .then(broker => {
          const reply = newReply(replyTo, {ok: true, clientId: broker.clientId, brokerOrigin: broker.origin});
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
          body: response,
          headers: new Map()
            .set(constants.headers.ClientId, response.clientId)
            .set(constants.headers.AppSymbolicName, config.clientAppName),
        },
      };
    }
  }

  /**
   * Initiates broker discovery by sending a broker connect request to the parent windows.
   *
   * @return A Promise function that resolves to the message broker, or that rejects if discovery failed.
   */
  function discoverBrokerAndConnect(): Promise<BrokerInfo> {
    const replyTo = randomUUID();
    const disposables: (() => void)[] = [];

    const connectPromise = new Promise<BrokerInfo>((resolve, reject) => { // tslint:disable-line:typedef
      onSuccessResolve(resolve, reject);
      onTimeoutReject(reject);
    });
    connectPromise
      .then(() => disposables.forEach(fn => fn()))
      .catch(() => disposables.forEach(fn => fn()));

    const connectMessage: MessageEnvelope<TopicMessage<void>> = {
      messageId: randomUUID(),
      transport: constants.transports.GatewayToBroker,
      channel: constants.channels.Topic,
      message: {
        topic: constants.topics.ClientConnect,
        headers: new Map()
          .set(constants.headers.AppSymbolicName, config.clientAppName)
          .set(constants.headers.ReplyTo, replyTo),
      },
    };

    findBrokerWindowCandidates().forEach(candidate => candidate.postMessage(connectMessage, '*'));
    return connectPromise;

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

        const envelope: MessageEnvelope<TopicMessage<ConnackMessage>> = event.data;
        const response = envelope.message.body;
        if (response.returnCode === 'accepted') {
          resolve({clientId: response.clientId, window: event.source as Window, origin: event.origin});
        }
        else {
          reject(`${response.returnMessage} [code: '${response.returnCode}']`);
        }
      };
      window.addEventListener('message', onmessage);
      disposables.push((): void => window.removeEventListener('message', onmessage));
    }

    /**
     * Rejects the Promise when the broker does not acknowledge within the given timeout.
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
    whenUnload.then(() => whenConnected)
      .then(broker => {
        const clientDisposeMessage: MessageEnvelope<TopicMessage<void>> = {
          messageId: randomUUID(),
          transport: constants.transports.GatewayToBroker,
          channel: constants.channels.Topic,
          message: {
            topic: constants.topics.ClientDisconnect,
            headers: new Map()
              .set(constants.headers.ClientId, broker.clientId)
              .set(constants.headers.AppSymbolicName, config.clientAppName),
          },
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
  clientId?: string;
}

/**
 * Information about the broker.
 */
interface BrokerInfo {
  clientId: string;
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
    ClientConnect: string,
    ClientDisconnect: string,
    GatewayInfoRequest: string,
  };
  headers: {
    ReplyTo: string,
    ClientId: string,
    AppSymbolicName: string,
  };
}
