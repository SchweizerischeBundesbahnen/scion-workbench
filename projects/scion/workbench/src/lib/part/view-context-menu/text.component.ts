/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Inject, InjectionToken} from '@angular/core';

export const TEXT = new InjectionToken<string[]>('TEXT');

/**
 * Component which renders text injected via {@link TEXT} injection token.
 */
@Component({
  selector: 'wb-text',
  template: '{{text}}',
  standalone: true,
})
export class TextComponent {

  constructor(@Inject(TEXT) public text: string) {
  }
}
