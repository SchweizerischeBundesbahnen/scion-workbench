/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, Signal} from '@angular/core';
import {WorkbenchDialog, WorkbenchDialogActionDirective, WorkbenchView} from '@scion/workbench';
import {ActivatedRoute, Router} from '@angular/router';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {JoinPipe} from '../common/join.pipe';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-view-info-dialog',
  templateUrl: './view-info-dialog.component.html',
  styleUrls: ['./view-info-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciFormFieldComponent,
    JoinPipe,
    WorkbenchDialogActionDirective,
    SciKeyValueComponent,
    NullIfEmptyPipe,
    FormsModule,
  ],
})
export class ViewInfoDialogComponent {

  public readonly view = input.required<WorkbenchView>();

  private readonly _router = inject(Router);
  private readonly _dialog = inject(WorkbenchDialog);

  /**
   * Activated route, or `undefined` if not navigated yet.
   */
  protected route = this.computeRoute();

  constructor() {
    this._dialog.title = 'View Info';
    this._dialog.size.minWidth = '32em';
  }

  protected onClose(): void {
    this._dialog.close();
  }

  private computeRoute(): Signal<ActivatedRoute | undefined> {
    return computed(() => {
      const route = this._router.routerState.root.children.find(route => route.outlet === this.view().id);
      return route && resolveEffectiveRoute(route);
    });
  }
}

function resolveEffectiveRoute(route: ActivatedRoute): ActivatedRoute {
  return route.firstChild ? resolveEffectiveRoute(route.firstChild) : route;
}
