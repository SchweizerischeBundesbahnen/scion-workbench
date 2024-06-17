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
   * Represents the identity of this view.
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
   * The current snapshot of this view.
   */
  public abstract readonly snapshot: ViewSnapshot;

  /**
   * Indicates whether this view is active.
   *
   * Upon subscription, emits the active state of this view, and then emits continuously when it changes.
   * The Observable completes when navigating to a microfrontend of another application, but not when navigating to a different microfrontend
   * of the same application.
   */
  public abstract readonly active$: Observable<boolean>;

  /**
   * Provides the identity of the part that contains this view.
   *
   * Upon subscription, emits the identity of this view's part, and then emits continuously when it changes.
   * The Observable completes when navigating to a microfrontend of another application, but not when navigating to a different microfrontend
   * of the same application.
   */
  public abstract readonly partId$: Observable<string>;

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
   * Registers a guard to decide whether this view can be closed or not.
   * The guard will be removed when navigating to another microfrontend.
   *
   * @see CanClose
   */
  public abstract addCanClose(canClose: CanClose): void;

  /**
   * Unregisters the given guard.
   */
  public abstract removeCanClose(canClose: CanClose): void;
}

/**
 * Guard that can be registered in {@link WorkbenchView} to decide whether the view can be closed.
 *
 * The following example registers a `CanClose` guard that asks the user whether the view can be closed.
 *
 * ```ts
 * class MicrofrontendComponent implements CanClose {
 *
 *   constructor() {
 *     Beans.get(WorkbenchView).addCanClose(this);
 *   }
 *
 *   public async canClose(): Promise<boolean> {
 *     const action = await Beans.get(WorkbenchMessageBoxService).open('Do you want to close this view?', {
 *       actions: {yes: 'Yes', no: 'No'},
 *     });
 *     return action === 'yes';
 *   }
 * }
 * ```
 */
export interface CanClose {

  /**
   * Decides whether this view can be closed.
   */
  canClose(): Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Provides information about a view displayed at a particular moment in time.
 *
 * @category View
 */
export interface ViewSnapshot {
  /**
   * Parameters of the microfrontend loaded into the view.
   */
  params: ReadonlyMap<string, any>;
  /**
   * The identity of the part that contains the view.
   */
  partId: string;
}

/**
 * Format of a view identifier.
 *
 * Each view is assigned a unique identifier (e.g., `view.1`, `view.2`, etc.).
 *
 * @category View
 */
export type ViewId = `view.${number}`;
