/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, assertNotInReactiveContext, inject, Injectable, Injector, NgZone, runInInjectionContext} from '@angular/core';
import {PopupConfig} from './popup.config';
import {WorkbenchPopupRegistry} from './workbench-popup.registry';
import {computePopupId} from '../workbench.identifiers';
import {ɵWorkbenchPopup} from './ɵworkbench-popup';
import {createInvocationContext, WorkbenchInvocationContext} from '../invocation-context/invocation-context';
import {WorkbenchPopupService} from './workbench-popup.service';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchPopupService implements WorkbenchPopupService {

  private readonly _injector = inject(Injector);
  private readonly _rootInjector = inject(ApplicationRef).injector;
  private readonly _popupRegistry = inject(WorkbenchPopupRegistry);
  private readonly _zone = inject(NgZone);

  /** @inheritDoc */
  public async open<R>(config: PopupConfig): Promise<R | undefined> {
    assertNotInReactiveContext(this.open, 'Call WorkbenchPopupService.open() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to display the popup even when called from outside the Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(config));
    }

    const popup = this.createPopup<R>(config);
    this._popupRegistry.register(popup.id, popup);
    try {
      return await popup.waitForClose();
    }
    finally {
      this._popupRegistry.unregister(popup.id);
    }
  }

  /**
   * Creates the popup handle.
   */
  private createPopup<R>(config: PopupConfig): ɵWorkbenchPopup<unknown, R> {
    // Construct the handle in an injection context that shares the popup's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const popupId = config.id ?? computePopupId();
    const popupInjector = Injector.create({
      parent: this._rootInjector, // use root injector to be independent of service construction context
      providers: [],
      name: `Workbench Popup ${popupId}`,
    });
    const invocationContext = createPopupInvocationContext(config, this._injector);
    return runInInjectionContext(popupInjector, () => new ɵWorkbenchPopup<unknown, R>(popupId, invocationContext, config));
  }
}

/**
 * Computes the popup's invocation context based on passsed options and injection context.
 */
function createPopupInvocationContext(config: PopupConfig, injector: Injector): WorkbenchInvocationContext | null {
  return createInvocationContext(config.context && (typeof config.context === 'object' ? config.context.viewId : config.context), {injector});
}
