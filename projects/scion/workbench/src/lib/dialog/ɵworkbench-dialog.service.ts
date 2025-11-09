/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, assertNotInReactiveContext, DestroyRef, DOCUMENT, inject, Injectable, Injector, NgZone, runInInjectionContext} from '@angular/core';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog';
import {firstValueFrom} from 'rxjs';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';
import {filter} from 'rxjs/operators';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchDialogService} from './workbench-dialog.service';
import {computeDialogId} from '../workbench.identifiers';
import {createInvocationContext, WorkbenchInvocationContext} from '../invocation-context/invocation-context';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {Logger, LoggerNames} from '../logging';
import {toObservable} from '@angular/core/rxjs-interop';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchDialogService implements WorkbenchDialogService {

  private readonly _injector = inject(Injector);
  private readonly _rootInjector = inject(ApplicationRef).injector;
  private readonly _dialogRegistry = inject(WorkbenchDialogRegistry);
  private readonly _document = inject(DOCUMENT);
  private readonly _zone = inject(NgZone);

  constructor() {
    this.installServiceLifecycleLogger();
  }

  /** @inheritDoc */
  public async open<R>(component: ComponentType<unknown>, options?: WorkbenchDialogOptions): Promise<R | undefined> {
    assertNotInReactiveContext(this.open, 'Call WorkbenchDialogService.open() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to display the dialog even when called from outside the Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(component, options));
    }

    // Delay the opening of a context-modal dialog until all application-modal dialogs are closed.
    // Otherwise, the context-modal dialog would overlap already opened application-modal dialogs.
    const invocationContext = createDialogInvocationContext(options ?? {}, this._injector);
    if (invocationContext) {
      await this.waitUntilApplicationModalDialogsClosed();
    }

    // Create the dialog.
    const dialog = this.createDialog<R>(component, invocationContext, options ?? {});
    this._dialogRegistry.register(dialog.id, dialog);

    // Capture focused element to restore focus when closing the dialog.
    const previouslyFocusedElement = this._document.activeElement instanceof HTMLElement ? this._document.activeElement : undefined;
    try {
      return await dialog.waitForClose();
    }
    finally {
      this._dialogRegistry.unregister(dialog.id);

      // Restore focus to previously focused element when closing the last dialog in the current context.
      if (previouslyFocusedElement && !this._dialogRegistry.top(invocationContext?.elementId)()) {
        previouslyFocusedElement.focus();
      }
    }
  }

  /**
   * Creates the dialog handle.
   */
  private createDialog<R>(component: ComponentType<unknown>, invocationContext: WorkbenchInvocationContext | null, options: WorkbenchDialogOptions): ɵWorkbenchDialog<R> {
    // Construct the handle in an injection context that shares the dialog's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const dialogId = computeDialogId();
    const dialogInjector = Injector.create({
      parent: this._rootInjector, // use root injector to be independent of service construction context
      providers: [],
      name: `Workbench Dialog ${dialogId}`,
    });
    return runInInjectionContext(dialogInjector, () => new ɵWorkbenchDialog<R>(dialogId, component, invocationContext, options));
  }

  /**
   * Returns a Promise that resolves when all application modal-dialogs are closed. If none are opened, the Promise resolves immediately.
   */
  private async waitUntilApplicationModalDialogsClosed(): Promise<void> {
    // Use root injector to be independent of service construction context.
    const injector = Injector.create({parent: this._rootInjector, providers: []});
    await firstValueFrom(toObservable(this._dialogRegistry.top(), {injector}).pipe(filter(top => !top)));
    injector.destroy();
  }

  private installServiceLifecycleLogger(): void {
    const logger = inject(Logger);
    const workbenchElement = inject(WORKBENCH_ELEMENT, {optional: true});
    logger.debug(() => `Constructing WorkbenchDialogService [context=${workbenchElement?.id}]`, LoggerNames.LIFECYCLE);
    inject(DestroyRef).onDestroy(() => logger.debug(() => `Destroying WorkbenchDialogService [context=${workbenchElement?.id}]'`, LoggerNames.LIFECYCLE));
  }
}

/**
 * Computes the dialog's invocation context based on passsed options and injection context.
 */
function createDialogInvocationContext(options: WorkbenchDialogOptions, injector: Injector): WorkbenchInvocationContext | null {
  if (options.modality === 'application') {
    return null;
  }

  return createInvocationContext(options.context && (typeof options.context === 'object' ? options.context.viewId : options.context), {injector});
}
