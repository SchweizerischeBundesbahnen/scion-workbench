/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchRouterLinkDirective, WorkbenchView} from '@scion/workbench';
import {TodoService} from '../todo.service';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  imports: [
    WorkbenchRouterLinkDirective,
  ],
})
export default class TodosComponent {

  protected readonly todoService = inject(TodoService);

  constructor() {
    const view = inject(WorkbenchView);

    view.title = 'Todos';
    view.heading = 'What to do today?';
    view.closable = false;
  }
}
