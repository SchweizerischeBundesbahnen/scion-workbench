/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { from, fromEvent, noop, Observable, of, Subject, throwError } from 'rxjs';
import { MessageEnvelope, MessagingChannel, MessagingTransport, PlatformTopics } from '../ɵmessaging.model';
import { first, map, mergeMap, share, switchMap, take, takeUntil, timeoutWith } from 'rxjs/operators';
import { filterByOrigin, filterByTopic, filterByTransport, pluckEnvelope } from '../operators';
import { UUID } from '@scion/toolkit/util';
import { MessageHeaders, TopicMessage } from '../messaging.model';
import { GatewayInfoResponse, getGatewayJavaScript } from './broker-gateway-script';
import { Beans } from '../bean-manager';
import { Logger } from '../logger';

/**
 * The gateway is responsible for dispatching messages between the client and the broker.
 *
 * The gateway is always between one client and the broker. Clients never connect to the broker or to each other directly.
 * The gateway operates on a dedicated {@link Window} instance. To initiate a connection, the gateway sends a CONNECT message
 * to the current and all its parent windows. When the broker receives a CONNECT message of a trusted client, the broker responds
 * with a CONNACK message and a status code. If no CONNACK message is received within some timeout, publishing messages is rejected
 * and no messages are received.
 *
 * When the gateway is disposed, it sends a DISCONNECT message to the broker.
 */
export class BrokerGateway {

  private _destroy$ = new Subject<void>();
  private _whenDestroy = this._destroy$.pipe(first()).toPromise();
  private _message$: Observable<MessageEnvelope>;
  private _whenGatewayInfo: Promise<GatewayInfo>;

  constructor(private _clientAppName: string, private _config: { discoveryTimeout: number }) {
    // Get the JavaScript to discover the message broker and dispatch messages.
    const gatewayJavaScript = getGatewayJavaScript({clientAppName: this._clientAppName, clientOrigin: window.origin, discoverTimeout: this._config.discoveryTimeout});
    // Create a hidden iframe and load the gateway script.
    const whenGatewayWindow = this.mountIframeAndLoadScript(gatewayJavaScript);
    // Wait until receiving info about the gateway.
    this._whenGatewayInfo = whenGatewayWindow.then(gatewayWindow => this.requestGatewayInfo(gatewayWindow));
    // Subscribe for broker messages sent to the gateway window.
    this._message$ = from(this._whenGatewayInfo.catch(() => NEVER_PROMISE)) // avoid uncaught promise error
      .pipe(
        switchMap(gateway => fromEvent<MessageEvent>(gateway.window, 'message').pipe(filterByOrigin(gateway.brokerOrigin))),
        filterByTransport(MessagingTransport.BrokerToClient),
        pluckEnvelope(),
        takeUntil(this._destroy$), // no longer emit messages when destroyed
        share(),
      );
  }

  /**
   * Posts a message to the message broker. The message is buffered until broker discovery completed and connected to the broker.
   *
   * @return a Promise that resolves when the message is dispatched to the broker, or that rejects if not connected to the broker.
   */
  public postMessage(envelope: MessageEnvelope): Promise<void> {
    return this._whenGatewayInfo.then(gateway => {
      this.setSenderMessageHeaders(envelope, gateway.clientId);
      gateway.window.postMessage(envelope, gateway.window.origin);
    });
  }

  /**
   * An Observable that emits when a message from the message broker is received.
   */
  public get message$(): Observable<MessageEnvelope> {
    return this._message$;
  }

  /**
   * Mounts a hidden iframe and loads the given JavaScript.
   *
   * @return A Promise that resolves to the content window of the iframe.
   */
  private mountIframeAndLoadScript(javaScript: string): Promise<Window> {
    const html = `<html><head><script>${javaScript}</script></head><body>Message Broker Gateway for '${this._clientAppName}'</body></html>`;
    const iframeUrl = URL.createObjectURL(new Blob([html], {type: 'text/html'}));
    const iframe = document.body.appendChild(document.createElement('iframe'));
    iframe.setAttribute('src', iframeUrl);

    // Take the iframe out of the document flow and hide it.
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.pointerEvents = 'none';

    // Add a destroy listener to unmount the iframe and revoke the object URL.
    this._whenDestroy.then(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(iframeUrl);
    });

    // Resolve to the content window of the iframe.
    return fromEvent(iframe, 'load')
      .pipe(
        map(() => iframe.contentWindow),
        take(1),
        takeUntil(this._destroy$),
      )
      .toPromise()
      .then(neverResolveIfUndefined);
  }

  /**
   * Sends a request to the gateway to query information about the gateway and the broker.
   *
   * @return A Promise that resolves to information about the gateway and the broker, or rejects
   *         if not receiving information within the configured timeout.
   */
  private requestGatewayInfo(gatewayWindow: Window): Promise<GatewayInfo> {
    const replyToTopic = UUID.randomUUID();
    const request: MessageEnvelope<TopicMessage> = {
      transport: MessagingTransport.ClientToGateway,
      channel: MessagingChannel.Topic,
      messageId: UUID.randomUUID(),
      message: {
        topic: PlatformTopics.RequestGatewayInfo,
        headers: new Map().set(MessageHeaders.ReplyTo, replyToTopic),
      },
    };

    const whenReply: Promise<GatewayInfo> = fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filterByOrigin(gatewayWindow.origin),
        filterByTransport(MessagingTransport.GatewayToClient),
        pluckEnvelope(),
        filterByTopic<GatewayInfoResponse>(replyToTopic),
        mergeMap((reply: TopicMessage<GatewayInfoResponse>): Observable<GatewayInfo> => {
          const response: GatewayInfoResponse = reply.body;
          return response.ok ? of({clientId: response.clientId, window: gatewayWindow, brokerOrigin: response.brokerOrigin}) : throwError(response.error);
        }),
        take(1),
        timeoutWith(new Date(Date.now() + this._config.discoveryTimeout), throwError(`[BrokerDiscoverTimeoutError] Message broker not discovered within the ${this._config.discoveryTimeout}ms timeout. Messages cannot be published or received.`)),
        takeUntil(this._destroy$),
      )
      .toPromise()
      .catch(error => {
        Beans.get(Logger).error(error);
        throw error;
      });

    this.setSenderMessageHeaders(request);
    gatewayWindow.postMessage(request, gatewayWindow.origin);
    return whenReply.then(neverResolveIfUndefined);
  }

  /**
   * Adds headers to the message to identify the sending app.
   */
  private setSenderMessageHeaders(envelope: MessageEnvelope, clientId?: string): void {
    const headers = envelope.message.headers;

    headers.set(MessageHeaders.Timestamp, Date.now());
    headers.set(MessageHeaders.AppSymbolicName, this._clientAppName);
    clientId && headers.set(MessageHeaders.ClientId, clientId);
  }

  public destroy(): void {
    this._destroy$.next();
  }
}

/**
 * Information about the gateway and the broker.
 */
export interface GatewayInfo {
  window: Window;
  brokerOrigin: string;
  clientId: string;
}

/**
 * Returns a Promise that never resolves if the given value is `undefined`.
 *
 * For instance, if creating a Promise from an Observable, the Promise resolves to `undefined`
 * if the Observable did not emit a value before its completion, e.g., on shutdown.
 */
function neverResolveIfUndefined<T>(value: T): Promise<T> {
  return value !== undefined ? Promise.resolve(value) : NEVER_PROMISE;
}

/**
 * Promise which never resolves.
 */
const NEVER_PROMISE = new Promise<never>(noop);
