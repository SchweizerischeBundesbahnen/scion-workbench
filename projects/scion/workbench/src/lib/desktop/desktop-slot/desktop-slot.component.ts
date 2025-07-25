/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DOCUMENT, ElementRef, inject, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {OnAttach, OnDetach} from '../../portal/wb-component-portal';
import {trackFocus} from '../../focus/workbench-focus-tracker.service';
import {WorkbenchDesktop} from '../workbench-desktop.model';
import {NgTemplateOutlet} from '@angular/common';
import {Logger} from '../../logging';

/**
 * Acts as a placeholder for the desktop content.
 */
@Component({
  selector: 'wb-desktop-slot',
  templateUrl: './desktop-slot.component.html',
  styleUrl: './desktop-slot.component.scss',
  imports: [
    RouterOutlet,
    SciViewportComponent,
    NgTemplateOutlet,
  ],
})
export class DesktopSlotComponent implements OnAttach, OnDetach {

  protected readonly desktop = inject(WorkbenchDesktop);

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _viewport = viewChild.required(SciViewportComponent);
  private readonly _logger = inject(Logger);

  private _scrollTop = 0;
  private _scrollLeft = 0;
  private _activeElementBeforeDetach: HTMLElement | undefined;

  constructor() {
    trackFocus(this._host, null);
  }

  /**
   * Method invoked after attached this component to the DOM.
   */
  public onAttach(): void {
    this._viewport().scrollTop = this._scrollTop;
    this._viewport().scrollLeft = this._scrollLeft;

    this._activeElementBeforeDetach?.focus();
    this._activeElementBeforeDetach = undefined;
  }

  /**
   * Method invoked before detaching this component from the DOM.
   */
  public onDetach(): void {
    this._scrollTop = this._viewport().scrollTop;
    this._scrollLeft = this._viewport().scrollLeft;

    const activeElement = this._document.activeElement;
    if (this._host.contains(activeElement) && activeElement instanceof HTMLElement) {
      this._activeElementBeforeDetach = activeElement;
    }
  }

  protected onLegacyDesktopActivate(): void {
    this._logger.warn(`[Deprecation] The configuration for displaying a start page in the workbench has changed. To migrate, navigate the main area part, or provide an '<ng-template>' with the 'wbDesktop' directive. Legacy support will be removed in version 21.`, `
      // Example for navigating the main area part to the empty-path route:
      
      import {bootstrapApplication} from '@angular/platform-browser';
      import {provideRouter} from '@angular/router';
      import {canMatchWorkbenchPart, MAIN_AREA, provideWorkbench} from '@scion/workbench';
      
      bootstrapApplication(AppComponent, {
        providers: [
          provideWorkbench({
            layout: factory => factory
              .addPart(MAIN_AREA)
              .navigatePart(MAIN_AREA, [], {hint: 'desktop'})
          }),
          provideRouter([
            {
              path: '',
              component: DesktopComponent,
              canMatch: [canMatchWorkbenchPart('desktop')]
            }
          ])
        ],
      });

      Alternatively, or for layouts without a main area, provide a desktop using an '<ng-template>' with the 'wbDesktop' directive. The template content is used as the desktop content.

      <wb-workbench>
        <ng-template wbDesktop>
          Welcome
        </ng-template>
      </wb-workbench>
    `);
  }
}
