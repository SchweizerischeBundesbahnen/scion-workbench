/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, inject, OnDestroy, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Logger, LoggerNames} from '../logging';
import {NgClass} from '@angular/common';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {SciViewportComponent} from '@scion/components/viewport';
import {ɵWorkbenchDesktop} from './ɵworkbench-desktop.model';
import {OnAttach, OnDetach} from '../portal/wb-component-portal';

/**
 * Renders the workbench desktop, using a router-outlet to display desktop content.
 */
@Component({
  selector: 'wb-desktop',
  templateUrl: './workbench-desktop.component.html',
  styleUrls: ['./workbench-desktop.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    CdkTrapFocus,
    SciViewportComponent,
  ],
  hostDirectives: [
    NgClass,
  ],
})
export class WorkbenchDesktopComponent implements OnDestroy, OnAttach, OnDetach {

  protected readonly desktop = inject(ɵWorkbenchDesktop);

  private _viewport = viewChild.required(SciViewportComponent);
  private _logger = inject(Logger);
  private _scrollTop = 0;
  private _scrollLeft = 0;

  constructor() {
    this._logger.debug(() => `Constructing DesktopComponent`, LoggerNames.LIFECYCLE);
    this.addHostCssClasses();
  }

  /**
   * Method invoked after attached this component to the DOM.
   */
  public onAttach(): void {
    this._viewport().scrollTop = this._scrollTop;
    this._viewport().scrollLeft = this._scrollLeft;
  }

  /**
   * Method invoked before detaching this component from the DOM.
   */
  public onDetach(): void {
    this._scrollTop = this._viewport().scrollTop;
    this._scrollLeft = this._viewport().scrollLeft;
  }

  private addHostCssClasses(): void {
    const ngClass = inject(NgClass);
    effect(() => ngClass.ngClass = this.desktop.classList.asList());
  }

  public ngOnDestroy(): void {
    this._logger.debug(() => `Destroying DesktopComponent`, LoggerNames.LIFECYCLE);
  }
}

