/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Platform, PopupService } from '@scion/workbench-application.core';
import { Injectable, InjectionToken, Injector, Provider, Type } from '@angular/core';

/**
 * DI injection token to provide the popup component instance.
 *
 * @internal public because of AOT build
 */
export const POPUP_COMPONENT_INSTANCE = new InjectionToken<any>('POPUP_COMPONENT_INSTANCE');

/**
 * Provides a reference to the popup component instance.
 *
 * @internal public because of AOT build
 */
@Injectable()
export class PopupComponentRef {

  public readonly instance: Promise<any>;

  constructor(componentInjector: Injector) {
    this.instance = new Promise(resolve => { // tslint:disable-line:typedef
      // resolve instance after component injector is fully constructed
      setTimeout(() => resolve(componentInjector.get(POPUP_COMPONENT_INSTANCE)));
    });
  }
}

/**
 * Invoke from the component's providers metadata to inject {WorkbenchPopup}.
 * As its argument, provide the symbol of the component class.
 *
 * ---
 * Example usage:
 *
 * @Component({
 *   ...
 *   providers: [
 *     provideWorkbenchPopup(YourComponent)
 *   ]
 * })
 * export class YourComponent {
 *
 *   constructor(public popup: WorkbenchPopup) {
 *   }
 * }
 */
export function provideWorkbenchPopup(component: Type<any>): Provider[] {
  return [
    {provide: POPUP_COMPONENT_INSTANCE, useExisting: component},
    {provide: WorkbenchPopup, useClass: InternalWorkbenchPopup},
    {provide: PopupComponentRef, useClass: PopupComponentRef},
  ];
}

/**
 * Popup handle which the component can inject to close the popup.
 */
export abstract class WorkbenchPopup {

  /**
   * Closes this popup.
   */
  public abstract close(result?: any): void;
}

@Injectable()
export class InternalWorkbenchPopup implements WorkbenchPopup {

  public close(result?: any): void {
    Platform.getService(PopupService).close(result);
  }
}
