/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injector, ViewContainerRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {Dictionary} from '@scion/toolkit/util';
import {Observable} from 'rxjs';

/**
 * Configures the content and appearance of a message presented to the user in the form of a message box.
 *
 * A message box is a modal dialog box that an application can use to display a message to the user. It typically contains a text
 * message and one or more buttons.
 *
 * The workbench supports the following two modality types:
 *
 * - **Application-modal:**
 *   An application-modal message box blocks the entire workbench. The user cannot switch between views, close or open views,
 *   or arrange views in the workbench layout.
 *
 * - **View-modal:**
 *   A view-modal message box blocks only the view in which it was opened, or the contextual view if specified. In contrast to
 *   application-modal message boxes, the user can interact with other views, close them or open new views, or arrange them any
 *   other way. A view-modal message box sticks to its view; that is, it is displayed only when the view is visible. By default,
 *   when opening the message box in the context of a view, it is opened as a view-modal message box. When opened outside of a
 *   view, setting the modality to 'view' has no effect, unless setting {@link MessageBoxConfig.context.viewId}.
 */
export interface MessageBoxConfig {

  /**
   * Optional title of the message box; can be a string literal or an Observable.
   */
  title?: string | Observable<string>;

  /**
   * Content of the message box, can be either a plain text message or a component.
   *
   * Consider using a component when displaying structured content or prompting the user for input.
   * You can pass data to the component using the {@link componentInput} property or by providing a custom
   * injector in {@link componentConstructOptions.injector}.
   */
  content: string | ComponentType<any>;

  /**
   * If using a component as the message box content, optionally instruct Angular how to construct the component.
   * In most cases, construct options need not to be set.
   */
  componentConstructOptions?: {

    /**
     * Sets the injector for the instantiation of the message box component, giving you control over the objects available
     * for injection into the message box component. If not specified, uses the application's root injector, or the view's
     * injector if opened in the context of a view.
     *
     * ```ts
     * Injector.create({
     *   parent: ...,
     *   providers: [
     *    {provide: <DiToken>, useValue: <value>}
     *   ],
     * })
     * ```
     */
    injector?: Injector;

    /**
     * Sets the component's attachment point in Angular's logical component tree (not the DOM tree used for rendering), effecting when
     * Angular checks the component for changes during a change detection cycle. If not set, inserts the component at the top level
     * in the component tree.
     */
    viewContainerRef?: ViewContainerRef;
  };

  /**
   * Optional data to pass to the message box component. In the component, you can inject the message box handle {@link MessageBox} to
   * read input data. Use only in combination with a custom message box component, has no effect otherwise.
   */
  componentInput?: any;

  /**
   * Defines the actions that will be displayed to the user in the form of buttons to close the message box.
   */
  actions?: Dictionary<string>;

  /**
   * Specifies the severity of the message. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Controls which areas of the application to block by the message box.
   *
   * - **Application-modal:**
   *   An application-modal message box blocks the entire workbench. The user cannot switch between views, close or open views,
   *   or arrange views in the workbench layout.
   *
   * - **View-modal:**
   *   A view-modal message box blocks only the view in which it was opened, or the contextual view if specified. In contrast to
   *   application-modal message boxes, the user can interact with other views, close them or open new views, or arrange them any
   *   other way. A view-modal message box sticks to its view; that is, it is displayed only when the view is visible. By default,
   *   when opening the message box in the context of a view, it is opened as a view-modal message box. When opened outside of a
   *   view, setting the modality to 'view' has no effect, unless setting {@link MessageBoxConfig.context.viewId}.
   */
  modality?: 'application' | 'view';

  /**
   * Specifies the context in which to open the message box.
   */
  context?: {
    /**
     * Allows controlling which view to block when opening a view-modal message box.
     *
     * By default, when opening the message box in the context of a view, that view is used as the contextual view.
     */
    viewId?: string;
  };

  /**
   * Specifies if the user can select text displayed in the message box. Defaults to `false`.
   */
  contentSelectable?: boolean;

  /**
   * Specifies CSS class(es) added to the message box, e.g. used for e2e testing.
   */
  cssClass?: string | string[];
}
