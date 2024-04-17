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
 * Handle to interact with a view opened via {@link WorkbenchRouter}.
 *
 * The view microfrontend can inject this handle to interact with the view, such as setting the title,
 * reading parameters, or closing it.
 *
 * @category View
 * @see WorkbenchViewCapability
 * @see WorkbenchRouter
 */
export abstract class WorkbenchView {

  /**
   * Represents the identity of this workbench view.
   */
  public abstract readonly id: ViewId;

  /**
   * Signals readiness, notifying the workbench that this view has completed initialization.
   *
   * If `showSplash` is set to `true` on the view capability, the workbench displays a splash until the view microfrontend signals readiness.
   *
   * @see WorkbenchViewCapability.properties.showSplash
   */
  public abstract signalReady(): void;

  /**
   * Provides the capability of the microfrontend loaded into the view.
   *
   * Upon subscription, emits the microfrontend's capability, and then emits continuously when navigating to a different microfrontend
   * of the same application. It completes when navigating to a microfrontend of another application.
   */
  public abstract readonly capability$: Observable<WorkbenchViewCapability>;

  /**
   * Provides the parameters of the microfrontend loaded into the view.
   *
   * Upon subscription, emits the microfrontend's parameters, and then emits continuously when the parameters change.
   * The Observable completes when navigating to a microfrontend of another application, but not when navigating to a different microfrontend
   * of the same application.
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
   */
  public abstract setTitle(title: string | Observable<string>): void;

  /**
   * Sets the subtitle to be displayed in the view tab.
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

/**
 * Format of a view identifier.
 *
 * Each view is assigned a unique identifier (e.g., `view.1`, `view.2`, etc.).
 *
 * @category View
 */
export type ViewId = `view.${number}`;
