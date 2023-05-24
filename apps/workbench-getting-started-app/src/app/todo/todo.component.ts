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
import {Todo, TodoService} from '../todo.service';
import {ActivatedRoute} from '@angular/router';
import {map, Observable, tap} from 'rxjs';
import {AsyncPipe, DatePipe, formatDate, NgIf} from '@angular/common';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe, NgIf, DatePipe,
  ],
})
export default class TodoComponent {

  public todo$: Observable<Todo>;

  constructor(route: ActivatedRoute, todoService: TodoService, view: WorkbenchView) {
    this.todo$ = route.params
      .pipe(
        map(params => params['id']),
        map(id => todoService.getTodo(id)),
        tap(todo => {
          view.title = todo.task;
          view.heading = `Due by ${formatDate(todo.dueDate, 'short', navigator.language)}`;
        }),
      );
  }
}