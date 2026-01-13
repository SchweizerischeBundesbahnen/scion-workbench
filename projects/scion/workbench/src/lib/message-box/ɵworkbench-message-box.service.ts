/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {assertNotInReactiveContext, DestroyRef, inject, Injectable, NgZone, Provider} from '@angular/core';
import {WorkbenchMessageBoxOptions} from './workbench-message-box.options';
import {WorkbenchDialogService} from '../dialog/workbench-dialog.service';
import {WorkbenchMessageBoxComponent} from './workbench-message-box.component';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchMessageBoxService} from './workbench-message-box.service';
import {Translatable} from '../text/workbench-text-provider.model';
import {Logger, LoggerNames} from '../logging';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchMessageBoxService implements WorkbenchMessageBoxService {

  private readonly _workbenchDialogService = inject(WorkbenchDialogService);
  private readonly _zone = inject(NgZone);

  constructor() {
    this.installServiceLifecycleLogger();
  }

  /**
   * @inheritDoc
   */
  public async open(message: Translatable | null | ComponentType<unknown>, options?: WorkbenchMessageBoxOptions): Promise<string> {
    assertNotInReactiveContext(this.open, 'Call WorkbenchMessageBoxService.open() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to display the message box even if called from outside the Angular zone, e.g. from an error handler.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(message, options));
    }

    return (await this._workbenchDialogService.open<string>(WorkbenchMessageBoxComponent, {
      inputs: {message, options},
      modality: options?.modality,
      injector: options?.injector,
      providers: options?.providers,
      cssClass: options?.cssClass,
      context: options?.context,
      animate: true,
    }))!;
  }

  private installServiceLifecycleLogger(): void {
    const logger = inject(Logger);
    const workbenchElement = inject(WORKBENCH_ELEMENT, {optional: true});
    logger.debug(() => `Constructing WorkbenchMessageBoxService [context=${workbenchElement?.id}]`, LoggerNames.LIFECYCLE);
    inject(DestroyRef).onDestroy(() => logger.debug(() => `Destroying WorkbenchMessageBoxService [context=${workbenchElement?.id}]'`, LoggerNames.LIFECYCLE));
  }
}

/**
 * Provides {@link WorkbenchDialogService} for dependency injection.
 */
export function provideWorkbenchMessageBoxService(): Provider[] {
  return [
    ɵWorkbenchMessageBoxService,
    {provide: WorkbenchMessageBoxService, useExisting: ɵWorkbenchMessageBoxService},
  ];
}
