/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, inject, input, LOCALE_ID} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';
import {TodoService} from '../todo.service';
import {DatePipe, formatDate} from '@angular/common';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
  imports: [
    DatePipe,
  ],
})
export default class TodoComponent {

  public readonly id = input.required<string>();

  private readonly todoService = inject(TodoService);
  private readonly locale = inject(LOCALE_ID);

  protected todo = computed(() => this.todoService.getTodo(this.id()));

  constructor() {
    const view = inject(WorkbenchView);

    effect(() => {
      view.title = this.todo().task;
      view.heading = `Due by ${formatDate(this.todo().dueDate, 'short', this.locale)}`;
    });
  }
}
