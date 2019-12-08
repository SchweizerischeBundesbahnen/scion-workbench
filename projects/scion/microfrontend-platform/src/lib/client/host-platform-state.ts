import { noop, Observable } from 'rxjs';
import { filter, map, shareReplay, take } from 'rxjs/operators';
import { PlatformTopics } from '../ɵmessaging.model';
import { PlatformStates } from '../platform-state';
import { TopicMessage } from '../messaging.model';
import { MessageClient } from './message-client';
import { Beans } from '../bean-manager';
import { PlatformMessageClient } from '../host/platform-message-client';

/**
 * Allows observing the state of the host platform.
 */
export class HostPlatformState {

  private _state$: Observable<PlatformStates>;

  constructor() {
    const messageClient = Beans.get(PlatformMessageClient, {orElseSupply: (): MessageClient => Beans.get(MessageClient)});
    this._state$ = messageClient.observe$(PlatformTopics.HostPlatformState)
      .pipe(
        map((message: TopicMessage<PlatformStates>) => message.payload),
        shareReplay(1),
      );
  }

  /**
   * Returns a Promise that resolves when the host app started. If already started, the promise resolves immediately.
   */
  public whenStarted(): Promise<void> {
    return this._state$
      .pipe(filter(it => it === PlatformStates.Started), take(1))
      .toPromise()
      .then(state => state ? Promise.resolve() : new Promise(noop)); // {@link Observable.toPromise} resolves to `undefined` if not emitted a value and the stream completes, e.g. on shutdown. Then, never resolve the promise.
  }
}
