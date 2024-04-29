/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Input, OnInit} from '@angular/core';
import {WorkbenchDialog, WorkbenchDialogActionDirective, WorkbenchView} from '@scion/workbench';
import {ActivatedRoute, Router} from '@angular/router';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {JoinPipe} from '../common/join.pipe';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';

@Component({
  selector: 'app-view-info-dialog',
  templateUrl: './view-info-dialog.component.html',
  styleUrls: ['./view-info-dialog.component.scss'],
  standalone: true,
  imports: [
    SciFormFieldComponent,
    JoinPipe,
    WorkbenchDialogActionDirective,
    SciKeyValueComponent,
    NullIfEmptyPipe,
  ],
})
export class ViewInfoDialogComponent implements OnInit {

  /**
   * Activated route, or `undefined` if not navigated yet.
   */
  protected route: ActivatedRoute | undefined;

  @Input({required: true})
  public view!: WorkbenchView;

  constructor(private _router: Router, private _dialog: WorkbenchDialog) {
    this._dialog.title = 'View Info';
    this._dialog.size.minWidth = '32em';
  }

  public ngOnInit(): void {
    const route = this._router.routerState.root.children.find(route => route.outlet === this.view.id);
    this.route = route && resolveEffectiveRoute(route);
  }

  public onClose(): void {
    this._dialog.close();
  }
}

function resolveEffectiveRoute(route: ActivatedRoute): ActivatedRoute {
  return route.firstChild ? resolveEffectiveRoute(route.firstChild) : route;
}
