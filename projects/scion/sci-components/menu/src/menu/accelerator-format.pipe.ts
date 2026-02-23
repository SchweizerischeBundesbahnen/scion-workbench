/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';
import {SciKeyboardAccelerator} from '../menu-accelerators';

/**
 * Formats given keyboard accelerator for display to the user.
 */
@Pipe({name: 'sciFormatAccelerator'})
export class FormatAcceleratorPipe implements PipeTransform {

  public transform(accelerator: SciKeyboardAccelerator | undefined, leadingText?: string | undefined): string | undefined {
    if (!accelerator) {
      return leadingText;
    }

    const modifiers = [];
    if (accelerator.ctrl) {
      modifiers.push('Ctrl');
    }
    if (accelerator.shift) {
      modifiers.push('Shift');
    }
    if (accelerator.alt) {
      modifiers.push('Alt');
    }
    if (accelerator.meta) {
      modifiers.push('Meta');
    }

    const formattedAccelerator = modifiers.concat(formatKey(accelerator)).join('+');
    return leadingText ? `${leadingText} (${formattedAccelerator})` : formattedAccelerator;
  }
}

function formatKey(accelerator: SciKeyboardAccelerator): string {
  const key = accelerator.key[0]!.toUpperCase() + accelerator.key.substring(1);
  if (key === ' ') {
    return 'Space';
  }
  return accelerator.location === 'numpad' ? `NumPad ${key}` : key;
}
