/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {CanCloseRef, WorkbenchMessageBoxService, WorkbenchRouter, WorkbenchView} from '@scion/workbench-client';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {MonoTypeOperatorFunction, NEVER} from 'rxjs';
import {finalize, startWith, take} from 'rxjs/operators';
import {APP_INSTANCE_ID} from '../app-instance-id';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {AsyncPipe, JsonPipe, Location} from '@angular/common';
import {AppendDataTypePipe, NullIfEmptyPipe, parseTypedObject} from 'workbench-testing-app-common';
import {SciViewportComponent} from '@scion/components/viewport';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {contributeMenu, SciToolbarComponent} from '@scion/sci-components/menu';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss'],
  imports: [
    AsyncPipe,
    JsonPipe,
    ReactiveFormsModule,
    AppendDataTypePipe,
    NullIfEmptyPipe,
    SciFormFieldComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
    SciViewportComponent,
    FormsModule,
    SciToolbarComponent,
  ],
})
export default class ViewPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(WorkbenchRouter);
  private readonly _messageBoxService = inject(WorkbenchMessageBoxService);

  protected readonly view = inject(WorkbenchView);
  protected readonly route = inject(ActivatedRoute);
  protected readonly location = inject(Location);
  protected readonly appInstanceId = inject(APP_INSTANCE_ID);
  protected readonly uuid = UUID.randomUUID();
  protected readonly focused = toSignal(inject(WorkbenchView).focused$, {initialValue: true});

  protected readonly form = this._formBuilder.group({
    title: this._formBuilder.control(''),
    heading: this._formBuilder.control(''),
    closable: this._formBuilder.control(true),
    confirmClosing: this._formBuilder.control(false),
    selfNavigation: this._formBuilder.group({
      params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      paramsHandling: this._formBuilder.control<'merge' | 'replace' | ''>(''),
      navigatePerParam: this._formBuilder.control(false),
    }),
  });

  constructor() {
    this.view.markDirty(NEVER.pipe(this.logCompletion('DirtyObservableComplete')));
    this.view.setClosable(this.form.controls.closable.valueChanges.pipe(this.logCompletion('ClosableObservableComplete')));

    this.installCanCloseGuard();
    this.installViewActiveStateLogger();
    this.installObservableCompletionLogger();
    this.view.signalReady();

    this.form.controls.title.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(title => this.view.setTitle(title));

    this.form.controls.heading.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(heading => this.view.setHeading(heading));

    this.view.capability$
      .pipe(
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe(capability => {
        console.debug(`[ViewCapability$::first] [component=ViewPageComponent@${this.uuid}, capabilityId=${capability.metadata!.id}]`);
      });

    this.contributeToolbar();
  }

  private contributeToolbar(): void {
    contributeMenu('menu:workbench.part.additions', menu => menu
      .addMenuItem({label: 'Home', icon: 'home', onSelect})
      .addMenuItem({label: 'Train', icon: 'train', onSelect}),
    );

    contributeMenu('toolbar:workbench.part', toolbar => toolbar
        .addToolbarItem('home', onSelect),
      // .addToolbarItem('train', onSelect),
    );

    const flags = signal(new Set<string>()
      .add('always_select_opened_element')
      .add('server_and_database_objects')
      .add('schema_objects')
      .add('object_elements')
      .add('use_natural_order_when_sorting')
      .add('single_object_levels')
      .add('generate_objects')
      .add('virtual_objects')
      .add('query_files')
      .add('format_italic')
      .add('single_object_levels'),
    );
    const viewMode = signal('dock_pinned');
    const moveTo = signal('left_top');

    contributeMenu('menu:workbench.part.additions', menu => menu
      .addMenu({label: 'File', menu: {filter: {placeholder: 'hello', notFoundText: 'nüd found'}}}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: ['Ctrl', 'N'], onSelect: () => onSelect()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => onSelect()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => onSelect()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()})
          .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], onSelect: () => onSelect()})
            .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], onSelect: () => onSelect()})
            .addMenuItem({label: 'Underline', icon: 'format_underlined', onSelect: () => onSelect()})
            .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', onSelect: () => onSelect()})
            .addMenu({label: 'Size', icon: 'format_bold'}, menu => menu
              .addMenuItem('Increase font size', () => onSelect())
              .addMenuItem('Decrease font size', () => onSelect()),
            ),
          ),
        ),
      ),
    );

    contributeMenu('toolbar:testee', toolbar => toolbar
      .addGroup(group => group
        .addGroup(group => group
          .addToolbarItem('lens_blur', () => onSelect())
          .addToolbarItem('lens_blur', () => onSelect())
          .addToolbarItem('lens_blur', () => onSelect()),
        ),
      )
      .addGroup(group => group
        .addToolbarItem({icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: computed(() => flags().has('format_bold')), onSelect: () => toggleMultiFlag(flags, 'format_bold')})
        .addToolbarItem({icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: computed(() => flags().has('format_italic')), onSelect: () => toggleMultiFlag(flags, 'format_italic')})
        .addToolbarItem({icon: 'format_underlined', checked: computed(() => flags().has('format_underlined')), onSelect: () => toggleMultiFlag(flags, 'format_underlined')})
        .addToolbarItem({icon: 'strikethrough_s', checked: computed(() => flags().has('strikethrough_s')), onSelect: () => toggleMultiFlag(flags, 'strikethrough_s')}),
      )
      .addMenu({label: 'File'}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: ['Ctrl', 'N'], onSelect: () => onSelect()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => onSelect()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => onSelect()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()}),
        )
        .addMenuItem({label: 'Download', icon: 'download', onSelect: () => onSelect()})
        .addMenuItem({label: 'Print', icon: 'print', onSelect: () => onSelect()}),
      )
      .addMenu({label: 'Edit', menu: {filter: {placeholder: 'Sueche...', notFoundText: 'Nüd gfunde.'}}}, menu => menu
        .addMenuItem({label: 'Undo', icon: 'undo', accelerator: ['Ctrl', 'Z'], onSelect: () => onSelect()})
        .addMenuItem({label: 'Redo', icon: 'redo', onSelect: () => onSelect()})
        .addMenuItem({label: 'Cut', icon: 'content_cut', accelerator: ['Ctrl', 'X'], onSelect: () => onSelect()})
        .addMenuItem({label: 'Copy', icon: 'content_copy', accelerator: ['Ctrl', 'C'], onSelect: () => onSelect()})
        .addMenuItem({label: 'Paste', icon: 'content_paste', accelerator: ['Ctrl', 'V'], onSelect: () => onSelect()})
        .addMenuItem({label: 'Find and replace', icon: 'find_replace', accelerator: ['Ctrl', 'F'], onSelect: () => onSelect()}),
      )
    );
  }

  private async confirmClosing(): Promise<boolean> {
    const action = await this._messageBoxService.open('Do you want to close this view?', {
      title: 'Confirm Close',
      actions: {yes: 'Yes', no: 'No', error: 'Throw Error'},
      cssClass: ['e2e-close-view', this.view.id],
    });

    if (action === 'error') {
      throw Error(`[CanCloseSpecError] Error in CanLoad of view '${this.view.id}'.`);
    }
    return action === 'yes';
  }

  protected onMarkDirty(dirty?: boolean): void {
    if (dirty === undefined) {
      this.view.markDirty();
    }
    else {
      this.view.markDirty(dirty);
    }
  }

  protected onSelfNavigate(): void {
    const selfNavigationGroup = this.form.controls.selfNavigation;
    const params = parseTypedObject(SciKeyValueFieldComponent.toDictionary(selfNavigationGroup.controls.params, false))!;
    const paramsHandling = selfNavigationGroup.controls.paramsHandling.value;

    if (selfNavigationGroup.controls.navigatePerParam.value) {
      Object.entries(params).forEach(([paramName, paramValue]) => {
        void this._router.navigate({}, {params: {[paramName]: paramValue}, paramsHandling: paramsHandling || undefined});
      });
    }
    else {
      void this._router.navigate({}, {params, paramsHandling: paramsHandling || undefined});
    }
  }

  private installCanCloseGuard(): void {
    let canCloseRef: CanCloseRef | undefined;

    this.form.controls.confirmClosing.valueChanges
      .pipe(
        startWith(this.form.controls.confirmClosing.value),
        takeUntilDestroyed(),
      )
      .subscribe(confirmClosing => {
        if (confirmClosing) {
          canCloseRef = this.view.canClose(() => this.confirmClosing());
        }
        else {
          canCloseRef?.dispose();
        }
      });
  }

  private installViewActiveStateLogger(): void {
    this.view.active$
      .pipe(takeUntilDestroyed())
      .subscribe(active => {
        if (active) {
          console.debug(`[ViewActivate] [component=ViewPageComponent@${this.uuid}]`);
        }
        else {
          console.debug(`[ViewDeactivate] [component=ViewPageComponent@${this.uuid}]`);
        }
      });
  }

  private installObservableCompletionLogger(): void {
    // Do not install `takeUntil` operator as it would complete the Observable as well.
    this.view.params$
      .pipe(this.logCompletion('ParamsObservableComplete'))
      .subscribe();
    this.view.capability$
      .pipe(this.logCompletion('CapabilityObservableComplete'))
      .subscribe();
    this.view.active$
      .pipe(this.logCompletion('ActiveObservableComplete'))
      .subscribe();
    this.view.focused$
      .pipe(this.logCompletion('FocusedObservableComplete'))
      .subscribe();
  }

  private logCompletion<T>(logPrefix: string): MonoTypeOperatorFunction<T> {
    return finalize(() => {
      console.debug(`[${logPrefix}] [component=ViewPageComponent@${this.uuid}]`);
    });
  }
}

function onSelect(): void {

}

function toggleMultiFlag(flags: WritableSignal<Set<string>>, flag: string): void {
  flags.update(flags => {
    const newFlags = new Set(flags);
    if (flags.has(flag)) {
      newFlags.delete(flag);
    }
    else {
      newFlags.add(flag);
    }
    return newFlags;
  });
}
