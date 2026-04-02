/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {SciMenuAcceleratorTargetProvider} from '@scion/sci-components/menu';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {ɵWorkbenchPart} from '../part/ɵworkbench-part.model';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog.model';
import {ɵWorkbenchNotification} from '../notification/ɵworkbench-notification.model';
import {MaybeSignal} from '@scion/sci-components/common';

class WorkbenchMenuAcceleratorTargetProvider implements SciMenuAcceleratorTargetProvider {

  /** @inheritDoc */
  public provideTarget(): MaybeSignal<Element | undefined> {
    const view = inject(ɵWorkbenchView, {optional: true});
    if (view) {
      return view.slot.portal.element;
    }

    const part = inject(ɵWorkbenchPart, {optional: true});
    if (part) {
      return part.slot.portal.element;
    }

    const dialog = inject(ɵWorkbenchDialog, {optional: true});
    if (dialog) {
      return dialog.element;
    }

    const notification = inject(ɵWorkbenchNotification, {optional: true});
    if (notification) {
      return notification.portal.element;
    }

    return undefined;
  }
}

export function provideWorkbenchMenuAcceleratorTargetProvider(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: SciMenuAcceleratorTargetProvider, useClass: WorkbenchMenuAcceleratorTargetProvider},
  ]);
}
