/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SciThrobberComponent} from '@scion/components/throbber';

/**
 * Default splash displayed while starting the workbench.
 */
@Component({
  selector: 'wb-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SciThrobberComponent],
})
export class SplashComponent {
}
