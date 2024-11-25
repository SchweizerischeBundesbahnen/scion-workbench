/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans, PreDestroy} from '@scion/toolkit/bean-manager';
import {combineLatest, firstValueFrom, merge, Observable, OperatorFunction, pipe, Subject, Subscription} from 'rxjs';
import {WorkbenchViewCapability} from './workbench-view-capability';
import {ManifestService, mapToBody, MessageClient, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {distinctUntilChanged, filter, map, mergeMap, shareReplay, skip, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ɵMicrofrontendRouteParams} from '../routing/workbench-router';
import {Observables} from '@scion/toolkit/util';
import {CanClose, CanCloseFn, CanCloseRef, ViewId, ViewSnapshot, WorkbenchView} from './workbench-view';
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
  private _canCloseFn: CanCloseFn | CanClose | undefined;
  private _canCloseSubscription: Subscription | undefined;

  public active$: Observable<boolean>;
  public partId$: Observable<string>;
  public params$: Observable<ReadonlyMap<string, any>>;
  public capability$: Observable<WorkbenchViewCapability>;
  public whenProperties: Promise<void>;
  public snapshot: ViewSnapshot = {
    params: new Map<string, any>(),
    partId: undefined!,
  };

  constructor(public id: ViewId) {
    this._beforeUnload$ = Beans.get(MessageClient).observe$<void>(ɵWorkbenchCommands.viewUnloadingTopic(this.id))
      .pipe(map(() => undefined), shareReplay({refCount: false, bufferSize: 1}));

    this.params$ = Beans.get(MessageClient).observe$<Map<string, any>>(ɵWorkbenchCommands.viewParamsTopic(this.id))
      .pipe(
        mapToBody(),
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
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
        takeUntil(this._beforeUnload$),
      );

    this.partId$ = Beans.get(MessageClient).observe$<string>(ɵWorkbenchCommands.viewPartIdTopic(this.id))
      .pipe(
        mapToBody(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
        takeUntil(this._beforeUnload$),
      );
    // Update part id snapshot when part changes.
    this.partId$
      .pipe(takeUntil(this._destroy$))
      .subscribe(partId => this.snapshot.partId = partId);
    // Update params snapshot when params change.
    this.params$
      .pipe(takeUntil(this._destroy$))
      .subscribe(params => this.snapshot.params = new Map(params));
    // Detect navigation to a different view capability of the same app.
    this.capability$
      .pipe(
        skip(1), // skip the initial navigation
        takeUntil(merge(this._beforeUnload$, this._destroy$)),
      )
      .subscribe(() => {
        this._beforeInAppNavigation$.next();
        this._canCloseFn = undefined;
        this._canCloseSubscription?.unsubscribe();
      });

    // Signal view properties available.
    this.whenProperties = firstValueFrom(combineLatest([this.partId$, this.params$])).then();
  }

  /** @inheritDoc */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }

  /** @inheritDoc */
  public setTitle(title: string | Observable<string>): void {
    this._propertyChange$.next('title');

    Observables.coerce(title)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewTitleTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'title')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /** @inheritDoc */
  public setHeading(heading: string | Observable<string>): void {
    this._propertyChange$.next('heading');

    Observables.coerce(heading)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewHeadingTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'heading')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /** @inheritDoc */
  public markDirty(dirty: undefined | boolean | Observable<boolean>): void {
    this._propertyChange$.next('dirty');

    Observables.coerce(dirty ?? true)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewDirtyTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'dirty')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /** @inheritDoc */
  public setClosable(closable: boolean | Observable<boolean>): void {
    this._propertyChange$.next('closable');

    Observables.coerce(closable)
      .pipe(
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewClosableTopic(this.id), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'closable')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /** @inheritDoc */
  public close(): void {
    Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewCloseTopic(this.id)).then();
  }

  /** @inheritDoc */
  public addCanClose(canClose: CanClose): void {
    this.canClose(canClose);
  }

  /** @inheritDoc */
  public removeCanClose(canClose: CanClose): void {
    if (canClose === this._canCloseFn) {
      this._canCloseSubscription!.unsubscribe();
      this._canCloseSubscription = undefined;
      this._canCloseFn = undefined;
    }
  }

  /** @inheritDoc */
  public canClose(canClose: CanCloseFn | CanClose): CanCloseRef {
    this._canCloseFn = canClose;
    this._canCloseSubscription ??= Beans.get(MessageClient).onMessage(ɵWorkbenchCommands.canCloseTopic(this.id), () => {
      if (typeof this._canCloseFn === 'object') {
        return this._canCloseFn.canClose();
      }
      return this._canCloseFn?.() ?? true;
    });
    return {
      dispose: () => {
        if (canClose === this._canCloseFn) {
          this._canCloseSubscription!.unsubscribe();
          this._canCloseSubscription = undefined;
          this._canCloseFn = undefined;
        }
      },
    };
  }

  public preDestroy(): void {
    this._canCloseSubscription?.unsubscribe();
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
