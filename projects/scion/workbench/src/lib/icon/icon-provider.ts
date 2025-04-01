/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, inject, Injector, runInInjectionContext, Signal, untracked} from '@angular/core';
import {WORKBENCH_ICON_PROVIDER, WorkbenchIconDescriptor} from './workbench-icon-provider.model';
import {MaterialIconComponent} from './material-icon.component';

/**
 */
export function provideIcon(icon: Signal<string>, options?: {injector?: Injector}): Signal<WorkbenchIconDescriptor> {
  const injector = options?.injector ?? inject(Injector);
  const iconProvider = injector.get(WORKBENCH_ICON_PROVIDER) ?? provideMaterialIcon;

  return computed(() => {
    const _icon = icon();
    return runInInjectionContext(injector, () => untracked(() => iconProvider(_icon)));
  });
}

function provideMaterialIcon(ligature: string): WorkbenchIconDescriptor {
  return {
    component: MaterialIconComponent,
    inputs: {ligature},
  };
}
