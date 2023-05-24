/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-non-standalone-view-test-page',
  templateUrl: './non-standalone-view-test-page.component.html',
  styleUrls: ['./non-standalone-view-test-page.component.scss'],
})
export class NonStandaloneViewTestPageComponent {

  constructor(public view: WorkbenchView, route: ActivatedRoute) {
    view.cssClass = view.cssClasses.concat(route.snapshot.paramMap.get('cssClass') ?? []);
  }
}