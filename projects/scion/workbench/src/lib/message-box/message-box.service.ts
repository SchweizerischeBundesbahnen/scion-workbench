/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, NgZone, OnDestroy, Optional, SkipSelf} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {MessageBoxConfig} from './message-box.config';
import {ɵMessageBox} from './ɵmessage-box';
import {Arrays} from '@scion/toolkit/util';
import {filter, map, takeUntil} from 'rxjs/operators';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';

/**
 * Allows displaying a message to the user in a workbench message box.
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
 *   if opening the message box in the context of a view, it is opened as a view-modal message box. If opened outside a
 *   view, setting the modality to 'view' has no effect, unless setting {@link MessageBoxConfig.context.viewId}.
 *
 * To display structured content, consider passing a component to {@link MessageBoxConfig#content} instead of plain text.
 *
 * Unlike views, message boxes are not part of the persistent workbench navigation, meaning that message boxes do not survive a page reload.
 */
@Injectable({providedIn: 'root'})
export class MessageBoxService implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _messageBoxes$ = new BehaviorSubject<ɵMessageBox[]>([]);
  private _messageBoxServiceHierarchy: [MessageBoxService, ...MessageBoxService[]]; // minItems: 1

  constructor(@Optional() @SkipSelf() private _parentMessageBoxService: MessageBoxService,
              @Optional() private _view: WorkbenchView,
              private _viewRegistry: WorkbenchViewRegistry,
              private _zone: NgZone) {
    this._messageBoxServiceHierarchy = this.computeMessageBoxServiceHierarchy();
    this._view && this.restoreFocusOnViewActivation(this._view);
  }

  /**
   * Presents the user with a message that is displayed in a message box based on the given config.
   *
   * By default, when the message box is opened in the context of a workbench view, it is opened as a view-modal message box.
   *
   * ### Usage:
   * ```typescript
   * const action = await messageBoxService.open({
   *   content: 'Do you want to continue?',
   *   severity: 'info',
   *   actions: {
   *     yes: 'Yes',
   *     no: 'No',
   *     cancel: 'Cancel',
   *   },
   * });
   * ```
   *
   * @param  message - Configures the content and appearance of the message.
   * @return Promise that resolves to the key of the action button that the user pressed to close the message box.
   *         Depending on the message box component, additional data may be included, such as user's input when prompting the user to
   *         enter data.
   */
  public open(message: string | MessageBoxConfig): Promise<any> {
    // Ensure to run in Angular zone to display the message box even if called from outside the Angular zone, e.g. from an error handler.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(message));
    }

    const config: MessageBoxConfig = typeof message === 'string' ? {content: message} : message;

    if (config.modality === 'application') {
      return Arrays.last(this._messageBoxServiceHierarchy)!.addMessageBox(config);
    }
    else if (config.context?.viewId) {
      const view = this._viewRegistry.get(config.context.viewId);
      const viewInjector = view.portal.componentRef.injector;
      return viewInjector.get(MessageBoxService).addMessageBox(config);
    }
    return this.addMessageBox(config);
  }

  private addMessageBox(config: MessageBoxConfig): Promise<any> {
    const messageBox = new ɵMessageBox(config);
    this._messageBoxes$.next(this._messageBoxes$.value.concat(messageBox));
    return messageBox.whenClose.finally(() => {
      this._messageBoxes$.next(this._messageBoxes$.value.filter(it => it !== messageBox));
    });
  }

  /**
   * Emits the message boxes opened in the current context and each time when they change.
   * Optionally, includes message boxes of parent contexts.
   *
   * @internal
   */
  public messageBoxes$(options: {includeParents: boolean}): Observable<ɵMessageBox[]> {
    if (options.includeParents) {
      return combineLatest(this._messageBoxServiceHierarchy.map(service => service.messageBoxes$({includeParents: false})))
        .pipe(map(() => this.messageBoxStack()));
    }
    return this._messageBoxes$;
  }

  /**
   * Computes the message box stack including message boxes of parent stacks.
   *
   * The message boxes are returned in ascending stack order, i.e., subsequent message boxes overlap previous ones.
   */
  private messageBoxStack(): ɵMessageBox[] {
    return this._messageBoxServiceHierarchy
      .reduce((stack, service) => stack.concat(service._messageBoxes$.value), new Array<ɵMessageBox>());
  }

  /**
   * Returns the message box service hierarchy.
   */
  private computeMessageBoxServiceHierarchy(): [MessageBoxService, ...MessageBoxService[]] {
    const hierarchy: MessageBoxService[] = [];
    let current: MessageBoxService = this; // eslint-disable-line @typescript-eslint/no-this-alias
    do {
      hierarchy.push(current);
    } while ((current = current._parentMessageBoxService));
    return hierarchy as [MessageBoxService, ...MessageBoxService[]];
  }

  /**
   * Focuses the topmost message box in the message box hierarchy of the current context.
   * Has no effect if no message box is displaying.
   *
   * @internal
   */
  public focusTop(): void {
    Arrays.last(this.messageBoxStack())?.focus();
  }

  private restoreFocusOnViewActivation(view: WorkbenchView): void {
    view.active$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this.focusTop();
      });
  }

  /* @docs-private */
  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
