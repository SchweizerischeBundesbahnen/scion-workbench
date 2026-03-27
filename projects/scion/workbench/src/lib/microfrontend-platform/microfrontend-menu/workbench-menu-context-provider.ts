/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {SciMenuContextProvider} from '@scion/sci-components/menu';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchPart} from '../../part/workbench-part.model';
import {WorkbenchDialog} from '../../dialog/workbench-dialog.model';
import {WorkbenchNotification} from '../../notification/workbench-notification.model';
import {MaybeSignal} from '../../common/utility-types';

class WorkbenchMenuContextProvider implements SciMenuContextProvider {

  /** @inheritDoc */
  public provideContext(): MaybeSignal<Map<string, unknown> | undefined> {
    const view = inject(WorkbenchView, {optional: true});
    if (view) {
      return computed(() => new Map<string, unknown>()
        .set('viewId', view.id)
        .set('partId', view.part().id)
        .set('peripheral', view.part().peripheral())
        .set('mainArea', view.part().isInMainArea));
    }

    const part = inject(WorkbenchPart, {optional: true});
    if (part) {
      return computed(() => new Map<string, unknown>()
        .set('partId', part.id)
        .set('viewId', part.activeView()?.id)
        .set('peripheral', part.peripheral())
        .set('mainArea', part.isInMainArea));
    }

    const dialog = inject(WorkbenchDialog, {optional: true});
    if (dialog) {
      return new Map<string, unknown>().set('dialogId', dialog.id);
    }

    const notification = inject(WorkbenchNotification, {optional: true});
    if (notification) {
      return new Map<string, unknown>().set('notificationId', notification.id);
    }

    return undefined;
  }
}

export function provideWorkbenchMenuContextProvider(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: SciMenuContextProvider, useClass: WorkbenchMenuContextProvider},
  ]);
}
