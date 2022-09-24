/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, Injectable, Injector, OnDestroy, Type} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {MessageBoxService} from '@scion/workbench';
import {SciParamsEnterComponent} from '@scion/components.internal/params-enter';
import {InspectMessageBoxComponent} from '../inspect-message-box-provider/inspect-message-box.component';
import {startWith, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

const TITLE = 'title';
const CONTENT = 'content';
const COMPONENT = 'component';
const COMPONENT_INPUT = 'componentInput';
const SEVERITY = 'severity';
const MODALITY = 'modality';
const CONTEXTUAL_VIEW_ID = 'contextualViewId';
const CONTENT_SELECTABLE = 'contentSelectable';
const CSS_CLASS = 'cssClass';
const COUNT = 'count';
const ACTIONS = 'actions';
const VIEW_CONTEXT = 'viewContext';

@Component({
  selector: 'app-message-box-opener-page',
  templateUrl: './message-box-opener-page.component.html',
  styleUrls: ['./message-box-opener-page.component.scss'],
})
export class MessageBoxOpenerPageComponent implements OnDestroy {

  public readonly TITLE = TITLE;
  public readonly CONTENT = CONTENT;
  public readonly COMPONENT = COMPONENT;
  public readonly COMPONENT_INPUT = COMPONENT_INPUT;
  public readonly SEVERITY = SEVERITY;
  public readonly MODALITY = MODALITY;
  public readonly CONTEXTUAL_VIEW_ID = CONTEXTUAL_VIEW_ID;
  public readonly CONTENT_SELECTABLE = CONTENT_SELECTABLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly COUNT = COUNT;
  public readonly ACTIONS = ACTIONS;
  public readonly VIEW_CONTEXT = VIEW_CONTEXT;

  private _destroy$ = new Subject<void>();

  public form: UntypedFormGroup;

  public openError: string;
  public closeAction: string;

  constructor(formBuilder: UntypedFormBuilder,
              private _messageBoxService: MessageBoxService,
              private _rootService: RootService) {
    this.form = formBuilder.group({
      [TITLE]: formBuilder.control(''),
      [CONTENT]: formBuilder.control(''),
      [COMPONENT]: formBuilder.control(''),
      [COMPONENT_INPUT]: formBuilder.control(''),
      [SEVERITY]: formBuilder.control(''),
      [MODALITY]: formBuilder.control(''),
      [CONTEXTUAL_VIEW_ID]: formBuilder.control(''),
      [CONTENT_SELECTABLE]: formBuilder.control(false),
      [CSS_CLASS]: formBuilder.control(''),
      [COUNT]: formBuilder.control(''),
      [ACTIONS]: formBuilder.array([]),
      [VIEW_CONTEXT]: formBuilder.control(true),
    });
    this.installContextualViewIdEnabler();
  }

  public async onMessageBoxOpen(): Promise<void> {
    const unsetViewContext = (this.form.get(VIEW_CONTEXT).value === false);

    this.openError = null;
    this.closeAction = null;

    const messageBoxService = unsetViewContext ? this._rootService.rootInjector.get(MessageBoxService) : this._messageBoxService;

    const messageBoxes = [];
    for (let index = 0; index < Number(this.form.get(COUNT).value || 1); index++) {
      messageBoxes.push(this.openMessageBox(messageBoxService, index));
    }
    await Promise.all(messageBoxes);
  }

  private openMessageBox(messageBoxService: MessageBoxService, index: number): Promise<any> {
    return messageBoxService.open({
      title: this.restoreLineBreaks(this.form.get(TITLE).value) || undefined,
      content: (this.isUseComponent() ? this.parseComponentFromUI() : this.restoreLineBreaks(this.form.get(CONTENT).value)) || undefined,
      componentInput: (this.isUseComponent() ? this.form.get(COMPONENT_INPUT).value : undefined) || undefined,
      severity: this.form.get(SEVERITY).value || undefined,
      modality: this.form.get(MODALITY).value || undefined,
      context: {
        viewId: this.form.get(CONTEXTUAL_VIEW_ID).value || undefined,
      },
      contentSelectable: this.form.get(CONTENT_SELECTABLE).value || undefined,
      cssClass: [`index-${index}`, ...(this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean) || [])],
      actions: SciParamsEnterComponent.toParamsDictionary(this.form.get(ACTIONS) as UntypedFormArray) || undefined,
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

  /**
   * Enables the field for setting a contextual view reference when choosing view modality.
   */
  private installContextualViewIdEnabler(): void {
    this.form.get(MODALITY).valueChanges
      .pipe(
        startWith(this.form.get(MODALITY).value as string),
        takeUntil(this._destroy$),
      )
      .subscribe(modality => {
        if (modality === 'view') {
          this.form.get(CONTEXTUAL_VIEW_ID).enable();
        }
        else {
          this.form.get(CONTEXTUAL_VIEW_ID).setValue('');
          this.form.get(CONTEXTUAL_VIEW_ID).disable();
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

@Injectable({providedIn: 'root'})
class RootService {

  constructor(public rootInjector: Injector) {
  }
}
