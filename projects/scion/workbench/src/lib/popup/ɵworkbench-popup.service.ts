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
import {WorkbenchPopupRegistry} from './workbench-popup.registry';
import {computePopupId} from '../workbench.identifiers';
import {ɵWorkbenchPopup} from './ɵworkbench-popup';
import {createInvocationContext, WorkbenchInvocationContext} from '../invocation-context/invocation-context';
import {WorkbenchPopupService} from './workbench-popup.service';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchPopupOptions} from './workbench-popup.options';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchPopupService implements WorkbenchPopupService {

  private readonly _injector = inject(Injector);
  private readonly _rootInjector = inject(ApplicationRef).injector;
  private readonly _popupRegistry = inject(WorkbenchPopupRegistry);
  private readonly _zone = inject(NgZone);

  /** @inheritDoc */
  public async open<R>(component: ComponentType<unknown>, options: WorkbenchPopupOptions): Promise<R | undefined> {
    assertNotInReactiveContext(this.open, 'Call WorkbenchPopupService.open() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to display the popup even when called from outside the Angular zone.
    if (!NgZone.isInAngularZone()) {
      return this._zone.run(() => this.open(component, options));
    }

    const popup = this.createPopup(component, options);
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
  private createPopup(component: ComponentType<unknown>, options: WorkbenchPopupOptions): ɵWorkbenchPopup {
    // Construct the handle in an injection context that shares the popup's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const popupId = options.id ?? computePopupId();
    const popupInjector = Injector.create({
      parent: this._rootInjector, // use root injector to be independent of service construction context
      providers: [],
      name: `Workbench Popup ${popupId}`,
    });
    const invocationContext = createPopupInvocationContext(options, this._injector);
    return runInInjectionContext(popupInjector, () => new ɵWorkbenchPopup(popupId, component, invocationContext, options));
  }
}

/**
 * Computes the popup's invocation context based on passsed options and injection context.
 */
function createPopupInvocationContext(options: WorkbenchPopupOptions, injector: Injector): WorkbenchInvocationContext | null {
  return createInvocationContext(options.context && (typeof options.context === 'object' ? options.context.viewId : options.context), {injector});
}
