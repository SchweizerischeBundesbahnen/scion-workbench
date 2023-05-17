/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {WorkbenchViewCapability} from './workbench-view-capability';

/**
 * A view is a visual workbench component for displaying content stacked or side-by-side.
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
  public abstract readonly id: string;

  /**
   * Observable containing the view capability that represents the microfrontend loaded into this workbench view.
   *
   * Upon subscription, it emits the capability of the current microfrontend, and then emits continuously when navigating
   * to another microfrontend of the same app. It only completes before unloading the web app, e.g., when closing the view
   * or navigating to a microfrontend of another app. Consequently, do not forget to unsubscribe from this Observables before
   * displaying another microfrontend.
   */
  public abstract readonly capability$: Observable<WorkbenchViewCapability>;

  /**
   * Observable containing the parameters including the qualifier as passed for navigation in {@link WorkbenchNavigationExtras.params}.
   *
   * Upon subscription, it emits the current params, and then emits continuously when they change. The Observable does not complete when
   * navigating to another microfrontend of the same app. It only completes before unloading the web app, e.g., when closing the view or
   * navigating to a microfrontend of another app. Consequently, do not forget to unsubscribe from this Observables before displaying
   * another microfrontend.
   */
  public abstract readonly params$: Observable<ReadonlyMap<string, any>>;

  /**
   * The current snapshot of this workbench view.
   */
  public abstract readonly snapshot: ViewSnapshot;

  /**
   * Indicates whether this is the active view in its part.
   *
   * Upon subscription, it emits the current active state of this view, and then emits continuously when it changes. The Observable does not
   * complete when navigating to another microfrontend of the same app. It only completes before unloading the web app, e.g., when closing
   * the view or navigating to a microfrontend of another app. Consequently, do not forget to unsubscribe from this Observables before displaying
   * another microfrontend.
   */
  public abstract readonly active$: Observable<boolean>;

  /**
   * Sets the title to be displayed in the view tab.
   *
   * You can provide the title either as a string literal or as Observable. If you pass an Observable, it will be unsubscribed when navigating
   * to another microfrontend, whether from the same app or a different one.
   */
  public abstract setTitle(title: string | Observable<string>): void;

  /**
   * Sets the subtitle to be displayed in the view tab.
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
 * Contains the information about a view displayed at a particular moment in time.
 *
 * @category View
 */
export interface ViewSnapshot {
  params: ReadonlyMap<string, any>;
}
