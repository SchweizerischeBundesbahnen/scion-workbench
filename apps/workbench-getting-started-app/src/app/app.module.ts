/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {MAIN_AREA_PART_ID, WorkbenchLayout, WorkbenchModule} from '@scion/workbench';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
  declarations: [AppComponent],
  imports: [
    WorkbenchModule.forRoot({
      layout: (layout: WorkbenchLayout) => layout
        .addPart('left', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .25})
        .addView('todos', {partId: 'left', activateView: true}),
    }),
    RouterModule.forRoot([
      {path: '', loadComponent: () => import('./welcome/welcome.component')},
      {path: '', outlet: 'todos', loadComponent: () => import('./todos/todos.component')},
      {path: 'todos/:id', loadComponent: () => import('./todo/todo.component')},
    ], {useHash: true}),
    BrowserModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
