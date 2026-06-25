/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {contributeMenu} from '@scion/components/menu';
import {noop} from 'rxjs';

@Component({
  selector: 'app-workbench-notification-menu-test-page',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkbenchNotificationMenuTestPageComponent {

  constructor() {
    contributeMenu('menu:workbench.notification.toolbar', menu => menu.addMenuItem({label: 'testee', onSelect: noop}));
  }
}
