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
import {PartId, ViewId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * A view is a visual workbench element for displaying content stacked or side-by-side in the workbench layout.
 *
 * Users can drag views from one part to another, even across windows, or place them side-by-side, horizontally and vertically.
 *
 * The view microfrontend can inject this handle to interact with the view.
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
   * Indicates whether this view has the focus.
   *
   * Upon subscription, emits the focused state of this view, and then emits continuously when it changes.
   * The Observable completes when navigating to a microfrontend of another application, but not when navigating to a different microfrontend
   * of the same application.
   */
  public abstract readonly focused$: Observable<boolean>;

  /**
   * Provides the identity of the part that contains this view.
   *
   * Upon subscription, emits the identity of this view's part, and then emits continuously when it changes.
   * The Observable completes when navigating to a microfrontend of another application, but not when navigating to a different microfrontend
   * of the same application.
   */
  public abstract readonly partId$: Observable<PartId>;

  /**
   * Sets the title to be displayed in the view tab.
   *
   * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract setTitle(title: Translatable): void;

  /**
   * Sets the title to be displayed in the view tab.
   *
   * @deprecated since version 1.0.0-beta.31. To migrate, pass a translatable and provide the text using a text provider registered in `WorkbenchClient.registerTextProvider`.
   */
  public abstract setTitle(title: Observable<Translatable>): void; // eslint-disable-line @typescript-eslint/unified-signatures

  /**
   * Sets the subtitle to be displayed in the view tab.
   *
   * Can be a text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  public abstract setHeading(heading: Translatable): void;

  /**
   * Sets the subtitle to be displayed in the view tab.
   *
   * @deprecated since version 1.0.0-beta.31. To migrate, pass a translatable and provide the text using a text provider registered in `WorkbenchClient.registerTextProvider`.
   */
  public abstract setHeading(heading: Observable<Translatable>): void; // eslint-disable-line @typescript-eslint/unified-signatures

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
   * Registers a guard to confirm closing the view, replacing any previous guard.
   *
   * Example:
   * ```ts
   * Beans.get(WorkbenchView).canClose(async () => {
   *   const action = await Beans.get(WorkbenchMessageBoxService).open('Do you want to save changes?', {
   *     actions: {
   *       yes: 'Yes',
   *       no: 'No',
   *       cancel: 'Cancel'
   *     }
   *   });
   *
   *   switch (action) {
   *     case 'yes':
   *       // Store changes ...
   *       return true;
   *     case 'no':
   *       return true;
   *     default:
   *       return false;
   *   }
   * });
   * ```
   *
   * @param canClose - Callback to confirm closing the view.
   * @returns Reference to the `CanClose` guard, which can be used to unregister the guard.
   */
  public abstract canClose(canClose: CanCloseFn): CanCloseRef;
}

/**
 * The signature of a function to confirm closing a view., e.g., if dirty.
 */
export type CanCloseFn = () => Observable<boolean> | Promise<boolean> | boolean;

/**
 * Reference to the `CanClose` guard registered on a view.
 */
export interface CanCloseRef {

  /**
   * Removes the `CanClose` guard from the view.
   *
   * Has no effect if another guard was registered in the meantime.
   */
  dispose(): void;
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
  partId: PartId;
  /**
   * Indicates whether this view is active.
   */
  active: boolean;
  /**
   * Indicates whether this view has the focus.
   */
  focused: boolean;
}
