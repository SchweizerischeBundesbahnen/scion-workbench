/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SciSashDirective } from './sash.directive';

/**
 * Initializes {SashDirective} with the target {HTMLDivElement} and sash box direction.
 */
@Directive({selector: 'div[sciSashInitializer].sash'})
export class SciSashInitializerDirective implements OnChanges {

  @Input('sciSashInitializer') // tslint:disable-line:no-input-rename
  public sash: SciSashDirective;

  @Input('sciSashInitializerRowDirection') // tslint:disable-line:no-input-rename
  public rowDirection: boolean;

  constructor(private _host: ElementRef<HTMLDivElement>) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.sash.element = this._host.nativeElement;
    this.sash.rowDirection = this.rowDirection;
  }
}
