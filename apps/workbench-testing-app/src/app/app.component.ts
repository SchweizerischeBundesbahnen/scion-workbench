/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, DoCheck, DOCUMENT, inject, NgZone, signal, Signal, WritableSignal} from '@angular/core';
import {filter, map, scan} from 'rxjs/operators';
import {NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet} from '@angular/router';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {provideMenu, WORKBENCH_ID, WorkbenchService, WorkbenchStartup} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';
import {fromEvent} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {SettingsService} from './settings.service';
import {installFocusHighlighter} from './focus-highlight/focus-highlighter';
import {installGlasspaneHighlighter} from './glasspane-highlight/glasspane-highlighter';
import {installMicrofrontendApplicationLabels} from './microfrontend-application-labels/microfrontend-application-labels';
import {UserMenuItemComponent} from './user-menu-item/user-menu-item.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    HeaderComponent,
  ],
  host: {
    '[attr.data-workbench-id]': 'workbenchId',
    '[attr.data-perspective-id]': 'activePerspective()?.id',
    '[attr.data-navigationid]': 'navigationId()',
  },
})
export class AppComponent implements DoCheck {

  private readonly _zone = inject(NgZone);
  private readonly _logAngularChangeDetectionCycles = toSignal(inject(SettingsService).observe$('logAngularChangeDetectionCycles'));

  protected readonly workbenchStartup = inject(WorkbenchStartup);
  protected readonly activePerspective = inject(WorkbenchService).activePerspective;
  protected readonly workbenchId = inject(WORKBENCH_ID);
  /**
   * Unique id that is set after a navigation has been performed.
   *
   * @see RouterPagePO
   */
  protected readonly navigationId = this.computeNavigationId();

  constructor() {
    this.installPropagatedKeyboardEventLogger();
    this.provideWorkbenchService();
    installFocusHighlighter();
    installGlasspaneHighlighter();
    installMicrofrontendApplicationLabels();

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
    const paragraphStyle = signal<string>('');

    provideMenu('toolbar:main', toolbar => toolbar
      .addMenu({icon: 'account_circle', label: UserMenuItemComponent, filter: true}, menu => menu
        .addGroup({label: 'Gruppe', collapsible: {collapsed: true}}, group => group
          .addMenuItem({label: 'Kapazitätsplaner'}, () => this.onAction())
          .addMenuItem({label: 'Administrator'}, () => this.onAction()),
        ),
      ),
    );

    provideMenu('toolbar:workbench.part.tools.end', toolbar => toolbar
      .addMenuItem({icon: 'expand_all', tooltip: 'Expand Selected'}, () => this.onAction())
      .addMenuItem({icon: 'collapse_all', tooltip: 'Collapse All'}, () => this.onAction()),
    );

    provideMenu('toolbar:workbench.part.tools.start', menu => menu
      .addGroup(group => group
        .addMenuItem({icon: 'lens_blur'}, () => this.onAction()),
      )
      .addMenu({label: 'File'}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: ['Ctrl', 'N']}, () => this.onAction())
        .addMenuItem({label: 'Open', icon: 'folder'}, () => this.onAction())
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy'}, () => this.onAction())
        .addMenu({label: 'Share', icon: 'person_add', id: 'extend-me'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add'}, () => this.onAction())
          .addMenuItem({label: 'Publish to web', icon: 'public'}, () => this.onAction()),
        )
        .addMenuItem({label: 'Download', icon: 'download'}, () => this.onAction())
        .addMenuItem({label: 'Print', icon: 'print'}, () => this.onAction()),
      )
      .addMenu({label: 'Edit', filter: {placeholder: 'Sueche...', notFoundText: 'Nüd gfunde.'}}, menu => menu
        .addMenuItem({label: 'Undo', icon: 'undo', accelerator: ['Ctrl', 'Z']}, () => this.onAction())
        .addMenuItem({label: 'Redo', icon: 'redo'}, () => this.onAction())
        .addMenuItem({label: 'Cut', icon: 'content_cut', accelerator: ['Ctrl', 'X']}, () => this.onAction())
        .addMenuItem({label: 'Copy', icon: 'content_copy', accelerator: ['Ctrl', 'C']}, () => this.onAction())
        .addMenuItem({label: 'Paste', icon: 'content_paste', accelerator: ['Ctrl', 'V']}, () => this.onAction())
        .addMenuItem({label: 'Find and replace', icon: 'find_replace', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
      )
      .addGroup(group => group
        .addGroup(group => group
          .addMenuItem({icon: 'lens_blur'}, () => this.onAction())
          .addMenuItem({icon: 'lens_blur'}, () => this.onAction())
          .addMenuItem({icon: 'lens_blur'}, () => this.onAction()),
        ),
      )
      .addGroup(group => group
        .addMenuItem({icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: computed(() => flags().has('format_bold'))}, () => toggleMultiFlag(flags, 'format_bold'))
        .addMenuItem({icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: computed(() => flags().has('format_italic'))}, () => toggleMultiFlag(flags, 'format_italic'))
        .addMenuItem({icon: 'format_underlined', checked: computed(() => flags().has('format_underlined'))}, () => toggleMultiFlag(flags, 'format_underlined'))
        .addMenuItem({icon: 'strikethrough_s', checked: computed(() => flags().has('strikethrough_s'))}, () => toggleMultiFlag(flags, 'strikethrough_s')),
      )
      .addGroup(group => group
        .addMenu({label: 'Menu 1', filter: true}, menu => menu
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
          .addMenu({label: 'Paragraph styles', icon: 'format_align_justify', id: 'menu:paragraph'}, menu => {
              return menu
                .addMenuItem({label: 'Normal text', checked: computed(() => paragraphStyle() === 'normal')}, () => paragraphStyle.set('normal'))
                .addMenuItem({label: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1')}, () => paragraphStyle.set('heading1'))
                .addMenuItem({label: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2')}, () => paragraphStyle.set('heading2'))
            },
          )
          .addMenu({label: 'Align & indent', filter: true, icon: 'format_bold'}, menu => menu
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
            .addMenu({label: 'Paragraph styles', icon: 'format_align_justify', id: 'menu:paragraph'}, menu => {
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

    provideMenu('menu:paragraph', menu => menu
      .addMenuItem({label: 'Heading 3', checked: computed(() => paragraphStyle() === 'heading3')}, () => paragraphStyle.set('heading3')),
    );

    provideMenu('menu:paragraph', menu => menu
      .addMenu({label: 'SCION Developers'}, menu => menu
        .addMenuItem({label: 'Etienne'}, () => this.onAction())
        .addMenuItem({label: 'Marc'}, () => this.onAction())
        .addMenuItem({label: 'Konstantin'}, () => this.onAction())
        .addMenuItem({label: 'Dani'}, () => this.onAction()),
      ),
    );

    provideMenu('toolbar:workbench.part.tools.start', menu => menu
      .addMenu({label: 'Database', icon: 'database', filter: {placeholder: 'Type to filter'}}, menu => menu
        // .addMenuItem({icon: 'filter_alt', text: 'Filter'}, () => this.onAction())
        .addGroup({label: 'View in Groups', collapsible: true}, group => group
          .addMenuItem({label: 'Databases and Schemas', checked: computed(() => flags().has('databases_and_schmemas'))}, () => toggleMultiFlag(flags, 'databases_and_schmemas'))
          .addMenuItem({label: 'Server and Database Objects', checked: computed(() => flags().has('server_and_database_objects'))}, () => toggleMultiFlag(flags, 'server_and_database_objects'))
          .addMenuItem({label: 'Schema Objects', checked: computed(() => flags().has('schema_objects'))}, () => toggleMultiFlag(flags, 'schema_objects'))
          .addMenuItem({label: 'Object Elements', checked: computed(() => flags().has('object_elements'))}, () => toggleMultiFlag(flags, 'object_elements'))
          .addGroup(group => group
            .addMenuItem({label: 'Separate Procedures and Functions', checked: computed(() => flags().has('separate_procedures_and_functions'))}, () => toggleMultiFlag(flags, 'separate_procedures_and_functions'))
            .addMenuItem({label: 'Place Table Elements Under Schema', checked: computed(() => flags().has('place_schema_elements_under_schema'))}, () => toggleMultiFlag(flags, 'place_schema_elements_under_schema'))
            .addMenuItem({label: 'Use Natural Order When Sorting', checked: computed(() => flags().has('use_natural_order_when_sorting'))}, () => toggleMultiFlag(flags, 'use_natural_order_when_sorting'))
            .addMenuItem({label: 'Sort folders and Data Sources', checked: computed(() => flags().has('sort_folders_and_data_sources'))}, () => toggleMultiFlag(flags, 'sort_folders_and_data_sources')),
          ),
        )
        .addGroup({filter: true, label: 'Show Elements', collapsible: {collapsed: true}}, group => group
          .addMenuItem({label: 'All Namespaces', checked: computed(() => flags().has('all_namespaces'))}, () => toggleMultiFlag(flags, 'all_namespaces'))
          .addMenuItem({label: 'Empty Groups', checked: computed(() => flags().has('empty_groups'))}, () => toggleMultiFlag(flags, 'empty_groups'))
          .addMenuItem({label: 'Single-Object Levels', checked: computed(() => flags().has('single_object_levels'))}, () => toggleMultiFlag(flags, 'single_object_levels'))
          .addMenuItem({label: 'Generate Objects', checked: computed(() => flags().has('generate_objects'))}, () => toggleMultiFlag(flags, 'generate_objects'))
          .addMenuItem({label: 'Virtual Objects', checked: computed(() => flags().has('virtual_objects'))}, () => toggleMultiFlag(flags, 'virtual_objects'))
          .addMenuItem({label: 'Query Files', checked: computed(() => flags().has('query_files'))}, () => toggleMultiFlag(flags, 'query_files')),
        )
        .addGroup({label: 'Node Details'}, group => group
          .addMenuItem({label: 'Comments Instead of Details', checked: computed(() => flags().has('comments_instead_of_details'))}, () => toggleMultiFlag(flags, 'comments_instead_of_details'))
          .addMenuItem({label: 'Schema Refresh Time', checked: computed(() => flags().has('schema_refresh_time'))}, () => toggleMultiFlag(flags, 'schema_refresh_time'))
          .addMenuItem({label: 'Bold Folders and Data Sources', checked: computed(() => flags().has('bold_folders_and_data_sources'))}, () => toggleMultiFlag(flags, 'bold_folders_and_data_sources')),
        ),
      ),
    );

    const viewMode = signal('dock_pinned');
    const moveTo = signal('left_top');

    provideMenu('toolbar:workbench.part.tools.end', menu => menu
      .addMenu({icon: 'visibility'}, menu => menu
        .addGroup({label: 'Sort'}, group => group
          .addMenuItem({label: 'Alphabetically', checked: computed(() => flags().has('alphabetically'))}, () => toggleMultiFlag(flags, 'alphabetically')),
        )
        .addGroup({label: 'Show'}, group => group
          .addMenuItem({label: 'Fields', checked: computed(() => flags().has('fields'))}, () => toggleMultiFlag(flags, 'fields'))
          .addMenuItem({label: 'Inherited', checked: computed(() => flags().has('inherited'))}, () => toggleMultiFlag(flags, 'inherited'))
          .addMenuItem({label: 'Inherited from Object', checked: computed(() => flags().has('inherited_from_object'))}, () => toggleMultiFlag(flags, 'inherited_from_object')),
        )
        .addGroup({label: 'Group'}, group => group
          .addMenuItem({label: 'Members by Defining Type', checked: computed(() => flags().has('member_by_defining_type'))}, () => toggleMultiFlag(flags, 'member_by_defining_type')),
        ),
      ),
    );

    provideMenu('toolbar:workbench.part.tools.end', menu => menu
      .addMenu({icon: 'more_vert', visualMenuMarker: false}, menu => menu
        .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+']}, () => this.onAction())
        .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-']}, () => this.onAction())
        .addGroup(group => group
          .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click'))}, () => toggleMultiFlag(flags, 'navigate_with_single_click'))
          .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element'))}, () => toggleMultiFlag(flags, 'always_select_opened_element')),
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
        )
        .addGroup(group => group
          .addMenu({label: 'View Mode'}, menu => menu
            .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned')}, () => viewMode.set('dock_pinned'))
            .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned')}, () => viewMode.set('dock_unpinned'))
            .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock')}, () => viewMode.set('unddock'))
            .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float')}, () => viewMode.set('float'))
            .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window')}, () => viewMode.set('window')),
          )
          .addMenu({label: 'Move To'}, menu => menu
            .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top')}, () => moveTo.set('left_top'))
            .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom')}, () => moveTo.set('left_bottom'))
            .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left')}, () => moveTo.set('bottom_left'))
            .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right')}, () => moveTo.set('bottom_right'))
            .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom')}, () => moveTo.set('right_bottom'))
            .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top')}, () => moveTo.set('right_top')),
          )
          .addMenu({label: 'Resize'}, menu => menu
            .addMenuItem({label: 'Stretch to Left'}, () => this.onAction())
            .addMenuItem({label: 'Stretch to Right'}, () => this.onAction())
            .addMenuItem({label: 'Stretch to Top'}, () => this.onAction())
            .addMenuItem({label: 'Stretch to Bottom'}, () => this.onAction())
            .addMenuItem({label: 'Maximize Tool Window'}, () => this.onAction()),
          ),
        )
        .addMenuItem({label: 'Remove from Sidebar'}, () => this.onAction()),
      ),
    );

    const perspective = signal<string>('sample_layout_docked_parts_1');
    const perspectiveLabels = new Map<string, string>()
      .set('default_layout', 'Default Layout')
      .set('sample_layout_docked_parts_1', 'Sample Layout 1 (Docked Parts)')
      .set('sample_layout_docked_parts_2', 'Sample Layout 2 (Docked Parts)')
      .set('sample_layout_docked_parts_app_1', 'Sample Microfrontend Layout App 1 (Docked Parts)')
      .set('sample_layout_docked_parts_app_2', 'Sample Microfrontend Layout App 2 (Docked Parts)')
      .set('sample_layout_aligned_parts_1', 'Sample Layout 1 (Aligned Parts)')
      .set('sample_layout_aligned_parts_2', 'Sample Layout 2 (Aligned Parts)')
      .set('sample_layout_aligned_parts_app_1', 'Sample Microfrontend Layout App 1 (Aligned Parts)')
      .set('sample_layout_aligned_parts_app_2', 'Sample Microfrontend Layout App 2 (Aligned Parts)')
      .set('focus_test_perspective', 'Focus Test Perspective');

    provideMenu('toolbar:perspective.menu', menu => menu
      .addMenuItem({icon: 'undo', tooltip: 'Reset Perspective'}, () => console.log('>>> Reset default perspective'))
      .addMenu({icon: 'more_vert', visualMenuMarker: false}, menu => menu
        .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+']}, () => this.onAction())
        .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-']}, () => this.onAction())
        .addGroup(group => group
          .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click'))}, () => toggleMultiFlag(flags, 'navigate_with_single_click'))
          .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element'))}, () => toggleMultiFlag(flags, 'always_select_opened_element')),
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
        )
        .addGroup(group => group
          .addMenu({label: 'View Mode'}, menu => menu
            .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned')}, () => viewMode.set('dock_pinned'))
            .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned')}, () => viewMode.set('dock_unpinned'))
            .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock')}, () => viewMode.set('unddock'))
            .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float')}, () => viewMode.set('float'))
            .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window')}, () => viewMode.set('window')),
          )
          .addMenu({label: 'Move To'}, menu => menu
            .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top')}, () => moveTo.set('left_top'))
            .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom')}, () => moveTo.set('left_bottom'))
            .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left')}, () => moveTo.set('bottom_left'))
            .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right')}, () => moveTo.set('bottom_right'))
            .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom')}, () => moveTo.set('right_bottom'))
            .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top')}, () => moveTo.set('right_top')),
          )
          .addMenu({label: 'Resize'}, menu => menu
            .addMenuItem({label: 'Stretch to Left'}, () => this.onAction())
            .addMenuItem({label: 'Stretch to Right'}, () => this.onAction())
            .addMenuItem({label: 'Stretch to Top'}, () => this.onAction())
            .addMenuItem({label: 'Stretch to Bottom'}, () => this.onAction())
            .addMenuItem({label: 'Maximize Tool Window'}, () => this.onAction()),
          ),
        )
        .addMenuItem({label: 'Remove from Sidebar'}, () => this.onAction()),
      ),
    )

    provideMenu('toolbar:workbench.part.tools.start', menu => menu
      .addMenu({label: computed(() => perspectiveLabels.get(perspective()) ?? perspective()), visualMenuMarker: true}, menu => menu
        .addMenuItem({label: 'A', checked: true, actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
        .addMenuItem({label: 'B', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
        .addMenuItem({label: 'C', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
        .addMenuItem({label: 'D', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
        .addMenuItem({label: 'E', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
        .addMenuItem({label: 'F', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction())
        .addMenuItem({label: 'G', actionToolbarName: 'toolbar:perspective.menu'}, () => this.onAction()),
      ),
    );
    provideMenu('toolbar:workbench.part.tools.start', menu => menu
      .addMenu({label: computed(() => perspectiveLabels.get(perspective()) ?? perspective()), size: {maxWidth: '150px'}}, menu => menu
        .addMenuItem({label: 'Default Layout', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'default_layout')}, () => {
          perspective.set('default_layout');
          return true;
        })
        .addGroup({label: 'Workbench Perspectives'}, group => group
          .addMenu({label: 'Layout with Docked Parts'}, menu => menu
            .addMenuItem({label: 'Sample Layout 1', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_docked_parts_1')}, () => {
              perspective.set('sample_layout_docked_parts_1');
              return true;
            })
            .addMenuItem({label: 'Sample Layout 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_docked_parts_2')}, () => {
              perspective.set('sample_layout_docked_parts_2');
              return true;
            }),
          )
          .addMenu({label: 'Layout with Aligned Parts'}, menu => menu
            .addMenuItem({label: 'Sample Layout 1', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_1')}, () => {
              perspective.set('sample_layout_aligned_parts_1');
              return true;
            })
            .addMenuItem({label: 'Sample Layout 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_2')}, () => {
              perspective.set('sample_layout_aligned_parts_2');
              return true;
            }),
          ),
        )
        .addGroup({label: 'Microfrontend Perspectives'}, group => group
          .addMenu({label: 'Layout with Docked Parts'}, menu => menu
            .addMenuItem({label: 'Sample Layout App 1', checked: computed(() => perspective() === 'sample_layout_docked_parts_app_1')}, () => {
              perspective.set('sample_layout_docked_parts_app_1');
              return true;
            })
            .addMenuItem({label: 'Sample Layout App 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_docked_parts_app_2')}, () => {
              perspective.set('sample_layout_docked_parts_app_2');
              return true;
            }),
          )
          .addMenu({label: 'Layout with Aligned Parts'}, menu => menu
            .addMenuItem({label: 'Sample Layout App 1', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_app_1')}, () => {
              perspective.set('sample_layout_aligned_parts_app_1');
              return true;
            })
            .addMenuItem({label: 'Sample Layout App 2', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'sample_layout_aligned_parts_app_2')}, () => {
              perspective.set('sample_layout_aligned_parts_app_2');
              return true;
            }),
          ),
        )
        .addGroup({label: 'Test Perspectives', collapsible: {collapsed: true}}, group => group
          .addMenuItem({label: 'Focus Test Perspective', actionToolbarName: 'toolbar:perspective.menu', checked: computed(() => perspective() === 'focus_test_perspective')}, () => {
            perspective.set('focus_test_perspective');
            return true;
          }),
        ),
      ),
    );
  }

  private onAction(): void {
    console.log('>>> click');
  }

  public ngDoCheck(): void {
    if (this._logAngularChangeDetectionCycles()) {
      console.log('[AppComponent] Angular change detection cycle');
    }
  }

  private computeNavigationId(): Signal<string | undefined> {
    const navigationId$ = inject(Router).events
      .pipe(
        filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError),
        scan(navigationId => navigationId + 1, 0),
        map(navigationId => `${navigationId}`),
      );
    return toSignal(navigationId$, {initialValue: undefined});
  }

  /**
   * Logs propagated keyboard events, i.e., keyboard events propagated across iframe boundaries.
   *
   * Do not install via host listener to not trigger change detection for each keyboard event.
   */
  private installPropagatedKeyboardEventLogger(): void {
    fromEvent<KeyboardEvent>(inject(DOCUMENT), 'keydown')
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe((event: KeyboardEvent) => {
        if (!event.isTrusted && (event.target as Element).tagName === 'SCI-ROUTER-OUTLET') {
          console.debug(`[AppComponent][synth-event][event=${event.type}][key=${event.key}][key.control=${event.ctrlKey}][key.shift=${event.shiftKey}][key.alt=${event.altKey}][key.meta=${event.metaKey}]`);
        }
      });
  }

  /**
   * Injects {@link WorkbenchService} into the global window object for tests to interact with the workbench.
   */
  private provideWorkbenchService(): void {
    (window as unknown as Record<string, unknown>)['__workbenchService'] = inject(WorkbenchService);
  }
}

function toggleMultiFlag(flags: WritableSignal<Set<string>>, flag: string): void {
  flags.update(flags => {
    const newFlags = new Set(flags);
    if (flags.has(flag)) {
      console.log('>>> delete', flag);
      newFlags.delete(flag);
    }
    else {
      console.log('>>> add', flag);
      newFlags.add(flag);
    }
    return newFlags;
  });
}
