/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TodoService {

  public readonly todos: Todo[] = [
    {
      id: '1',
      dueDate: Date.now() + Math.random() * 1000 * 60 * 60 * 24,
      task: 'Implement new feature in application',
      notes: 'Refer to design specifications and write clean, efficient code',
    },
    {
      id: '2',
      dueDate: Date.now() + Math.random() * 1000 * 60 * 60 * 24,
      task: 'Fix bugs in database queries',
      notes: 'Identify and resolve performance issues with database queries',
    },
    {
      id: '3',
      dueDate: Date.now() + Math.random() * 1000 * 60 * 60 * 24,
      task: 'Write unit tests for backend code',
      notes: 'Ensure that all backend code is properly tested to prevent regressions',
    },
    {
      id: '4',
      dueDate: Date.now() + Math.random() * 1000 * 60 * 60 * 24,
      task: 'Meet with team to discuss project progress',
      notes: 'Provide updates on completed tasks and identify roadblocks',
    },
    {
      id: '5',
      dueDate: Date.now() + Math.random() * 1000 * 60 * 60 * 24,
      task: 'Refactor frontend code for better performance',
      notes: 'Identify areas of the code that can be optimized and refactor accordingly',
    },
  ];

  public getTodo(id: string): Todo {
    const todo = this.todos.find(todo => todo.id === id);
    if (!todo) {
      throw Error(`No todo found with id '${id}'.`);
    }
    return todo;
  }
}

export interface Todo {
  id: string;
  dueDate: number;
  task: string;
  notes: string;
}
