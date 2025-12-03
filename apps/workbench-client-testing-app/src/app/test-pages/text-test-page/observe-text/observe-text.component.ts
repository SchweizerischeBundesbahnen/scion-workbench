/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchTextService} from '@scion/workbench-client';
import {Subscription} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {prune, RecordComponent} from 'workbench-testing-app-common';

@Component({
  selector: 'app-observe-text',
  templateUrl: './observe-text.component.html',
  styleUrl: './observe-text.component.scss',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    RecordComponent,
  ],
  host: {
    '[attr.data-state]': 'state()',
  },
})
export default class ObserveTextComponent {

  private readonly _workbenchTextService = inject(WorkbenchTextService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly appList = `app-list-${UUID.randomUUID()}`;
  protected readonly undefinedList = `autocomplete-list-${UUID.randomUUID()}`;
  protected text = signal<string | undefined>(undefined);
  protected state = signal<undefined | 'completed' | 'errored'>(undefined);
  protected subscription: Subscription | undefined;

  protected readonly form = this._formBuilder.group({
    translatable: this._formBuilder.control('', Validators.required),
    params: this._formBuilder.control<Record<string, string> | undefined>(undefined),
    provider: this._formBuilder.control('', Validators.required),
    ttl: this._formBuilder.control<number>(0),
  });

  protected onObserve(): void {
    const translatable = this.form.controls.translatable.value;
    const params = this.form.controls.params.value;
    const provider = this.form.controls.provider.value;
    const ttl = this.form.controls.ttl.value || undefined;

    this.subscription = this._workbenchTextService.text$(translatable, {params: prune(params), provider, ttl})
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: text => this.text.set(text ?? '<undefined>'),
        complete: () => this.state.set('completed'),
        error: () => this.state.set('errored'),
      });
    this.form.disable();
  }

  protected onCancel(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.text.set(undefined);
    this.state.set(undefined);
    this.form.enable();
  }
}
