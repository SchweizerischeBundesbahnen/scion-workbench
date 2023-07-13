/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, Component, Type} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MessageBoxService} from '@scion/workbench';
import {SciParamsEnterComponent, SciParamsEnterModule} from '@scion/components.internal/params-enter';
import {InspectMessageBoxComponent} from '../inspect-message-box-provider/inspect-message-box.component';
import {startWith} from 'rxjs/operators';
import {NgIf} from '@angular/common';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {stringifyError} from '../common/stringify-error.util';

@Component({
  selector: 'app-message-box-opener-page',
  templateUrl: './message-box-opener-page.component.html',
  styleUrls: ['./message-box-opener-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldModule,
    SciParamsEnterModule,
    SciCheckboxModule,
  ],
})
export default class MessageBoxOpenerPageComponent {

  public form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    content: this._formBuilder.control(''),
    component: this._formBuilder.control(''),
    componentInput: this._formBuilder.control(''),
    severity: this._formBuilder.control<'info' | 'warn' | 'error' | ''>(''),
    modality: this._formBuilder.control<'application' | 'view' | ''>(''),
    contextualViewId: this._formBuilder.control(''),
    contentSelectable: this._formBuilder.control(false),
    cssClass: this._formBuilder.control(''),
    count: this._formBuilder.control(''),
    actions: this._formBuilder.array([]),
    viewContext: this._formBuilder.control(true),
  });
  public openError: string | undefined;
  public closeAction: string | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _messageBoxService: MessageBoxService,
              private _appRef: ApplicationRef) {
    this.installContextualViewIdEnabler();
  }

  public async onMessageBoxOpen(): Promise<void> {
    const unsetViewContext = !this.form.controls.viewContext.value;

    this.openError = undefined;
    this.closeAction = undefined;

    const messageBoxService = unsetViewContext ? this._appRef.injector.get(MessageBoxService) : this._messageBoxService;

    const messageBoxes = [];
    for (let index = 0; index < Number(this.form.controls.count.value || 1); index++) {
      messageBoxes.push(this.openMessageBox(messageBoxService, index));
    }
    await Promise.all(messageBoxes);
  }

  private openMessageBox(messageBoxService: MessageBoxService, index: number): Promise<any> {
    return messageBoxService.open({
      title: this.restoreLineBreaks(this.form.controls.title.value) || undefined,
      content: this.isUseComponent() ? this.parseComponentFromUI() : this.restoreLineBreaks(this.form.controls.content.value),
      componentInput: (this.isUseComponent() ? this.form.controls.componentInput.value : undefined) || undefined,
      severity: this.form.controls.severity.value || undefined,
      modality: this.form.controls.modality.value || undefined,
      context: {
        viewId: this.form.controls.contextualViewId.value || undefined,
      },
      contentSelectable: this.form.controls.contentSelectable.value || undefined,
      cssClass: [`index-${index}`].concat(this.form.controls.cssClass.value.split(/\s+/).filter(Boolean) || []),
      actions: SciParamsEnterComponent.toParamsDictionary(this.form.controls.actions) || undefined,
    })
      .then(closeAction => this.closeAction = closeAction)
      .catch(error => this.openError = stringifyError(error));
  }

  private parseComponentFromUI(): Type<InspectMessageBoxComponent> {
    switch (this.form.controls.component.value) {
      case 'inspect-message-box':
        return InspectMessageBoxComponent;
      default:
        throw Error(`[IllegalMessageBoxComponent] Message box component not supported: ${this.form.controls.component.value}`);
    }
  }

  public isUseComponent(): boolean {
    return !!this.form.controls.component.value;
  }

  /**
   * Restores line breaks as sanitized by the user agent.
   */
  private restoreLineBreaks(value: string): string {
    return value.replace(/\\n/g, '\n');
  }

  /**
   * Enables the field for setting a contextual view reference when choosing view modality.
   */
  private installContextualViewIdEnabler(): void {
    this.form.controls.modality.valueChanges
      .pipe(
        startWith(this.form.controls.modality.value),
        takeUntilDestroyed(),
      )
      .subscribe(modality => {
        if (modality === 'view') {
          this.form.controls.contextualViewId.enable();
        }
        else {
          this.form.controls.contextualViewId.setValue('');
          this.form.controls.contextualViewId.disable();
        }
      });
  }
}
