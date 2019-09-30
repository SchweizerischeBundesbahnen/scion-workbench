import { fromEvent, merge, Subject, timer } from 'rxjs';
import { Defined, UUID } from '@scion/toolkit/util';
import { TopicMessage } from '../messaging.model';
import { ClientConnectCommand, MessageDeliveryStatus, MessageEnvelope, MessagingChannel, MessagingTransport } from '../ɵmessaging.model';
import { first, takeUntil } from 'rxjs/operators';
import { filterByTransport, filterEnvelope } from './operators';
import { Beans } from '../bean-manager';
import { MicrofrontendPlatformState, PlatformStates } from '../microfrontend-platform-state';
import { ClientConfig } from './client-config';

/**
 * Connects this client to the message broker.
 */
export class BrokerConnector {

  private _disconnect$ = new Subject<void>();

  /**
   * Promise which resolves to the broker when connected to the broker.
   */
  private _whenBroker: Promise<BrokerWindowRef>;

  constructor(private _clientConfig: ClientConfig) {
    this._whenBroker = new Promise<BrokerWindowRef>((resolve: (broker: BrokerWindowRef) => void, reject: (error: any) => void): void => {
      const connectMessageUid = UUID.randomUUID();

      const connectTimeout$ = new Subject<void>();
      const connectStatusReceived$ = new Subject<void>();

      // Subscribe for the broker connect response.
      fromEvent<MessageEvent>(window, 'message')
        .pipe(
          filterByTransport(MessagingTransport.BrokerToClient),
          filterEnvelope<TopicMessage>(envelope => envelope.channel === MessagingChannel.Topic && envelope.message.topic === connectMessageUid),
          first(),
          takeUntil(merge(connectTimeout$, this._disconnect$)),
        )
        .subscribe((event: MessageEvent) => {
          connectStatusReceived$.next();

          const envelope: MessageEnvelope<TopicMessage<MessageDeliveryStatus>> = event.data;
          const deliveryStatus = envelope.message.payload;
          if (deliveryStatus.success) {
            resolve({window: event.source as Window, origin: event.origin});
          }
          else {
            reject(`[MessageClientConnectError] Failed to connect to the message broker. ${deliveryStatus.details}`);
          }
        });

      // Wait with connecting to the broker until the platform is started.
      // For example, in the 'host-app', the broker must first be constructed to accept connect-requests of 'host-app' message clients.
      Beans.get(MicrofrontendPlatformState).whenState(PlatformStates.Started).then(() => {
        // Cancel the connect request after the connect attempt times out.
        const connectTimeout = Defined.orElse(this._clientConfig.messaging && this._clientConfig.messaging.connectTimeout, 10000);
        timer(connectTimeout)
          .pipe(takeUntil(merge(connectStatusReceived$, this._disconnect$)))
          .subscribe(() => {
            reject(`[MessageClientConnectError] Failed to connect to the message broker because not responding within ${connectTimeout}ms.`);
            connectTimeout$.next();
          });

        // Connect to the broker by sending a connect request to every parent window.
        const connectRequest: MessageEnvelope<ClientConnectCommand> = {
          messageId: connectMessageUid,
          transport: MessagingTransport.ClientToBroker,
          channel: MessagingChannel.ClientConnect,
          message: {symbolicAppName: this._clientConfig.symbolicName},
        };
        brokerWindowCandidates().forEach(candidate => candidate.postMessage(connectRequest, '*'));
      });
    });
  }

  /**
   * Returns a promise that resolves to the {@link BrokerWindowRef} once connected successfully to the message broker.
   */
  public get whenConnected(): Promise<BrokerWindowRef> {
    return this._whenBroker;
  }

  /**
   * Disconnects this client from the message broker. Has no effect if already disconnected.
   */
  public disconnect(): Promise<void> {
    this._disconnect$.next();

    if (!this._whenBroker) {
      return Promise.resolve();
    }

    const disconnectRequest: MessageEnvelope = {
      messageId: UUID.randomUUID(),
      transport: MessagingTransport.ClientToBroker,
      channel: MessagingChannel.ClientDisconnect,
    };

    return this._whenBroker.then(broker => {
      broker.window.postMessage(disconnectRequest, broker.origin);
      this._whenBroker = null;
      return Promise.resolve();
    });
  }
}

/**
 * Reference to the broker window to communicate with the broker.
 */
export interface BrokerWindowRef {
  /**
   * The browser window in which the application instance is running.
   */
  window: Window;
  /**
   * The origin of the application where the broker is running.
   */
  origin: string;
}

/**
 * Returns the current window and all its parent windows which all are potential broker candidates.
 */
function brokerWindowCandidates(): Window[] {
  const candidates: Window[] = [window];

  for (let windowParent = window.parent; windowParent !== window.top; windowParent = windowParent.parent) {
    candidates.unshift(windowParent);
  }

  if (window !== window.top) {
    candidates.unshift(window.top);
  }

  return candidates;
}
