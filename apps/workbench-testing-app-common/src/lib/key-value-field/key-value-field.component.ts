/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, ElementRef, inject, linkedSignal, model, Signal, untracked, WritableSignal} from '@angular/core';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {applyEach, FormField, form, FormValueControl, required} from '@angular/forms/signals';

/**
 * Allows entering key-value pairs.
 */
@Component({
  selector: 'app-key-value-field',
  templateUrl: './key-value-field.component.html',
  styleUrls: ['./key-value-field.component.scss'],
  imports: [
    SciMaterialIconDirective,
    FormField,
  ],
  host: {
    '[attr.tabindex]': '-1',
  },
})
export class SciKeyValueFieldComponent implements FormValueControl<Record<string, unknown>> {

  public readonly value = model<Record<string, unknown>>({});

  protected readonly form = form(valueToModel(this.value), path => {
    applyEach(path, entryField => {
      required(entryField.key, {message: 'Key is required'});
    });
  });

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;

  constructor() {
    this.updateValueOnChange();
  }

  protected onRemove(index: number): void {
    this.form().value.update(entries => {
      const copy = [...entries];
      copy.splice(index, 1);
      return copy;
    });

    // Focus the component to not lose the focus when the remove button is removed from the DOM.
    // Otherwise, if used in a popup, the popup would be closed because no element is focused anymore.
    this._host.focus({preventScroll: true});
  }

  protected onAdd(): void {
    this.form().value.update(entries => entries.concat({key: '', value: ''}));
  }

  protected onClear(): void {
    this.form().value.set([]);
  }

  private updateValueOnChange(): void {
    effect(() => {
      const formValue = this.form().value();

      untracked(() => {
        if (this.form().dirty() && this.form().valid()) {
          this.value.set(modelToValue(formValue));
        }
      });
    });
  }
}

function valueToModel(value: Signal<Record<string, unknown>>): WritableSignal<Entry[]> {
  return linkedSignal<Record<string, unknown>, Entry[]>({
    source: value,
    computation: value => Object.entries(value).map(([key, value]) => ({key, value: `${value}`})),
  });
}

function modelToValue(model: Entry[]): Record<string, unknown> {
  return model.reduce((acc, {key, value}) => {
    return {...acc, [key]: value};
  }, {} as Record<string, unknown>);
}

interface Entry {
  key: string;
  value: string;
}
