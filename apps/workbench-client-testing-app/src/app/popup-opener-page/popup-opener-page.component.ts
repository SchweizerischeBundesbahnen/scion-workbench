/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {CloseStrategy, WorkbenchPopupService} from '@scion/workbench-client';
import {SciParamsEnterComponent} from '@scion/components.internal/params-enter';
import {undefinedIfEmpty} from '../util/util';
import {defer, Observable} from 'rxjs';
import {PopupOrigin} from '@scion/workbench-client';
import {map, startWith} from 'rxjs/operators';

const QUALIFIER = 'qualifier';
const PARAMS = 'params';
const ANCHOR = 'anchor';
const BINDING = 'binding';
const ALIGN = 'align';
const CLOSE_STRATEGY = 'closeStrategy';
const ON_FOCUS_LOST = 'onFocusLost';
const ON_ESCAPE = 'onEscape';
const X = 'x';
const Y = 'y';
const HEIGHT = 'height';
const WIDTH = 'width';

interface AnchorFormGroup {
  x: string;
  y: string;
  width: string;
  height: string;
}

@Component({
  selector: 'app-popup-opener-page',
  templateUrl: './popup-opener-page.component.html',
  styleUrls: ['./popup-opener-page.component.scss'],
})
export class PopupOpenerPageComponent implements AfterViewInit {

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly ANCHOR = ANCHOR;
  public readonly BINDING = BINDING;
  public readonly ALIGN = ALIGN;
  public readonly CLOSE_STRATEGY = CLOSE_STRATEGY;
  public readonly ON_FOCUS_LOST = ON_FOCUS_LOST;
  public readonly ON_ESCAPE = ON_ESCAPE;
  public readonly HEIGHT = HEIGHT;
  public readonly WIDTH = WIDTH;
  public readonly X = X;
  public readonly Y = Y;

  private _coordinateAnchor$: Observable<PopupOrigin>;

  public form: UntypedFormGroup;

  public popupError: string;
  public returnValue: string;

  @ViewChild('open_button', {static: true})
  private _openButton: ElementRef<HTMLButtonElement>;

  constructor(private _host: ElementRef<HTMLElement>,
              private _popupService: WorkbenchPopupService,
              formBuilder: UntypedFormBuilder) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([
        new UntypedFormGroup({
          paramName: new UntypedFormControl('component'),
          paramValue: new UntypedFormControl('popup'),
        }),
        new UntypedFormGroup({
            paramName: new UntypedFormControl('app'),
            paramValue: new UntypedFormControl('app1'),
          },
        )], Validators.required),
      [PARAMS]: formBuilder.array([]),
      [ANCHOR]: formBuilder.group({
        [BINDING]: formBuilder.control('element', Validators.required),
        [X]: formBuilder.control('0'),
        [Y]: formBuilder.control('0'),
        [WIDTH]: formBuilder.control('0'),
        [HEIGHT]: formBuilder.control('0'),
      }),
      [ALIGN]: formBuilder.control(''),
      [CLOSE_STRATEGY]: formBuilder.group({
        [ON_FOCUS_LOST]: formBuilder.control(true),
        [ON_ESCAPE]: formBuilder.control(true),
      }),
    });

    this._coordinateAnchor$ = defer(() => this.form.get(ANCHOR)
      .valueChanges
      .pipe(
        startWith<AnchorFormGroup>(this.form.get(ANCHOR).value as AnchorFormGroup),
        map(anchorValue => ({
            x: Number(anchorValue.x),
            y: Number(anchorValue.y),
            width: Number(anchorValue.width),
            height: Number(anchorValue.height),
          }),
        ),
      ));
  }

  public ngAfterViewInit(): void {
    const {left, top, width, height} = this._host.nativeElement.getBoundingClientRect();
    this.form.get(ANCHOR).patchValue({
      [X]: left + width / 2,
      [Y]: top + height / 2,
    });
  }

  public async onPopupOpen(): Promise<void> {
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as UntypedFormArray);

    this.popupError = null;
    this.returnValue = null;

    await this._popupService.open<string>(qualifier, {
      params,
      anchor: this.form.get([ANCHOR, BINDING]).value === 'element' ? this._openButton.nativeElement : this._coordinateAnchor$,
      align: this.form.get(ALIGN).value || undefined,
      closeStrategy: undefinedIfEmpty<CloseStrategy>({
        onFocusLost: this.form.get([CLOSE_STRATEGY, ON_FOCUS_LOST]).value ?? undefined,
        onEscape: this.form.get([CLOSE_STRATEGY, ON_ESCAPE]).value ?? undefined,
      }),
    })
      .then(result => this.returnValue = result)
      .catch(error => this.popupError = error ?? 'Popup was closed with an error');
  }
}
