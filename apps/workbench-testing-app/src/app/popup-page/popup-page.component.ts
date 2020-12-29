/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopupService, WorkbenchView } from '@scion/workbench';
import { ActivatedRoute } from '@angular/router';
import { PopupComponent } from './popup/popup.component';

const POSITION = 'position';
const INPUT = 'input';
const CSS_CLASS = 'cssClass';
const CLOSE_STRATEGY = 'closeStrategy';
const ON_FOCUS_LOST = 'onFocusLost';
const ON_ESCAPE = 'onEscape';
const ON_LAYOUT_CHANGE = 'onLayoutChange';
const SIZE = 'size';
const MIN_HEIGHT = 'minHeight';
const HEIGHT = 'height';
const MAX_HEIGHT = 'maxHeight';
const MIN_WIDTH = 'minWidth';
const WIDTH = 'width';
const MAX_WIDTH = 'maxWidth';

@Component({
  selector: 'app-popup-page',
  templateUrl: './popup-page.component.html',
  styleUrls: ['./popup-page.component.scss'],
})
export class PopupPageComponent {

  public readonly POSITION = POSITION;
  public readonly INPUT = INPUT;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly CLOSE_STRATEGY = CLOSE_STRATEGY;
  public readonly ON_FOCUS_LOST = ON_FOCUS_LOST;
  public readonly ON_ESCAPE = ON_ESCAPE;
  public readonly ON_LAYOUT_CHANGE = ON_LAYOUT_CHANGE;
  public readonly SIZE = SIZE;
  public readonly MIN_HEIGHT = MIN_HEIGHT;
  public readonly HEIGHT = HEIGHT;
  public readonly MAX_HEIGHT = MAX_HEIGHT;
  public readonly MIN_WIDTH = MIN_WIDTH;
  public readonly WIDTH = WIDTH;
  public readonly MAX_WIDTH = MAX_WIDTH;

  public form: FormGroup;
  public returnValue: string;

  @ViewChild('open_button', {static: true})
  private _openButton: ElementRef<HTMLButtonElement>;

  constructor(private _popupService: PopupService,
              formBuilder: FormBuilder,
              route: ActivatedRoute,
              view: WorkbenchView) {
    view.title = route.snapshot.data['title'];
    view.heading = route.snapshot.data['heading'];
    view.cssClass = route.snapshot.data['cssClass'];

    this.form = formBuilder.group({
      [POSITION]: formBuilder.control(''),
      [INPUT]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
      [INPUT]: formBuilder.control(''),
      [CLOSE_STRATEGY]: formBuilder.group({
        [ON_FOCUS_LOST]: formBuilder.control(true),
        [ON_ESCAPE]: formBuilder.control(true),
        [ON_LAYOUT_CHANGE]: formBuilder.control(true),
      }),
      [SIZE]: formBuilder.group({
        [MIN_HEIGHT]: formBuilder.control(''),
        [HEIGHT]: formBuilder.control(''),
        [MAX_HEIGHT]: formBuilder.control(''),
        [MIN_WIDTH]: formBuilder.control(''),
        [WIDTH]: formBuilder.control(''),
        [MAX_WIDTH]: formBuilder.control(''),
      }),
    });
  }

  public async onOpen(): Promise<void> {
    this.returnValue = await this._popupService.open({
      component: PopupComponent,
      anchor: this._openButton,
      position: this.form.get(POSITION).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || undefined,
      closeStrategy: {
        onFocusLost: this.form.get([CLOSE_STRATEGY, ON_FOCUS_LOST]).value,
        onEscape: this.form.get([CLOSE_STRATEGY, ON_ESCAPE]).value,
        onLayoutChange: this.form.get([CLOSE_STRATEGY, ON_LAYOUT_CHANGE]).value,
      },
      minHeight: this.form.get([SIZE, MIN_HEIGHT]).value || undefined,
      height: this.form.get([SIZE, HEIGHT]).value || undefined,
      maxHeight: this.form.get([SIZE, MAX_HEIGHT]).value || undefined,
      minWidth: this.form.get([SIZE, MIN_WIDTH]).value || undefined,
      width: this.form.get([SIZE, WIDTH]).value || undefined,
      maxWidth: this.form.get([SIZE, MAX_WIDTH]).value || undefined,
    }, this.form.get(INPUT).value || undefined);
  }
}
