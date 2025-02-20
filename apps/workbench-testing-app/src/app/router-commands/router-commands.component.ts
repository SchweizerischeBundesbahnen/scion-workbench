/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef} from '@angular/core';
import {PRIMARY_OUTLET, Router, Routes, UrlSegmentGroup} from '@angular/router';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {UUID} from '@scion/toolkit/uuid';
import {Commands} from '@scion/workbench';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-router-commands',
  templateUrl: './router-commands.component.html',
  styleUrls: ['./router-commands.component.scss'],
  imports: [
    ReactiveFormsModule,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => RouterCommandsComponent)},
  ],
})
export class RouterCommandsComponent implements ControlValueAccessor {

  private _cvaChangeFn: (commands: Commands) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  protected routes: Routes;
  protected routeList = `route-list-${UUID.randomUUID()}`;
  protected formControl = this._formBuilder.control<string>('');

  constructor(private _router: Router, private _formBuilder: NonNullableFormBuilder) {
    this.routes = this._router.config;

    this.formControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.parse(this.formControl.value));
        this._cvaTouchedFn();
      });
  }

  private parse(value: string): Commands {
    if (value === '') {
      return [];
    }
    if (value === '/') {
      return ['/'];
    }

    const urlTree = this._router.parseUrl(value);
    const segmentGroup = urlTree.root.children[PRIMARY_OUTLET] as UrlSegmentGroup | undefined;
    if (!segmentGroup) {
      return []; // path syntax error
    }

    const commands = new Array<any>();
    segmentGroup.segments.forEach(segment => {
      if (segment.path) {
        commands.push(segment.path);
      }
      if (Object.keys(segment.parameters).length) {
        commands.push(segment.parameters);
      }
    });

    if (value.startsWith('/')) {
      commands.unshift('/');
    }

    return commands;
  }

  private stringify(commands: Commands | null | undefined): string {
    if (!commands?.length) {
      return '';
    }

    const urlTree = this._router.createUrlTree(commands);
    return urlTree.root.children[PRIMARY_OUTLET].segments.join('/');
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(commands: Commands | undefined | null): void {
    this.formControl.setValue(this.stringify(commands), {emitEvent: false});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (commands: Commands) => void): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: () => void): void {
    this._cvaTouchedFn = fn;
  }
}
