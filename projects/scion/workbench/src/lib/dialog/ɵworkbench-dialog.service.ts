/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, createEnvironmentInjector, DOCUMENT, EnvironmentInjector, inject, Injectable, NgZone, runInInjectionContext} from '@angular/core';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {firstValueFrom} from 'rxjs';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';
import {filter} from 'rxjs/operators';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchDialogService} from './workbench-dialog.service';
import {provideViewContext} from '../view/view-context-provider';
import {computeDialogId} from '../workbench.identifiers';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchDialogService implements WorkbenchDialogService {

  private readonly _document = inject(DOCUMENT);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _dialogRegistry = inject(WorkbenchDialogRegistry);
  private readonly _zone = inject(NgZone);
  private readonly _environmentInjector = inject(EnvironmentInjector);
  private readonly _view = inject(ɵWorkbenchView, {optional: true});

  /** @inheritDoc */
  public async open<R>(component: ComponentType<unknown>, options?: WorkbenchDialogOptions): Promise<R | undefined> {
    assertNotInReactiveContext(this.open, 'Call WorkbenchDialogService.open() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to display the dialog even when called from outside the Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(component, options));
    }

    // Resolve view that opened the dialog, if any.
    const contextualView = this.resolveContextualView(options);

    // Delay the opening of a view-modal dialog until all application-modal dialogs are closed.
    // Otherwise, the view-modal dialog would overlap already opened application-modal dialogs.
    if (contextualView) {
      await this.waitUntilApplicationModalDialogsClosed();
    }

    // Create the dialog.
    const dialog = this.createDialog<R>(component, {...options, contextualView});
    this._dialogRegistry.register(dialog);

    // Capture focused element to restore focus when closing the dialog.
    const previouslyFocusedElement = this._document.activeElement instanceof HTMLElement ? this._document.activeElement : undefined;
    try {
      return await dialog.open();
    }
    finally {
      this._dialogRegistry.unregister(dialog);

      // Restore focus to previously focused element when closing the last dialog in the current context.
      if (previouslyFocusedElement && !this._dialogRegistry.top({viewId: contextualView?.id})) {
        previouslyFocusedElement.focus();
      }
    }
  }

  /**
   * Creates the dialog handle.
   */
  private createDialog<R>(component: ComponentType<unknown>, options: WorkbenchDialogOptions & {contextualView: ɵWorkbenchView | null}): ɵWorkbenchDialog<R> {
    // Construct the handle in an injection context that shares the dialog's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const dialogId = computeDialogId();
    const dialogEnvironmentInjector = createEnvironmentInjector([provideViewContext(options.contextualView)], this._environmentInjector, `Workbench Dialog ${dialogId}`);
    return runInInjectionContext(dialogEnvironmentInjector, () => new ɵWorkbenchDialog<R>(dialogId, component, options));
  }

  /**
   * Resolves the contextual view to stick the dialog to.
   */
  private resolveContextualView(options?: WorkbenchDialogOptions): ɵWorkbenchView | null {
    if (options?.modality === 'application') {
      return null;
    }
    if (options?.context?.viewId) {
      return this._viewRegistry.get(options.context.viewId);
    }
    else if (this._view) {
      return this._view;
    }
    return null;
  }

  /**
   * Returns a Promise that resolves when all application modal-dialogs are closed. If none are opened, the Promise resolves immediately.
   */
  private async waitUntilApplicationModalDialogsClosed(): Promise<void> {
    await firstValueFrom(this._dialogRegistry.top$().pipe(filter(top => !top)));
  }
}
