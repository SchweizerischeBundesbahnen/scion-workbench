/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, assertNotInReactiveContext, inject, Injectable, Injector, NgZone, runInInjectionContext} from '@angular/core';
import {computeNotificationId} from '../workbench.identifiers';
import {ComponentType} from '@angular/cdk/portal';
import {WorkbenchNotificationService} from './workbench-notification.service';
import {WorkbenchNotificationOptions} from './workbench-notification.options';
import {ɵWorkbenchNotification} from './ɵworkbench-notification.model';
import {WorkbenchNotificationRegistry} from './workbench-notification.registry';
import {Translatable} from '../text/workbench-text-provider.model';
import {SingleTaskExecutor} from '../executor/single-task-executor';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchNotificationService implements WorkbenchNotificationService {

  private readonly _rootInjector = inject(ApplicationRef).injector;
  private readonly _notificationRegistry = inject(WorkbenchNotificationRegistry);
  private readonly _mutex = new SingleTaskExecutor();
  private readonly _zone = inject(NgZone);

  /** @inheritDoc */
  public show(message: Translatable | null | ComponentType<unknown>, options?: WorkbenchNotificationOptions): void {
    assertNotInReactiveContext(this.show, 'Call WorkbenchNotificationService.show() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    // Ensure to run in Angular zone to show the notification even when called from outside the Angular zone.
    if (!NgZone.isInAngularZone()) {
      this._zone.run(() => this.show(message, options));
      return;
    }

    // Prevent race conditions with asynchronous group reducer, ensuring to not have a "stale" previous notification.
    void this._mutex.submit(async () => {
      const previousNotification = options?.group ? this._notificationRegistry.elements().find(element => element.group === options.group) : undefined;

      // Replace previous notification of the same group, or add it otherwise.
      if (previousNotification) {
        const reducedInputs = options?.groupInputReduceFn ? await options.groupInputReduceFn(previousNotification.inputs ?? {}, options.inputs ?? {}) : options?.inputs;
        const notification = this.createNotification(message, {...options, inputs: reducedInputs});
        this._notificationRegistry.replace(previousNotification.id, {key: notification.id, element: notification});
      }
      else {
        const notification = this.createNotification(message, options);
        this._notificationRegistry.register(notification.id, notification);
      }
    });
  }

  /**
   * Creates the notification handle.
   */
  private createNotification(message: Translatable | null | ComponentType<unknown>, options?: WorkbenchNotificationOptions): ɵWorkbenchNotification {
    // Construct the handle in an injection context that shares the notification's lifecycle, allowing for automatic cleanup of effects and RxJS interop functions.
    const notificationId = computeNotificationId();
    const notificationInjector = Injector.create({
      parent: this._rootInjector, // use root injector to be independent of service construction context
      providers: [],
      name: `Workbench Notification ${notificationId}`,
    });

    return runInInjectionContext(notificationInjector, () => new ɵWorkbenchNotification(notificationId, message, options ?? {}));
  }
}
