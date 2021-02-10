/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { merge, MonoTypeOperatorFunction, Observable, Subject, Subscription } from 'rxjs';
import { WorkbenchViewCapability } from './workbench-view-capability';
import { Beans, PreDestroy } from '@scion/toolkit/bean-manager';
import { ManifestService, mapToBody, MessageClient, MessageHeaders } from '@scion/microfrontend-platform';
import { distinctUntilChanged, filter, map, mapTo, mergeMap, shareReplay, skip, switchMap, takeUntil } from 'rxjs/operators';
import { Observables } from '@scion/toolkit/util';
import { ɵWorkbenchCommands } from '../ɵworkbench-commands';
import { ɵMicrofrontendRouteParams } from '../routing/workbench-router-navigate-command';

/**
 * A view is a visual workbench component for displaying content stacked or arranged side by side in the workbench layout.
 *
 * If a microfrontend lives in the context of a workbench view, regardless of its embedding level, it can inject an instance
 * of this class to interact with the workbench view, such as setting view tab properties or closing the view. It further
 * provides you access to the microfrontend capability and passed parameters.
 *
 * This object's lifecycle is bound to the workbench view and not to the navigation. In other words: If using hash-based routing
 * in your app, no new instance will be constructed when navigating to a different microfrontend of the same application, or when
 * re-routing to the same view capability, e.g., for updating the browser URL to persist navigation. Consequently, do not forget
 * to unsubscribe from Observables of this class before displaying another microfrontend.
 *
 * @category View
 */
export abstract class WorkbenchView {

  /**
   * Represents the identity of this workbench view.
   */
  public readonly viewId: string;

  /**
   * Observable containing the view capability that represents the microfrontend loaded into this workbench view.
   *
   * Upon subscription, it emits the capability of the current microfrontend, and then emits continuously when navigating
   * to another microfrontend of the same app. It only completes before unloading the web app, e.g., when closing the view
   * or navigating to a microfrontend of another app. Consequently, do not forget to unsubscribe from this Observables before
   * displaying another microfrontend.
   */
  public readonly capability$: Observable<WorkbenchViewCapability>;

  /**
   * Observable containing the parameters including the qualifier as passed for navigation in {@link WorkbenchNavigationExtras.params}.
   *
   * Upon subscription, it emits the current params, and then emits continuously when they change. The Observable does not complete when
   * navigating to another microfrontend of the same app. It only completes before unloading the web app, e.g., when closing the view or
   * navigating to a microfrontend of another app. Consequently, do not forget to unsubscribe from this Observables before displaying
   * another microfrontend.
   */
  public readonly params$: Observable<Map<string, any>>;

  /**
   * Indicates whether this is the active view in its view part.
   *
   * Upon subscription, it emits the current active state of this view, and then emits continuously when it changes. The Observable does not
   * complete when navigating to another microfrontend of the same app. It only completes before unloading the web app, e.g., when closing
   * the view or navigating to a microfrontend of another app. Consequently, do not forget to unsubscribe from this Observables before displaying
   * another microfrontend.
   */
  public readonly active$: Observable<boolean>;

  /**
   * Sets the title to be displayed in the view tab.
   *
   * You can provide the title either as a string literal or as Observable. If you pass an Observable, it will be unsubscribed when navigating
   * to another microfrontend, whether from the same app or a different one.
   */
  public abstract setTitle(title: string | Observable<string>): void;

  /**
   * Sets the sub title to be displayed in the view tab.
   *
   * You can provide the heading either as a string literal or as Observable. If you pass an Observable, it will be unsubscribed when navigating
   * to another microfrontend, whether from the same app or a different one.
   */
  public abstract setHeading(heading: string | Observable<string>): void;

  /**
   * Sets whether this view is dirty or pristine. When navigating to another microfrontend, the view's dirty state is set to pristine.
   *
   * You can provide the dirty/pristine state either as a boolean or as Observable. If you pass an Observable, it will be unsubscribed when
   * navigating to another microfrontend, whether from the same app or a different one.
   *
   * If not passing an argument, the view is marked as dirty. To mark it as pristine, you need to pass `false`.
   */
  public abstract markDirty(dirty?: boolean | Observable<boolean>): void;

  /**
   * Controls whether the user should be allowed to close this workbench view.
   *
   * You can provide either a boolean or Observable. If you pass an Observable, it will be unsubscribed when navigating to another microfrontend,
   * whether from the same app or a different one.
   */
  public abstract setClosable(closable: boolean | Observable<boolean>): void;

  /**
   * Initiates the closing of this workbench view.
   */
  public abstract close(): void;

  /**
   * Adds a listener to be notified just before closing this view. The closing event is cancelable,
   * i.e., you can invoke {@link ViewClosingEvent.preventDefault} to prevent closing.
   *
   * The listener is removed when navigating to another microfrontend, whether from the same app or a different one.
   */
  public abstract addClosingListener(listener: ViewClosingListener): void;

  /**
   * Removes the given listener.
   */
  public abstract removeClosingListener(listener: ViewClosingListener): void;
}

/**
 * @ignore
 */
export class ɵWorkbenchView implements WorkbenchView, PreDestroy { // tslint:disable-line:class-name

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
  private _closingSubscription: Subscription;

  public active$: Observable<boolean>;
  public capability$: Observable<WorkbenchViewCapability>;
  public params$: Observable<Map<string, any>>;

  constructor(public viewId: string) {
    this._beforeUnload$ = Beans.get(MessageClient).observe$<void>(ɵWorkbenchCommands.viewUnloadingTopic(this.viewId))
      .pipe(mapTo(undefined));

    this.params$ = Beans.get(MessageClient).observe$<Map<string, any>>(ɵWorkbenchCommands.viewParamsTopic(this.viewId))
      .pipe(
        mapToBody(),
        coerceMap(),
        shareReplay({refCount: true, bufferSize: 1}),
        takeUntil(this._beforeUnload$),
      );

    this.capability$ = this.params$
      .pipe(
        map(params => params.get(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID)),
        distinctUntilChanged(),
        switchMap(capabilityId => Beans.get(ManifestService).lookupCapabilities$<WorkbenchViewCapability>({id: capabilityId})),
        map(capabilities => capabilities[0]),
        shareReplay({refCount: true, bufferSize: 1}),
        takeUntil(this._beforeUnload$),
      );

    this.active$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.viewActiveTopic(this.viewId))
      .pipe(
        mapToBody(),
        distinctUntilChanged(),
        shareReplay({refCount: true, bufferSize: 1}),
        takeUntil(this._beforeUnload$),
      );

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
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewTitleTopic(this.viewId), it)),
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
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewHeadingTopic(this.viewId), it)),
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
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewDirtyTopic(this.viewId), it)),
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
        mergeMap(it => Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewClosableTopic(this.viewId), it)),
        takeUntil(merge(this._propertyChange$.pipe(filter(prop => prop === 'closable')), this._beforeInAppNavigation$, this._beforeUnload$, this._destroy$)),
      )
      .subscribe();
  }

  /**
   * @inheritDoc
   */
  public close(): void {
    Beans.get(MessageClient).publish(ɵWorkbenchCommands.viewCloseTopic(this.viewId));
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
      this._closingSubscription = null;
    }
  }

  /**
   * Installs a handler to be invoked by the workbench before closing this view.
   */
  private installClosingHandler(): Subscription {
    return Beans.get(MessageClient).observe$(ɵWorkbenchCommands.viewClosingTopic(this.viewId))
      .pipe(
        switchMap(async closeRequest => {
          const event = new ViewClosingEvent();
          await this.dispatchClosingEvent(event);
          return ({
            replyTo: closeRequest.headers.get(MessageHeaders.ReplyTo),
            preventDefault: event.isDefaultPrevented(),
          });
        }),
        takeUntil(merge(this._beforeUnload$, this._destroy$)),
      )
      .subscribe(({replyTo, preventDefault}) => {
        Beans.get(MessageClient).publish(replyTo, !preventDefault);
      });
  }

  /**
   * Dispatches the closing event to registered event handlers.
   * The closing event is cancelable, i.e, handlers can prevent closing by calling {@link ViewClosingEvent.preventDefault}.
   *
   * @return `false` if at least one of the event handlers cancelled the event. Otherwise it returns `true`.
   */
  private async dispatchClosingEvent(event: ViewClosingEvent): Promise<boolean> {
    for (const listener of this._closingListeners) {
      await listener.onClosing(event);
      if (event.isDefaultPrevented()) {
        return false;
      }
    }
    return true;
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Listener to be notified just before closing the workbench view.
 *
 * @category View
 */
export interface ViewClosingListener {

  /**
   * Method invoked just before closing the workbench view.
   *
   * The closing event is cancelable, i.e., you can invoke {@link ViewClosingEvent.preventDefault} to prevent closing.
   *
   * Note that you can cancel the event only until the returned Promise resolves. For example, to ask the user
   * for confirmation, you can use an async block and await user confirmation, as following:
   *
   * ```ts
   * public async onClosing(event: ViewClosingEvent): Promise<void> {
   *   const shouldClose = await askUserToConfirmClosing();
   *   if (!shouldClose) {
   *     event.preventDefault();
   *   }
   * }
   * ```
   */
  onClosing(event: ViewClosingEvent): void | Promise<void>;
}

/**
 * Indicates that the workbench view is about to be closed. This event is cancelable.
 *
 * @category View
 */
export class ViewClosingEvent {

  private _defaultPrevented = false;

  /**
   * Invoke to cancel the closing of the workbench view.
   */
  public preventDefault(): void {
    this._defaultPrevented = true;
  }

  /**
   * Returns `true` if `preventDefault()` was invoked successfully to indicate cancelation, and `false` otherwise.
   */
  public isDefaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

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
 * Context key to retrieve the view ID for microfrontends embedded in the context of a workbench view.
 *
 * @docs-private Not public API, intended for internal use only.
 * @ignore
 * @see {@link ContextService}
 */
export const ɵVIEW_ID_CONTEXT_KEY = 'ɵworkbench.view.id'; // tslint:disable-line:variable-name
