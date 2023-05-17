/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans, PreDestroy} from '@scion/toolkit/bean-manager';
import {merge, MonoTypeOperatorFunction, Observable, OperatorFunction, pipe, Subject, Subscription, take} from 'rxjs';
import {WorkbenchViewCapability} from './workbench-view-capability';
import {ManifestService, mapToBody, Message, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {distinctUntilChanged, filter, map, mergeMap, shareReplay, skip, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ɵMicrofrontendRouteParams} from '../routing/workbench-router';
import {Observables} from '@scion/toolkit/util';
import {ViewClosingEvent, ViewClosingListener, ViewSnapshot, WorkbenchView} from './workbench-view';
import {decorateObservable} from '../observable-decorator';

export class ɵWorkbenchView implements WorkbenchView, PreDestroy {

  private _propertyChange$ = new Subject<'title' | 'heading' | 'dirty' | 'closable'>();
  private _destroy$ = new Subject<void>();
  /**
   * Observable that emits when the application loaded into the current view receives an unloading event,
   * i.e., is just about to be replaced by a microfrontend of another application.
   */
  private _beforeUnload$: Observable<void>;
  /**
   * Observable that emits before navigating to a different microfrontend of the same app.
   */
  private _beforeInAppNavigation$ = new Subject<void>();
  private _closingListeners = new Set<ViewClosingListener>();
  private _closingSubscription: Subscription | undefined;

  public active$: Observable<boolean>;
  public params$: Observable<ReadonlyMap<string, any>>;
  public capability$: Observable<WorkbenchViewCapability>;
  public whenInitialParams: Promise<void>;
  public snapshot: ViewSnapshot = {
    params: new Map<string, any>(),
  };

  constructor(public id: string) {
    this._beforeUnload$ = Beans.get(MessageClient).observe$<void>(ɵWorkbenchCommands.viewUnloadingTopic(this.id))
      .pipe(map(() => undefined));

    this.params$ = Beans.get(MessageClient).observe$<Map<string, any>>(ɵWorkbenchCommands.viewParamsTopic(this.id))
      .pipe(
        mapToBody(),
        coerceMap(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
        takeUntil(merge(this._beforeUnload$, this._destroy$)),
      );

    this.capability$ = this.params$
      .pipe(
        map(params => params.get(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID)),
        lookupViewCapabilityAndShareReplay(),
        decorateObservable(),
        takeUntil(this._beforeUnload$),
      );

    this.active$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.viewActiveTopic(this.id))
      .pipe(
        mapToBody(),
        distinctUntilChanged(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
        takeUntil(this._beforeUnload$),
      );

    // Notify when received initial params.
    this.whenInitialParams = new Promise(resolve => this.params$.pipe(take(1)).subscribe(() => resolve()));
    // Update params snapshot when params change.
    this.params$.subscribe(params => this.snapshot.params = new Map(params));
    // Detect navigation to a different view capability of the same app.
    this.capability$
      .pipe(
        skip(1), // skip the initial navigation
        takeUntil(merge(this._beforeUnload$, this._destroy$)),
      )
      .subscribe(() => {
        this._beforeInAppNavigation$.next();
        this._closingListeners.clear();
        this._closingSubscription?.unsubscribe();
      });
  }

  /**
   * @inheritDoc
   */
  public setTitle(title: string | Observable<string>): void {
    this._propertyChange$.next('title');

    Observables.coerce(title)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewTitleTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'title')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /**
   * @inheritDoc
   */
  public setHeading(heading: string | Observable<string>): void {
    this._propertyChange$.next('heading');

    Observables.coerce(heading)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewHeadingTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'heading')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /**
   * @inheritDoc
   */
  public markDirty(dirty: undefined | boolean | Observable<boolean>): void {
    this._propertyChange$.next('dirty');

    Observables.coerce(dirty ?? true)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewDirtyTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'dirty')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /**
   * @inheritDoc
   */
  public setClosable(closable: boolean | Observable<boolean>): void {
    this._propertyChange$.next('closable');

    Observables.coerce(closable)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewClosableTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'closable')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /**
   * @inheritDoc
   */
  public close(): void {
    Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewCloseTopic(this.id));
  }

  /**
   * @inheritDoc
   */
  public addClosingListener(listener: ViewClosingListener): void {
    if (!this._closingListeners.has(listener) && this._closingListeners.add(listener).size === 1) {
      // Subscribe to the closing event lazily when registering the first listener, so that the workbench only has to ask for a
      // closing confirmation if a listener is actually installed.
      this._closingSubscription = this.installClosingHandler();
    }
  }

  /**
   * @inheritDoc
   */
  public removeClosingListener(listener: ViewClosingListener): void {
    if (this._closingListeners.delete(listener) && this._closingListeners.size === 0) {
      this._closingSubscription?.unsubscribe();
      this._closingSubscription = undefined;
    }
  }

  /**
   * Installs a handler to be invoked by the workbench before closing this view.
   */
  private installClosingHandler(): Subscription {
    return Beans.get(MessageClient).observe$(ɵWorkbenchCommands.viewClosingTopic(this.id))
      .pipe(
        switchMap(async (closeRequest: Message) => {
          // Do not move the publishing of the response to a subsequent handler, because the subscription gets canceled when the last closing listener unsubscribes.
          // See {@link removeClosingListener}. For example, if the listener unsubscribes immediately after handled prevention, subsequent handlers of this Observable
          // chain would not be called, and neither would the subscribe handler.
          const preventViewClosing = await this.isViewClosingPrevented();
          const replyTo = closeRequest.headers.get(MessageHeaders.ReplyTo);
          await Beans.get(MessageClient).publish(replyTo, !preventViewClosing, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
        }),
        takeUntil(merge(this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /**
   * Lets registered listeners prevent this view from closing.
   *
   * @return Promise that resolves to `true` if at least one listener prevents closing, or that resolves to `false` otherwise.
   */
  private async isViewClosingPrevented(): Promise<boolean> {
    for (const listener of this._closingListeners) {
      const event = new ViewClosingEvent();
      await listener.onClosing(event);
      if (event.isDefaultPrevented()) {
        return true;
      }
    }
    return false;
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Context key to retrieve the view ID for microfrontends embedded in the context of a workbench view.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 * @see {@link ContextService}
 */
export const ɵVIEW_ID_CONTEXT_KEY = 'ɵworkbench.view.id';

/**
 * Coerces the given Map-like object to a `Map`.
 *
 * Data sent from one JavaScript realm to another is serialized with the structured clone algorithm.
 * Altought the algorithm supports the `Map` data type, a deserialized map object cannot be checked to be instance of `Map`.
 * This is most likely because the serialization takes place in a different realm.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @see http://man.hubwiz.com/docset/JavaScript.docset/Contents/Resources/Documents/developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm.html
 *
 * @ignore
 */
function coerceMap<K, V>(): MonoTypeOperatorFunction<Map<K, V>> {
  return map(mapLike => new Map(mapLike));
}

/**
 * Looks up the corresponding view capability for each capability id emitted by the source Observable.
 *
 * For new subscribers, the most recently looked up capability is replayed. It is guaranteed that no stale capability
 * is replayed, that is, that the replayed capability always corresponds to the most recent emitted capability id of
 * the source Observable.
 */
function lookupViewCapabilityAndShareReplay(): OperatorFunction<string, WorkbenchViewCapability> {
  let latestViewCapabilityId: string;

  return pipe(
    distinctUntilChanged(),
    tap(viewCapabilityId => latestViewCapabilityId = viewCapabilityId),
    switchMap(viewCapabilityId => Beans.get(ManifestService).lookupCapabilities$<WorkbenchViewCapability>({id: viewCapabilityId})), // async call; long-living
    map(viewCapabilities => viewCapabilities[0]),
    // Replay the latest looked up capability for new subscribers.
    shareReplay({refCount: false, bufferSize: 1}),
    // Ensure not to replay a stale capability upon the subscription of new subscribers. For this reason, we install a filter to filter them out.
    // The 'shareReplay' operator would replay a stale capability if the source has emitted a new capability id, but the lookup for it did not complete yet.
    filter(viewCapability => latestViewCapabilityId === viewCapability.metadata!.id),
  );
}
