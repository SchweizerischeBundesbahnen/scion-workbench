/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Injectable, Injector, Type } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MessageBoxService, WorkbenchView } from '@scion/workbench';
import { ActivatedRoute } from '@angular/router';
import { SciParamsEnterComponent } from '@scion/toolkit.internal/widgets';
import { InspectMessageBoxComponent } from '../inspect-message-box-provider/inspect-message-box.component';

const TITLE = 'title';
const CONTENT = 'content';
const COMPONENT = 'component';
const COMPONENT_INPUT = 'componentInput';
const SEVERITY = 'severity';
const MODALITY = 'modality';
const CONTENT_SELECTABLE = 'contentSelectable';
const CSS_CLASS = 'cssClass';
const ACTIONS = 'actions';
const VIEW_CONTEXT = 'viewContext';

@Component({
  selector: 'app-message-box-opener-page',
  templateUrl: './message-box-opener-page.component.html',
  styleUrls: ['./message-box-opener-page.component.scss'],
})
export class MessageBoxOpenerPageComponent {

  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly COMPONENT = COMPONENT;
  public readonly COMPONENT_INPUT = COMPONENT_INPUT;
  public readonly SEVERITY = SEVERITY;
  public readonly MODALITY = MODALITY;
  public readonly CONTENT_SELECTABLE = CONTENT_SELECTABLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly ACTIONS = ACTIONS;
  public readonly VIEW_CONTEXT = VIEW_CONTEXT;

  public form: FormGroup;

  public openError: string;
  public closeAction: string;

  constructor(formBuilder: FormBuilder,
              route: ActivatedRoute,
              view: WorkbenchView,
              private _messageBoxService: MessageBoxService,
              private _rootService: RootService) {
    view.title = route.snapshot.data['title'];
    view.heading = route.snapshot.data['heading'];
    view.cssClass = route.snapshot.data['cssClass'];

    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [CONTENT]: formBuilder.control(''),
      [COMPONENT]: formBuilder.control(''),
      [COMPONENT_INPUT]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [MODALITY]: formBuilder.control(''),
      [CONTENT_SELECTABLE]: formBuilder.control(false),
      [CSS_CLASS]: formBuilder.control(''),
      [ACTIONS]: formBuilder.array([]),
      [VIEW_CONTEXT]: formBuilder.control(true),
    });
  }

  public async onMessageBoxOpen(): Promise<void> {
    const unsetViewContext = (this.form.get(VIEW_CONTEXT).value === false);

    this.openError = null;
    this.closeAction = null;

    const messageBoxService = unsetViewContext ? this._rootService.rootInjector.get(MessageBoxService) : this._messageBoxService;

    await messageBoxService.open({
      title: this.restoreLineBreaks(this.form.get(TITLE).value) || undefined,
      content: (this.isUseComponent() ? this.parseComponentFromUI() : this.restoreLineBreaks(this.form.get(CONTENT).value)) || undefined,
      componentInput: (this.isUseComponent() ? this.form.get(COMPONENT_INPUT).value : undefined) || undefined,
      severity: this.form.get(SEVERITY).value || undefined,
      modality: this.form.get(MODALITY).value || undefined,
      contentSelectable: this.form.get(CONTENT_SELECTABLE).value || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || undefined,
      actions: SciParamsEnterComponent.toParamsDictionary(this.form.get(ACTIONS) as FormArray) || undefined,
    })
      .then(closeAction => this.closeAction = closeAction)
      .catch(error => this.openError = error);
  }

  private parseComponentFromUI(): Type<any> {
    switch (this.form.get(COMPONENT).value) {
      case 'inspect-message-box':
        return InspectMessageBoxComponent;
      default:
        throw Error(`[IllegalMessageBoxComponent] Message box component not supported: ${this.form.get(COMPONENT).value}`);
    }
  }

  public isUseComponent(): boolean {
    return !!this.form.get(COMPONENT).value;
  }

  /**
   * Restores line breaks as sanitized by the user agent.
   */
  private restoreLineBreaks(value: string): string {
    return value.replace(/\\n/g, '\n');
  }
}

@Injectable({providedIn: 'root'})
class RootService {

  constructor(public rootInjector: Injector) {
  }
}
