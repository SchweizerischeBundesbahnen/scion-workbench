/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Injector, signal} from '@angular/core';
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
import {APP_SYMBOLIC_NAME} from '../workbench-client/workbench-client.provider';
import {toggleMultiFlag} from '../app.component';

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
  private readonly _appSymbolicName = inject(APP_SYMBOLIC_NAME);
  private readonly _injector = inject(Injector);

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

    // const label = signal(UUID.randomUUID());
    //
    // setInterval(() => {
    //   label.set(UUID.randomUUID());
    // }, 2000);

    // contributeMenu('toolbar:workbench.part.tools.start', menu => menu
    //   .addMenu({label: 'testee', name: 'menu:abc'}, menu => menu
    //     .addMenuItem({label: 'blubber', icon: 'article', accelerator: ['Ctrl', 'N']}, () => this.onAction())));

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
      .add('format_idtalic')
      .add('single_object_levels'),
    );
    const paragraphStyle = signal<string>('');

    // contributeMenu('toolbar:main', toolbar => toolbar
    //   .addMenu({id: 'menu:additions', label: 'submenu'}, menu => menu
    //     // .filterable(true)
    //     .addMenuItem({label: 'click me 1'}, () => this.onAction())
    //     .addMenuItem({label: 'click me 2'}, () => this.onAction()),
    //   ),
    // );
    //
    // contributeMenu('toolbar:main', toolbar => toolbar
    //   .addMenu({icon: 'account_circle', label: 'user-menu', menu: {filter: true}}, menu => menu
    //     .addGroup({label: 'Gruppe', collapsible: {collapsed: true}}, group => group
    //       .addMenuItem({label: 'Kapazitätsplaner'}, () => this.onAction())
    //       .addMenuItem({label: 'Administrator'}, () => this.onAction()),
    //     ),
    //   ),
    // );
    //
    // contributeMenu('toolbar:workbench.part.tools.end', toolbar => toolbar
    //   .addToolbarItem({icon: 'expand_all', tooltip: 'Expand Selected'}, () => this.onAction())
    //   .addToolbarItem({icon: 'collapse_all', tooltip: 'Collapse All'}, () => this.onAction()),
    // );
    //
    //
    //
    // contributeMenu({location: 'menu:share', after: 'menuitem:share-with-others'}, menu => menu
    //   .addMenuItem({label: 'Teams', icon: 'groups'}, () => {
    //   }),
    // );

    const label1 = signal(`label1: ${UUID.randomUUID()}`);
    const label2 = signal(UUID.randomUUID());

    const disabled = signal(false);

    setInterval(() => {
      disabled.update(disabled => !disabled);
      label1.set(`label1: ${UUID.randomUUID()}`);
      label2.set(`label2: ${UUID.randomUUID()}`);
    }, 2000);

    const menuRef = contributeMenu('toolbar:microfrontend-toolbar', menu => menu
      .addMenu({label: 'File', name: 'menu:blubber'}, menu => menu
        .addMenuItem({label: 'Microfrontend'}, () => this.onAction()),
      ));

    const menuRef1 = contributeMenu('menu:blubber', menu => menu.addMenuItem({label: label1}, () => this.onAction()), {injector: this._injector});
    //
    // // setTimeout(() => {
    // //   contributeMenu('menu:blubber', menu => menu.addMenuItem({label: label2}, () => this.onAction()), {injector: this._injector});
    // // }, 5000);
    //
    setTimeout(() => {
      console.log('>>> dispose menu1');
      menuRef1.dispose();
    }, 3000)

    if (1 + 1 === 2) {
      return;
    }

    contributeMenu('toolbar:workbench.part.tools.start', menu => menu
      .addMenu({label: 'File'}, menu => menu
        .addMenuItem({label: 'Outside Microfrontend', icon: 'article', accelerator: ['Ctrl', 'N'], disabled: true}, () => this.onAction()),
      ));

    contributeMenu('toolbar:workbench.part.tools.start', menu => menu
        // .addGroup(group => group
        .addMenu({label: 'Paragraph styles', tooltip: 'some tooltip', icon: 'format_align_justify', name: 'menu:paragraph'}, menu => {
            return menu
              .addMenuItem({label: 'Normal text', checked: computed(() => paragraphStyle() === 'normal')}, () => paragraphStyle.set('normal'))
            // .addMenuItem({label: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1')}, () => paragraphStyle.set('heading1'))
            // .addMenuItem({label: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2')}, () => paragraphStyle.set('heading2'))
          },
        ),
      // )
    );

    contributeMenu('toolbar:workbench.part.tools.start', menu => menu
      .addGroup(group => group
        .addToolbarItem({icon: 'lens_blur'}, () => this.onAction()),
      )
      .addMenu({label: 'File'}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: ['Ctrl', 'N']}, () => this.onAction())
        .addMenuItem({label: 'Open', icon: 'folder'}, () => this.onAction())
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy'}, () => this.onAction())
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others'}, () => this.onAction())
          .addMenuItem({label: 'Publish to web', icon: 'public'}, () => this.onAction()),
        )
        .addMenuItem({label: 'Download', icon: 'download'}, () => this.onAction())
        .addMenuItem({label: 'Print', icon: 'print'}, () => this.onAction()),
      )
      .addMenu({label: 'Edit', menu: {filter: {placeholder: 'Sueche...', notFoundText: 'Nüd gfunde.'}}}, menu => menu
        .addMenuItem({label: 'Undo', icon: 'undo', accelerator: ['Ctrl', 'Z']}, () => this.onAction())
        .addMenuItem({label: 'Redo', icon: 'redo'}, () => this.onAction())
        .addMenuItem({label: 'Cut', icon: 'content_cut', accelerator: ['Ctrl', 'X']}, () => this.onAction())
        .addMenuItem({label: 'Copy', icon: 'content_copy', accelerator: ['Ctrl', 'C']}, () => this.onAction())
        .addMenuItem({label: 'Paste', icon: 'content_paste', accelerator: ['Ctrl', 'V']}, () => this.onAction())
        .addMenuItem({label: 'Find and replace', icon: 'find_replace', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
      )
      .addGroup(group => group
        .addGroup(group => group
          .addToolbarItem({icon: 'lens_blur'}, () => this.onAction())
          .addToolbarItem({icon: 'lens_blur'}, () => this.onAction())
          .addToolbarItem({icon: 'lens_blur'}, () => this.onAction()),
        ),
      )
      .addGroup(group => group
        .addToolbarItem({icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: computed(() => flags().has('format_bold'))}, () => toggleMultiFlag(flags, 'format_bold'))
        .addToolbarItem({icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: computed(() => flags().has('format_italic'))}, () => toggleMultiFlag(flags, 'format_italic'))
        .addToolbarItem({icon: 'format_underlined', checked: computed(() => flags().has('format_underlined'))}, () => toggleMultiFlag(flags, 'format_underlined'))
        .addToolbarItem({icon: 'strikethrough_s', checked: computed(() => flags().has('strikethrough_s'))}, () => toggleMultiFlag(flags, 'strikethrough_s')),
      )
      .addGroup(group => group
        .addMenu({label: 'Menu 1', menu: {filter: true}}, menu => menu
          .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B']}, () => this.onAction())
            .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I']}, () => this.onAction())
            .addMenuItem({label: 'Underline', icon: 'format_underlined'}, () => this.onAction())
            .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s'}, () => this.onAction())
            .addMenu({label: 'Size', icon: 'format_bold'}, menu => menu
              .addMenuItem({label: 'Increase font size'}, () => this.onAction())
              .addMenuItem({label: 'Decrease font size'}, () => this.onAction()),
            ),
          )
          .addMenu({label: 'Paragraph styles', icon: 'format_align_justify', name: 'menu:paragraph'}, menu => {
              return menu
                .addMenuItem({label: 'Normal text', checked: computed(() => paragraphStyle() === 'normal')}, () => paragraphStyle.set('normal'))
                .addMenuItem({label: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1')}, () => paragraphStyle.set('heading1'))
                .addMenuItem({label: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2')}, () => paragraphStyle.set('heading2'))
            },
          )
          .addMenu({icon: 'format_bold', label: 'Align & indent', menu: {filter: true}}, menu => menu
            .addMenuItem({label: 'Align left', icon: 'format_align_left'}, () => this.onAction())
            .addMenuItem({label: 'Align center', icon: 'format_align_center'}, () => this.onAction())
            .addMenuItem({label: 'Align right', icon: 'format_align_right'}, () => this.onAction())
            .addMenuItem({label: 'Justify', icon: 'format_align_justify'}, () => this.onAction()),
          ),
        )
        .addMenu({label: 'Menu 2'}, menu => menu
          // .addGroup({label: 'Group 1'}, group => group
          //   .addMenuItem({text: 'Nested Menu Item'}, () => this.onAction())
          //   .addGroup({label: 'Group 2'}, group => group
          //     .addGroup({label: 'Group 3'}, group => group
          //       .addMenuItem({text: 'Nested Menu Item'}, () => this.onAction()),
          //     ),
          //   )
          .addGroup({label: 'Formatting', collapsible: true}, group => group
              .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
                .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B']}, () => this.onAction())
                .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I']}, () => this.onAction())
                .addMenuItem({label: 'Underline', icon: 'format_underlined'}, () => this.onAction())
                .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s'}, () => this.onAction())
                .addGroup({label: 'Size'}, menu => menu
                  .addMenuItem({label: 'Increase font size'}, () => this.onAction())
                  .addMenuItem({label: 'Decrease font size'}, () => this.onAction()),
                ),
              )
              // .addGroup(group => group
              .addMenu({label: 'Size', icon: 'format_size'}, menu => menu
                .addMenuItem({label: 'Increase font size'}, () => this.onAction())
                .addMenuItem({label: 'Decrease font size'}, () => this.onAction()),
              ),
            // ),
          )
          .addGroup(group => group
            .addMenu({label: 'Paragraph styles', icon: 'format_align_justify', name: 'menu:paragraph'}, menu => {
                return menu
                  .addMenuItem({label: 'Normal text', checked: computed(() => paragraphStyle() === 'normal')}, () => paragraphStyle.set('normal'))
                  .addMenuItem({label: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1')}, () => paragraphStyle.set('heading1'))
                  .addMenuItem({label: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2')}, () => paragraphStyle.set('heading2'))
              },
            ),
          )
          .addGroup(group => group
            .addMenu({label: 'Align & indent', icon: 'format_bold'}, menu => menu
              .addMenuItem({label: 'Align left', icon: 'format_align_left'}, () => this.onAction())
              .addMenuItem({label: 'Align center', icon: 'format_align_center'}, () => this.onAction())
              .addMenuItem({label: 'Align right', icon: 'format_align_right'}, () => this.onAction())
              .addMenuItem({label: 'Justify', icon: 'format_align_justify'}, () => this.onAction()),
            ),
          ),
        ),
      ),
    );

    //
    // contributeMenu('menu:paragraph', menu => menu
    //   .addMenuItem({label: 'Heading 3', checked: computed(() => paragraphStyle() === 'heading3')}, () => paragraphStyle.set('heading3')),
    // );
    //
    // contributeMenu('menu:paragraph', menu => menu
    //   .addMenu({label: 'SCION Developers'}, menu => menu
    //     .addMenuItem({label: 'Etienne'}, () => this.onAction())
    //     .addMenuItem({label: 'Marc'}, () => this.onAction())
    //     .addMenuItem({label: 'Konstantin'}, () => this.onAction())
    //     .addMenuItem({label: 'Dani'}, () => this.onAction()),
    //   ),
    // );
    //
    // contributeMenu('toolbar:workbench.part.tools.start', menu => menu
    //   .addMenu({label: 'Database', icon: 'database', menu: {filter: {placeholder: 'Type to filter'}}}, menu => menu
    //     // .addMenuItem({icon: 'filter_alt', text: 'Filter'}, () => this.onAction())
    //     .addGroup({label: 'View in Groups', collapsible: true}, group => group
    //       .addMenuItem({label: 'Databases and Schemas', checked: computed(() => flags().has('databases_and_schmemas'))}, () => toggleMultiFlag(flags, 'databases_and_schmemas'))
    //       .addMenuItem({label: 'Server and Database Objects', checked: computed(() => flags().has('server_and_database_objects'))}, () => toggleMultiFlag(flags, 'server_and_database_objects'))
    //       .addMenuItem({label: 'Schema Objects', checked: computed(() => flags().has('schema_objects'))}, () => toggleMultiFlag(flags, 'schema_objects'))
    //       .addMenuItem({label: 'Object Elements', checked: computed(() => flags().has('object_elements'))}, () => toggleMultiFlag(flags, 'object_elements'))
    //       .addGroup(group => group
    //         .addMenuItem({label: 'Separate Procedures and Functions', checked: computed(() => flags().has('separate_procedures_and_functions'))}, () => toggleMultiFlag(flags, 'separate_procedures_and_functions'))
    //         .addMenuItem({label: 'Place Table Elements Under Schema', checked: computed(() => flags().has('place_schema_elements_under_schema'))}, () => toggleMultiFlag(flags, 'place_schema_elements_under_schema'))
    //         .addMenuItem({label: 'Use Natural Order When Sorting', checked: computed(() => flags().has('use_natural_order_when_sorting'))}, () => toggleMultiFlag(flags, 'use_natural_order_when_sorting'))
    //         .addMenuItem({label: 'Sort folders and Data Sources', checked: computed(() => flags().has('sort_folders_and_data_sources'))}, () => toggleMultiFlag(flags, 'sort_folders_and_data_sources')),
    //       ),
    //     )
    //     .addGroup({label: 'Show Elements', collapsible: {collapsed: true}}, group => group
    //       .addMenuItem({label: 'All Namespaces', checked: computed(() => flags().has('all_namespaces'))}, () => toggleMultiFlag(flags, 'all_namespaces'))
    //       .addMenuItem({label: 'Empty Groups', checked: computed(() => flags().has('empty_groups'))}, () => toggleMultiFlag(flags, 'empty_groups'))
    //       .addMenuItem({label: 'Single-Object Levels', checked: computed(() => flags().has('single_object_levels'))}, () => toggleMultiFlag(flags, 'single_object_levels'))
    //       .addMenuItem({label: 'Generate Objects', checked: computed(() => flags().has('generate_objects'))}, () => toggleMultiFlag(flags, 'generate_objects'))
    //       .addMenuItem({label: 'Virtual Objects', checked: computed(() => flags().has('virtual_objects'))}, () => toggleMultiFlag(flags, 'virtual_objects'))
    //       .addMenuItem({label: 'Query Files', checked: computed(() => flags().has('query_files'))}, () => toggleMultiFlag(flags, 'query_files')),
    //     )
    //     .addGroup({label: 'Node Details'}, group => group
    //       .addMenuItem({label: 'Comments Instead of Details', checked: computed(() => flags().has('comments_instead_of_details'))}, () => toggleMultiFlag(flags, 'comments_instead_of_details'))
    //       .addMenuItem({label: 'Schema Refresh Time', checked: computed(() => flags().has('schema_refresh_time'))}, () => toggleMultiFlag(flags, 'schema_refresh_time'))
    //       .addMenuItem({label: 'Bold Folders and Data Sources', checked: computed(() => flags().has('bold_folders_and_data_sources'))}, () => toggleMultiFlag(flags, 'bold_folders_and_data_sources')),
    //     ),
    //   ),
    // );
    //
    // const viewMode = signal('dock_pinned');
    // const moveTo = signal('left_top');
    //
    // contributeMenu('toolbar:workbench.part.tools.end', menu => menu
    //   .addMenu({icon: 'visibility'}, menu => menu
    //     .addGroup({label: 'Sort'}, group => group
    //       .addMenuItem({label: 'Alphabetically', checked: computed(() => flags().has('alphabetically'))}, () => toggleMultiFlag(flags, 'alphabetically')),
    //     )
    //     .addGroup({label: 'Show'}, group => group
    //       .addMenuItem({label: 'Fields', checked: computed(() => flags().has('fields'))}, () => toggleMultiFlag(flags, 'fields'))
    //       .addMenuItem({label: 'Inherited', checked: computed(() => flags().has('inherited'))}, () => toggleMultiFlag(flags, 'inherited'))
    //       .addMenuItem({label: 'Inherited from Object', checked: computed(() => flags().has('inherited_from_object'))}, () => toggleMultiFlag(flags, 'inherited_from_object')),
    //     )
    //     .addGroup({label: 'Group'}, group => group
    //       .addMenuItem({label: 'Members by Defining Type', checked: computed(() => flags().has('member_by_defining_type'))}, () => toggleMultiFlag(flags, 'member_by_defining_type')),
    //     ),
    //   ),
    // );
    //
    // contributeMenu('toolbar:workbench.part.tools.end', menu => menu
    //   .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
    //     .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+']}, () => this.onAction())
    //     .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-']}, () => this.onAction())
    //     .addGroup(group => group
    //       .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click'))}, () => toggleMultiFlag(flags, 'navigate_with_single_click'))
    //       .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element'))}, () => toggleMultiFlag(flags, 'always_select_opened_element')),
    //     )
    //     .addGroup(group => group
    //       .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
    //     )
    //     .addGroup(group => group
    //       .addMenu({label: 'View Mode'}, menu => menu
    //         .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned')}, () => viewMode.set('dock_pinned'))
    //         .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned')}, () => viewMode.set('dock_unpinned'))
    //         .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock')}, () => viewMode.set('unddock'))
    //         .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float')}, () => viewMode.set('float'))
    //         .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window')}, () => viewMode.set('window')),
    //       )
    //       .addMenu({label: 'Move To'}, menu => menu
    //         .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top')}, () => moveTo.set('left_top'))
    //         .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom')}, () => moveTo.set('left_bottom'))
    //         .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left')}, () => moveTo.set('bottom_left'))
    //         .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right')}, () => moveTo.set('bottom_right'))
    //         .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom')}, () => moveTo.set('right_bottom'))
    //         .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top')}, () => moveTo.set('right_top')),
    //       )
    //       .addMenu({label: 'Resize'}, menu => menu
    //         .addMenuItem({label: 'Stretch to Left'}, () => this.onAction())
    //         .addMenuItem({label: 'Stretch to Right'}, () => this.onAction())
    //         .addMenuItem({label: 'Stretch to Top'}, () => this.onAction())
    //         .addMenuItem({label: 'Stretch to Bottom'}, () => this.onAction())
    //         .addMenuItem({label: 'Maximize Tool Window'}, () => this.onAction()),
    //       ),
    //     )
    //     .addMenuItem({label: 'Remove from Sidebar'}, () => this.onAction()),
    //   ),
    // );
    //
    // const perspective = signal<string>('sample_layout_docked_parts_1');
    // const perspectiveLabels = new Map<string, string>()
    //   .set('default_layout', 'Default Layout')
    //   .set('sample_layout_docked_parts_1', 'Sample Layout 1 (Docked Parts)')
    //   .set('sample_layout_docked_parts_2', 'Sample Layout 2 (Docked Parts)')
    //   .set('sample_layout_docked_parts_app_1', 'Sample Microfrontend Layout App 1 (Docked Parts)')
    //   .set('sample_layout_docked_parts_app_2', 'Sample Microfrontend Layout App 2 (Docked Parts)')
    //   .set('sample_layout_aligned_parts_1', 'Sample Layout 1 (Aligned Parts)')
    //   .set('sample_layout_aligned_parts_2', 'Sample Layout 2 (Aligned Parts)')
    //   .set('sample_layout_aligned_parts_app_1', 'Sample Microfrontend Layout App 1 (Aligned Parts)')
    //   .set('sample_layout_aligned_parts_app_2', 'Sample Microfrontend Layout App 2 (Aligned Parts)')
    //   .set('focus_test_perspective', 'Focus Test Perspective');
    //
    // contributeMenu('toolbar:perspective.menu', menu => menu
    //   .addToolbarItem({icon: 'undo', tooltip: 'Reset Perspective'}, () => console.log('>>> Reset default perspective'))
    //   .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
    //     .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+']}, () => this.onAction())
    //     .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-']}, () => this.onAction())
    //     .addGroup(group => group
    //       .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click'))}, () => toggleMultiFlag(flags, 'navigate_with_single_click'))
    //       .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element'))}, () => toggleMultiFlag(flags, 'always_select_opened_element')),
    //     )
    //     .addGroup(group => group
    //       .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
    //     )
    //     .addGroup(group => group
    //       .addMenu({label: 'View Mode'}, menu => menu
    //         .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned')}, () => viewMode.set('dock_pinned'))
    //         .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned')}, () => viewMode.set('dock_unpinned'))
    //         .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock')}, () => viewMode.set('unddock'))
    //         .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float')}, () => viewMode.set('float'))
    //         .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window')}, () => viewMode.set('window')),
    //       )
    //       .addMenu({label: 'Move To'}, menu => menu
    //         .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top')}, () => moveTo.set('left_top'))
    //         .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom')}, () => moveTo.set('left_bottom'))
    //         .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left')}, () => moveTo.set('bottom_left'))
    //         .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right')}, () => moveTo.set('bottom_right'))
    //         .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom')}, () => moveTo.set('right_bottom'))
    //         .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top')}, () => moveTo.set('right_top')),
    //       )
    //       .addMenu({label: 'Resize'}, menu => menu
    //         .addMenuItem({label: 'Stretch to Left'}, () => this.onAction())
    //         .addMenuItem({label: 'Stretch to Right'}, () => this.onAction())
    //         .addMenuItem({label: 'Stretch to Top'}, () => this.onAction())
    //         .addMenuItem({label: 'Stretch to Bottom'}, () => this.onAction())
    //         .addMenuItem({label: 'Maximize Tool Window'}, () => this.onAction()),
    //       ),
    //     )
    //     .addMenuItem({label: 'Remove from Sidebar'}, () => this.onAction()),
    //   ),
    // )
    //
    // contributeMenu('toolbar:workbench.part.tools.start', menu => menu
    //   .addMenu({label: computed(() => perspectiveLabels.get(perspective()) ?? perspective()), visualMenuHint: true}, menu => menu
    //     .addMenuItem({label: 'A', checked: true, actionToolbarName: 'toolbar:toolbar:perspective.menu'}, () => this.onAction())
    //     .addMenuItem({label: 'B', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
    //     .addMenuItem({label: 'C', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
    //     .addMenuItem({label: 'D', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
    //     .addMenuItem({label: 'E', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
    //     .addMenuItem({label: 'F', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
    //     .addMenuItem({label: 'G', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction()),
    //   ),
    // );
    // contributeMenu('toolbar:workbench.part.tools.start', menu => menu
    //   .addMenu({label: computed(() => perspectiveLabels.get(perspective()) ?? perspective())}, menu => menu
    //     .addMenuItem({label: 'Default Layout', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'default_layout')}, () => {
    //       perspective.set('default_layout');
    //       return true;
    //     })
    //     .addGroup({label: 'Workbench Perspectives'}, group => group
    //       .addMenu({label: 'Layout with Docked Parts'}, menu => menu
    //         .addMenuItem({label: 'Sample Layout 1', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_docked_parts_1')}, () => {
    //           perspective.set('sample_layout_docked_parts_1');
    //           return true;
    //         })
    //         .addMenuItem({label: 'Sample Layout 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_docked_parts_2')}, () => {
    //           perspective.set('sample_layout_docked_parts_2');
    //           return true;
    //         }),
    //       )
    //       .addMenu({label: 'Layout with Aligned Parts'}, menu => menu
    //         .addMenuItem({label: 'Sample Layout 1', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_1')}, () => {
    //           perspective.set('sample_layout_aligned_parts_1');
    //           return true;
    //         })
    //         .addMenuItem({label: 'Sample Layout 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_2')}, () => {
    //           perspective.set('sample_layout_aligned_parts_2');
    //           return true;
    //         }),
    //       ),
    //     )
    //     .addGroup({label: 'Microfrontend Perspectives'}, group => group
    //       .addMenu({label: 'Layout with Docked Parts'}, menu => menu
    //         .addMenuItem({label: 'Sample Layout App 1', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_docked_parts_app_1')}, () => {
    //           perspective.set('sample_layout_docked_parts_app_1');
    //           return true;
    //         })
    //         .addMenuItem({label: 'Sample Layout App 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_docked_parts_app_2')}, () => {
    //           perspective.set('sample_layout_docked_parts_app_2');
    //           return true;
    //         }),
    //       )
    //       .addMenu({label: 'Layout with Aligned Parts'}, menu => menu
    //         .addMenuItem({label: 'Sample Layout App 1', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_app_1')}, () => {
    //           perspective.set('sample_layout_aligned_parts_app_1');
    //           return true;
    //         })
    //         .addMenuItem({label: 'Sample Layout App 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_app_2')}, () => {
    //           perspective.set('sample_layout_aligned_parts_app_2');
    //           return true;
    //         }),
    //       ),
    //     )
    //     .addGroup({label: 'Test Perspectives', collapsible: {collapsed: true}}, group => group
    //       .addMenuItem({label: 'Focus Test Perspective', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'focus_test_perspective')}, () => {
    //         perspective.set('focus_test_perspective');
    //         return true;
    //       }),
    //     ),
    //   ),
    // );
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

  private onAction(): void {
    console.log(`>>> CLIENT ACTION ${this._appSymbolicName}`);
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
