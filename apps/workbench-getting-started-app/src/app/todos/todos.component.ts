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
import {WorkbenchRouterLinkDirective, WorkbenchView} from '@scion/workbench';
import {TodoService} from '../todo.service';
import {NgFor} from '@angular/common';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  standalone: true,
  imports: [
    NgFor,
    WorkbenchRouterLinkDirective,
  ],
})
export default class TodosComponent {

  constructor(view: WorkbenchView, public todoService: TodoService) {
    view.title = 'Todos';
    view.heading = 'What to do today?';
    view.closable = false;
  }
}
