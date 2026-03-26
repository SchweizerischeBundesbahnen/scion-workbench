/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Injector, signal, WritableSignal} from '@angular/core';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {CanCloseRef, WorkbenchMenuService, WorkbenchMessageBoxService, WorkbenchRouter, WorkbenchView} from '@scion/workbench-client';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {interval, map, MonoTypeOperatorFunction, NEVER} from 'rxjs';
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
import {contributeMenu, Disposable, SciMenuService, SciToolbarComponent} from '@scion/sci-components/menu';

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
  private readonly _menuService = inject(SciMenuService);
  private readonly _workbenchMenuService = inject(WorkbenchMenuService);

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

    const bold = signal(false);
    contributeMenu('toolbar:testee', toolbar => toolbar
      .addToolbarItem({
        icon: 'format_bold', checked: bold, onSelect: () => {
          bold.update(bold => !bold);
        },
      }),
    )

    // setInterval(() => {
    //   console.log('>>> state', state());
    // }, 3000);

    const state = signal(false);
    contributeMenu('toolbar:testee', toolbar => toolbar
      .addToolbarItem({
        icon: 'play_circle',
        onSelect: () => {
          state.update(state => !state);
        },
      }),
    );
    //
    contributeMenu('toolbar:testee', toolbar => {
        console.log(`>>> DEVELOPER FACTORY FUNCTION [state=${state()}]`);
        if (state()) {
          toolbar.addToolbarItem('home', onSelect)
        }
      },
    )

    if (1 + 1) {
      return;
    }

    this.contributeToolbar();
    this.contributeClientMenu();
    this.contributeClientPartToolbar();
    this.contributeContextMenu();
  }

  protected contributionRef1: Disposable | undefined;
  protected contributionRef2: Disposable | undefined;
  protected toolbarVisible = true;
  private injector = inject(Injector);

  protected toggleToolbar(): void {
    this.toolbarVisible = !this.toolbarVisible;

  }

  protected toggleMenu1(): void {
    if (this.contributionRef1) {
      this.contributionRef1.dispose();
      this.contributionRef1 = undefined;
    }
    else {
      this.contributionRef1 = contributeMenu('toolbar:router-page', menu => {
          console.log('>>> factory contribute menu 1');
          menu
            .addToolbarItem('favorite', onSelect);
        }
        , {requiredContext: new Map().set('viewId', undefined), injector: this.injector});
    }
  }

  protected toggleMenu2(): void {
    if (this.contributionRef2) {
      this.contributionRef2.dispose();
      this.contributionRef2 = undefined;
    }
    else {
      this.contributionRef2 = contributeMenu('toolbar:router-page', menu => {
          console.log('>>> factory contribute menu 2');

          menu
            .addToolbarItem('train', onSelect);
        }
        , {requiredContext: new Map().set('viewId', undefined), injector: this.injector});
    }
  }

  private contributeClientMenu(): void {
    const label$ = interval(2000)
      .pipe(
        map(index => UUID.randomUUID()),
        startWith('initial'),
      );

    const injector = inject(Injector);

    this._workbenchMenuService.contributeMenu('toolbar:workbench.part', toolbar => toolbar,
      // .addToolbarItem('favorite', onSelect)
      // .addToolbarItem('home', onSelect)
      // .addToolbarItem('train', onSelect)
      // .addGroup(group => group
      //   .addToolbarItem({icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: toObservable(computed(() => flags().has('format_bold')), {injector}), onSelect: () => toggleMultiFlag(flags, 'format_bold')})
      // .addToolbarItem({icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: toObservable(computed(() => flags().has('format_italic')), {injector}), onSelect: () => toggleMultiFlag(flags, 'format_italic')})
      // .addToolbarItem({icon: 'format_underlined', checked: toObservable(computed(() => flags().has('format_underlined')), {injector}), onSelect: () => toggleMultiFlag(flags, 'format_underlined')})
      // .addToolbarItem({icon: 'strikethrough_s', checked: toObservable(computed(() => flags().has('strikethrough_s')), {injector}), onSelect: () => toggleMultiFlag(flags, 'strikethrough_s')}),
      // )
      //   .addMenu({icon: 'more_vert', visualMenuHint: false, menu: {filter: {placeholder: 'hello', notFoundText: 'nüd found'}}}, menu => menu
      //     .addGroup(group => group
      //       .addMenuItem({label: 'bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: toObservable(computed(() => flags().has('format_bold')), {injector}), onSelect: () => toggleMultiFlag(flags, 'format_bold')})
      //       .addMenuItem({
      //         label: 'italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: toObservable(computed(() => flags().has('format_italic')), {injector}), onSelect: () => {
      //           toggleMultiFlag(flags, 'format_italic')
      //           return true;
      //         },
      //       })
      //       .addMenuItem({label: 'underlined', icon: 'format_underlined', checked: toObservable(computed(() => flags().has('format_underlined')), {injector}), onSelect: () => toggleMultiFlag(flags, 'format_underlined')})
      //       .addMenuItem({label: 'strikethrough', icon: 'strikethrough_s', checked: toObservable(computed(() => flags().has('strikethrough_s')), {injector}), onSelect: () => toggleMultiFlag(flags, 'strikethrough_s')}),
      //     )
      //     .addMenuItem({
      //       label: label$, icon: 'article', accelerator: ['Ctrl', 'N'], onSelect: () => {
      //         console.log('>>> click');
      //         // return true;
      //       },
      //     })
      //     .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => onSelect()})
      //     .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => onSelect()})
      //     .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
      //       .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => onSelect()})
      //       .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()})
      //       .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
      //         .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], onSelect: () => onSelect()})
      //         .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], onSelect: () => onSelect()})
      //         .addMenuItem({label: 'Underline', icon: 'format_underlined', onSelect: () => onSelect()})
      //         .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', onSelect: () => onSelect()})
      //         .addMenu({label: 'Size', icon: 'format_bold'}, menu => menu
      //           .addMenuItem('Increase font size', () => onSelect())
      //           .addMenuItem('Decrease font size', () => onSelect()),
      //         ),
      //       ),
      //     ),
      //   ),
    )
  }

  private contributeClientPartToolbar(): void {
    // this._workbenchMenuService.contributeMenu('toolbar:workbench.part', toolbar => toolbar
    this._workbenchMenuService.contributeMenu('menu:workbench.part.additions', menu => menu
      .addMenu({icon: 'computer', label: 'Client', menu: {filter: {placeholder: 'hello', notFoundText: 'nüd found'}}}, menu => menu
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
    )
  }

  private contributeToolbar(): void {
    contributeMenu('toolbar:testee', toolbar => {
        toolbar.addToolbarItem({icon: 'settings', onSelect})
          .addGroup(group => group
            .addToolbarItem({icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: computed(() => flags().has('format_bold')), onSelect: () => toggleMultiFlag(flags, 'format_bold')})
            .addToolbarItem({icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: computed(() => flags().has('format_italic')), onSelect: () => toggleMultiFlag(flags, 'format_italic')})
            .addToolbarItem({icon: 'format_underlined', checked: computed(() => flags().has('format_underlined')), onSelect: () => toggleMultiFlag(flags, 'format_underlined')})
            .addToolbarItem({icon: 'strikethrough_s', checked: computed(() => flags().has('strikethrough_s')), onSelect: () => toggleMultiFlag(flags, 'strikethrough_s')}),
          )
          .addMenu({icon: 'folder'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: computed(() => flags().has('format_bold')), onSelect: () => toggleMultiFlag(flags, 'format_bold')})
            .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: computed(() => flags().has('format_italic')), onSelect: () => toggleMultiFlag(flags, 'format_italic')})
            .addMenuItem({label: 'Underline', icon: 'format_underlined', checked: computed(() => flags().has('format_underlined')), onSelect: () => toggleMultiFlag(flags, 'format_underlined')})
            .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', checked: computed(() => flags().has('strikethrough_s')), onSelect: () => toggleMultiFlag(flags, 'strikethrough_s')}),
          )
      },
    );

    // contributeMenu('toolbar:router-page', menu => menu
    //     .addToolbarItem('favorite', onSelect)
    //   , {requiredContext: new Map().set('viewId', undefined)});
    // contributeMenu('toolbar:router-page', menu => menu
    //     .addToolbarItem('cancel', onSelect)
    //   , {requiredContext: new Map().set('viewId', undefined)});

    if (1 + 1) {
      // return;
    }
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
      ),
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

  protected onContextMenuOpen(event: PointerEvent): void {
    this._menuService.open('menu:contextmenu', {anchor: event});
  }

  private contributeContextMenu(): void {
    contributeMenu('menu:contextmenu', (menu, context) => menu
      .addMenuItem({label: 'Expand All', disabled: context.get('partId') === 'part.d7b1190a', accelerator: ['Ctrl', 'NumPad', '+'], onSelect: onSelect})
      .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-'], onSelect: onSelect})
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')},
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F'], onSelect: () => console.log('>>> speed search (Ctrl + F)', context)}),
        )
        .addGroup(group => group
          .addMenu({label: 'View Mode'}, menu => menu
            .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned'), onSelect: () => viewMode.set('dock_pinned')})
            .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned'), onSelect: () => viewMode.set('dock_unpinned')})
            .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock'), onSelect: () => viewMode.set('unddock')})
            .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float'), onSelect: () => viewMode.set('float')})
            .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window'), onSelect: () => viewMode.set('window')}))
          .addMenu({label: 'Move To'}, menu => menu
            .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top'), onSelect: () => moveTo.set('left_top')})
            .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom'), onSelect: () => moveTo.set('left_bottom')})
            .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left'), onSelect: () => moveTo.set('bottom_left')})
            .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right'), onSelect: () => moveTo.set('bottom_right')})
            .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom'), onSelect: () => moveTo.set('right_bottom')})
            .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top'), onSelect: () => moveTo.set('right_top')}),
          )
          .addMenu({label: 'Resize'}, menu => menu
            .addMenuItem('Stretch to Left', onSelect)
            .addMenuItem('Stretch to Right', onSelect)
            .addMenuItem('Stretch to Top', onSelect)
            .addMenuItem('Stretch to Bottom', onSelect)
            .addMenuItem('Maximize Tool Window', onSelect),
          ),
        )
        .addMenuItem('Remove from Sidebar', onSelect),
      ),
    )
  }

  protected onContextMenuWorkbenchClientOpen(event: PointerEvent): void {
    this._workbenchMenuService.open('menu:contextmenu', {anchor: event});
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
