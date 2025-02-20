/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WorkbenchView} from '@scion/workbench';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navigation-test-page',
  template: 'NavigationTestPageComponent',
})
export class NavigationTestPageComponent {

  constructor(route: ActivatedRoute, view: WorkbenchView) {
    route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe(params => {
        if (params.has('title')) {
          view.title = params.get('title');
        }
      });
  }
}
