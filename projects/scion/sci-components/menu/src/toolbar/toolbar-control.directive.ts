/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, Pipe, PipeTransform, Signal} from '@angular/core';
import {SciComponentDescriptor} from '@scion/sci-components/common';
import {SciMenuItem} from '@scion/sci-components/menu';

/**
 * Creates a new descriptor with cssClass, attributes and tooltip of the passed menu item.
 */
@Pipe({name: 'sciToolbarControl'})
export class SciToolbarControlPipe implements PipeTransform {

  public transform(componentDescriptor: SciComponentDescriptor, menuItem: SciMenuItem): Signal<SciComponentDescriptor> {
    const attributes = computed(() => {
      return {
        ...menuItem.attributes,
        title: menuItem.tooltip?.(),
      }
    });

    return computed(() => ({
      ...componentDescriptor,
      cssClass: menuItem.cssClass,
      attributes: attributes,
    }));
  }
}
