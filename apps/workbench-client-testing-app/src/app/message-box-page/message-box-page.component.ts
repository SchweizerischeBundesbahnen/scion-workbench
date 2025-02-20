/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding} from '@angular/core';
import {WorkbenchMessageBox} from '@scion/workbench-client';
import {UUID} from '@scion/toolkit/uuid';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NullIfEmptyPipe} from '../common/null-if-empty.pipe';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {PreferredSizeService} from '@scion/microfrontend-platform';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {startWith} from 'rxjs/operators';

@Component({
  selector: 'app-message-box-page',
  templateUrl: './message-box-page.component.html',
  styleUrls: ['./message-box-page.component.scss'],
  imports: [
    AsyncPipe,
    JsonPipe,
    FormsModule,
    NullIfEmptyPipe,
    ReactiveFormsModule,
    SciViewportComponent,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    SciCheckboxComponent,
  ],
})
export default class MessageBoxPageComponent {

  protected uuid = UUID.randomUUID();

  protected form = this._formBuilder.group({
    height: this._formBuilder.control(''),
    width: this._formBuilder.control(''),
    positionAbsolute: this._formBuilder.control(false),
    reportSize: this._formBuilder.control(true),
  });

  @HostBinding('style.width')
  protected get width(): string {
    return this.form.controls.width.value;
  }

  @HostBinding('style.height')
  protected get height(): string {
    return this.form.controls.height.value;
  }

  @HostBinding('style.position')
  protected get position(): string {
    // This component contains expandable panels that can grow and shrink.
    // If positioned absolutely (out of document flow) it can always be rendered at its preferred size
    // thus allowing it to shrink when an accordion is collapsed.
    return this.form.controls.positionAbsolute.value ? 'absolute' : 'static';
  }

  constructor(private _host: ElementRef<HTMLElement>,
              private _preferredSizeService: PreferredSizeService,
              private _formBuilder: NonNullableFormBuilder,
              protected route: ActivatedRoute,
              protected messageBox: WorkbenchMessageBox) {
    this.installPreferredSizeReporter();

    messageBox.signalReady();
  }

  /**
   * Reports the size of this component to size the message box.
   */
  private installPreferredSizeReporter(): void {
    this.form.controls.reportSize.valueChanges
      .pipe(
        startWith(this.form.controls.reportSize.value),
        takeUntilDestroyed(),
      )
      .subscribe(reportSize => {
        this._preferredSizeService.fromDimension(reportSize ? this._host.nativeElement : undefined);
      });
  }
}
