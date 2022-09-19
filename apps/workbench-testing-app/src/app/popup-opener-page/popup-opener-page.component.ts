/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AfterViewInit, Component, ElementRef, OnDestroy, Type, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CloseStrategy, PopupOrigin, PopupService, PopupSize, WorkbenchView} from '@scion/workbench';
import {ActivatedRoute} from '@angular/router';
import {PopupPageComponent} from '../popup-page/popup-page.component';
import {PopupFocusPageComponent} from '../popup-focus-page/popup-focus-page.component';
import {map, startWith, takeUntil} from 'rxjs/operators';
import {defer, Observable, Subject} from 'rxjs';

const POPUP_COMPONENT = 'popupComponent';
const ANCHOR = 'anchor';
const BINDING = 'binding';
const CONTEXTUAL_VIEW_ID = 'contextualViewId';
const ALIGN = 'align';
const INPUT = 'input';
const CSS_CLASS = 'cssClass';
const CLOSE_STRATEGY = 'closeStrategy';
const ON_FOCUS_LOST = 'onFocusLost';
const ON_ESCAPE = 'onEscape';
const SIZE = 'size';
const MIN_HEIGHT = 'minHeight';
const HEIGHT = 'height';
const MAX_HEIGHT = 'maxHeight';
const MIN_WIDTH = 'minWidth';
const WIDTH = 'width';
const MAX_WIDTH = 'maxWidth';
const X = 'x';
const Y = 'y';

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
export class PopupOpenerPageComponent implements OnDestroy, AfterViewInit {

  public readonly POPUP_COMPONENT = POPUP_COMPONENT;
  public readonly ANCHOR = ANCHOR;
  public readonly BINDING = BINDING;
  public readonly CONTEXTUAL_VIEW_ID = CONTEXTUAL_VIEW_ID;
  public readonly ALIGN = ALIGN;
  public readonly INPUT = INPUT;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly CLOSE_STRATEGY = CLOSE_STRATEGY;
  public readonly ON_FOCUS_LOST = ON_FOCUS_LOST;
  public readonly ON_ESCAPE = ON_ESCAPE;
  public readonly SIZE = SIZE;
  public readonly MIN_HEIGHT = MIN_HEIGHT;
  public readonly HEIGHT = HEIGHT;
  public readonly MAX_HEIGHT = MAX_HEIGHT;
  public readonly MIN_WIDTH = MIN_WIDTH;
  public readonly WIDTH = WIDTH;
  public readonly MAX_WIDTH = MAX_WIDTH;
  public readonly X = X;
  public readonly Y = Y;

  private _destroy$ = new Subject<void>();
  private _coordinateAnchor$: Observable<PopupOrigin>;

  public form: UntypedFormGroup;

  public popupError: string;
  public returnValue: string;

  @ViewChild('open_button', {static: true})
  private _openButton: ElementRef<HTMLButtonElement>;

  constructor(private _host: ElementRef<HTMLElement>,
              private _popupService: PopupService,
              formBuilder: UntypedFormBuilder,
              route: ActivatedRoute,
              view: WorkbenchView) {
    view.title = route.snapshot.data['title'];
    view.heading = route.snapshot.data['heading'];

    this.form = formBuilder.group({
      [POPUP_COMPONENT]: formBuilder.control('popup-page', Validators.required),
      [ANCHOR]: formBuilder.group({
        [BINDING]: formBuilder.control('element', Validators.required),
        [X]: formBuilder.control('0'),
        [Y]: formBuilder.control('0'),
        [WIDTH]: formBuilder.control('0'),
        [HEIGHT]: formBuilder.control('0'),
      }),
      [CONTEXTUAL_VIEW_ID]: formBuilder.control({disabled: true, value: ''}),
      [ALIGN]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
      [INPUT]: formBuilder.control(''),
      [CLOSE_STRATEGY]: formBuilder.group({
        [ON_FOCUS_LOST]: formBuilder.control(true),
        [ON_ESCAPE]: formBuilder.control(true),
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
    this.installContextualViewIdEnabler();

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

  public async onOpen(): Promise<void> {
    this.popupError = null;
    this.returnValue = null;

    await this._popupService.open<string>({
      component: this.parsePopupComponentInput(),
      input: this.form.get(INPUT).value || undefined,
      anchor: this.form.get([ANCHOR, BINDING]).value === 'element' ? this._openButton : this._coordinateAnchor$,
      align: this.form.get(ALIGN).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || undefined,
      closeStrategy: undefinedIfEmpty<CloseStrategy>({
        onFocusLost: this.form.get([CLOSE_STRATEGY, ON_FOCUS_LOST]).value ?? undefined,
        onEscape: this.form.get([CLOSE_STRATEGY, ON_ESCAPE]).value ?? undefined,
      }),
      size: undefinedIfEmpty<PopupSize>({
        width: this.form.get([SIZE, WIDTH]).value || undefined,
        height: this.form.get([SIZE, HEIGHT]).value || undefined,
        minWidth: this.form.get([SIZE, MIN_WIDTH]).value || undefined,
        maxWidth: this.form.get([SIZE, MAX_WIDTH]).value || undefined,
        minHeight: this.form.get([SIZE, MIN_HEIGHT]).value || undefined,
        maxHeight: this.form.get([SIZE, MAX_HEIGHT]).value || undefined,
      }),
      context: {
        viewId: this.parseContextualViewIdInput(),
      },
    })
      .then(result => this.returnValue = result)
      .catch(error => this.popupError = error ?? 'Popup was closed with an error');
  }

  private parsePopupComponentInput(): Type<any> {
    switch (this.form.get(POPUP_COMPONENT).value) {
      case 'popup-page':
        return PopupPageComponent;
      case 'popup-focus-page':
        return PopupFocusPageComponent;
      default:
        throw Error(`[IllegalPopupComponent] Popup component not supported: ${this.form.get(POPUP_COMPONENT).value}`);
    }
  }

  private parseContextualViewIdInput(): string | null | undefined {
    const viewId = this.form.get(CONTEXTUAL_VIEW_ID).value;
    switch (viewId) {
      case '':
        return undefined;
      case '<null>':
        return null;
      default:
        return viewId;
    }
  }

  /**
   * Enables the field for setting a contextual view reference when choosing not to close the popup on focus loss.
   */
  private installContextualViewIdEnabler(): void {
    this.form.get([CLOSE_STRATEGY, ON_FOCUS_LOST]).valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(closeOnFocusLost => {
        if (closeOnFocusLost) {
          this.form.get(CONTEXTUAL_VIEW_ID).setValue('');
          this.form.get(CONTEXTUAL_VIEW_ID).disable();
        }
        else {
          this.form.get(CONTEXTUAL_VIEW_ID).enable();
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Returns a new instance with `undefined` entries removed,
 * or returns `undefined` if all entries are `undefined`.
 */
function undefinedIfEmpty<T>(object: T): T {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }
    return {...acc, [key]: value};
  }, undefined as T);
}
