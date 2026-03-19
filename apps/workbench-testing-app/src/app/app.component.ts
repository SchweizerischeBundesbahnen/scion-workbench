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
import {PartId, ViewId, WORKBENCH_ID, WorkbenchDialogService, WorkbenchRouter, WorkbenchService, WorkbenchStartup} from '@scion/workbench';
import {HeaderComponent} from './header/header.component';
import {fromEvent} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {SettingsService} from './settings.service';
import {installFocusHighlighter} from './focus-highlight/focus-highlighter';
import {installGlasspaneHighlighter} from './glasspane-highlight/glasspane-highlighter';
import {installMicrofrontendApplicationLabels} from './microfrontend-application-labels/microfrontend-application-labels';
import {contributeMenu} from '@scion/sci-components/menu';
import {UserMenuItemComponent} from './user-menu-item/user-menu-item.component';
import {ViewMoveDialogTestPageComponent} from './test-pages/view-move-dialog-test-page/view-move-dialog-test-page.component';
import {ViewInfoDialogComponent} from './view-info-dialog/view-info-dialog.component';

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
  protected readonly workbenchRouter = inject(WorkbenchRouter);
  /**
   * Unique id that is set after a navigation has been performed.
   *
   * @see RouterPagePO
   */
  protected readonly navigationId = this.computeNavigationId();

  constructor() {
    this.installPropagatedKeyboardEventLogger();
    this.provideWorkbenchService();
    this.contributeNewTabToolbarItem();
    this.contributeViewContextMenuAdditions();
    installFocusHighlighter();
    installGlasspaneHighlighter();
    installMicrofrontendApplicationLabels();


    if (1 + 1) {
      return;
    }

    contributeMenu('menu:additions', menu => menu
      .addMenuItem({icon: 'home', label: 'Home', onSelect: () => this.onAction()}),
    );

    const viewMode = signal('dock_pinned');
    const moveTo = signal('left_top');

    contributeMenu({location: 'menu:workbench.part.additions', position: 'end'}, menu => menu
      .addGroup(group => group
        .addMenu({label: 'View Mode'}, menu => menu
          .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned'), onSelect: () => viewMode.set('dock_pinned')})
          .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned'), onSelect: () => viewMode.set('dock_unpinned')})
          .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock'), onSelect: () => viewMode.set('unddock')})
          .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float'), onSelect: () => viewMode.set('float')})
          .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window'), onSelect: () => viewMode.set('window')}),
        )
        .addMenu({label: 'Move To'}, menu => menu
          .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top'), onSelect: () => moveTo.set('left_top')})
          .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom'), onSelect: () => moveTo.set('left_bottom')})
          .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left'), onSelect: () => moveTo.set('bottom_left')})
          .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right'), onSelect: () => moveTo.set('bottom_right')})
          .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom'), onSelect: () => moveTo.set('right_bottom')})
          .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top'), onSelect: () => moveTo.set('right_top')}),
        )
        .addMenu({label: 'Resize'}, menu => menu
          .addMenuItem('Stretch to Left', () => this.onAction())
          .addMenuItem('Stretch to Right', () => this.onAction())
          .addMenuItem('Stretch to Top', () => this.onAction())
          .addMenuItem('Stretch to Bottom', () => this.onAction())
          .addMenuItem('Maximize Tool Window', () => this.onAction()),
        ),
      )
      .addMenuItem('Remove from Sidebar', () => this.onAction()),
    );

    contributeMenu({location: 'toolbar:testee'}, menu => menu
      .addToolbarItem({label: 'Teams From Host', icon: 'groups', onSelect: () => this.onAction()}),
    );

    contributeMenu({location: 'menu:share'}, menu => menu
      .addMenuItem({label: 'Teams from Host', icon: 'groups', onSelect: () => this.onAction()}),
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
    const paragraphStyle = signal<string>('');

    if (1 + 1 === 2) {
      contributeMenu('toolbar:workbench.part.secondary', toolbar => toolbar
        .addMenu({label: 'File', menu: {filter: {placeholder: 'hello', notFoundText: 'nüd found'}}}, menu => menu
          .addMenuItem({label: 'New', icon: 'article', accelerator: ['Ctrl', 'N'], onSelect: () => this.onAction()})
          .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => this.onAction()})
          .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => this.onAction()})
          .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
            .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => this.onAction()})
            .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => this.onAction()})
            .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
              .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], onSelect: () => this.onAction()})
              .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], onSelect: () => this.onAction()})
              .addMenuItem({label: 'Underline', icon: 'format_underlined', onSelect: () => this.onAction()})
              .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', onSelect: () => this.onAction()})
              .addMenu({label: 'Size', icon: 'format_bold'}, menu => menu
                .addMenuItem('Increase font size', () => this.onAction())
                .addMenuItem('Decrease font size', () => this.onAction()),
              ),
            ),
          )
          .addMenu({label: 'Share1', name: 'menu:share', icon: 'person_add'}, menu => menu
            .addMenuItem({label: 'Share with others1', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => this.onAction()})
            .addMenuItem({label: 'Publish to web1', icon: 'public', onSelect: () => this.onAction()})
            .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
              .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], onSelect: () => this.onAction()})
              .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], onSelect: () => this.onAction()})
              .addMenuItem({label: 'Underline', icon: 'format_underlined', onSelect: () => this.onAction()})
              .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', onSelect: () => this.onAction()})
              .addGroup(group => group
                .addMenuItem('Increase font size', () => this.onAction())
                .addMenuItem('Decrease font size', () => this.onAction()),
              )
              .addMenu({label: 'Size', icon: 'format_bold'}, menu => menu
                .addMenuItem('Increase font size', () => this.onAction())
                .addMenuItem('Decrease font size', () => this.onAction()),
              )
              .addMenu({label: 'Size', icon: 'format_bold'}, menu => menu
                .addMenuItem('Increase font size', () => this.onAction())
                .addMenuItem('Decrease font size', () => this.onAction()),
              ),
            ),
          )
          .addMenuItem({label: 'Download', icon: 'download', onSelect: () => this.onAction()})
          .addMenuItem({label: 'Print', icon: 'print', onSelect: () => this.onAction()}),
        ),
      );
      return;
    }

    const workbenchService = inject(WorkbenchService);
    contributeMenu('toolbar:main', toolbar => toolbar
      .addToolbarItem({
        icon: computed(() => workbenchService.settings.theme() === 'scion-light' ? 'light_mode' : 'dark_mode'), onSelect: () => {
          workbenchService.settings.theme.update(theme => theme === 'scion-light' ? 'scion-dark' : 'scion-light');
        },
      })
      .addMenu({icon: 'account_circle', label: UserMenuItemComponent, menu: {filter: true}}, menu => menu
        .addGroup({label: 'Gruppe', collapsible: {collapsed: true}}, group => group
          .addMenuItem('Kapazitätsplaner', () => this.onAction())
          .addMenuItem('Administrator', () => this.onAction()),
        ),
      ),
    );

    contributeMenu('toolbar:workbench.part', toolbar => toolbar
      .addToolbarItem({icon: 'expand_all', tooltip: 'Expand Selected', onSelect: () => this.onAction()})
      .addToolbarItem({icon: 'collapse_all', tooltip: 'Collapse All', onSelect: () => this.onAction()}),
    );

    contributeMenu({location: 'menu:share'}, menu => menu
      .addMenuItem({label: 'Teams', icon: 'groups', onSelect: () => this.onAction()}),
    );

    contributeMenu('toolbar:workbench.part.secondary', menu => menu
      .addGroup(group => group
        .addToolbarItem('lens_blur', () => this.onAction()),
      )
      .addMenu({label: 'File'}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: ['Ctrl', 'N'], onSelect: () => this.onAction()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => this.onAction()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => this.onAction()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => this.onAction()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => this.onAction()}),
        )
        .addMenuItem({label: 'Download', icon: 'download', onSelect: () => this.onAction()})
        .addMenuItem({label: 'Print', icon: 'print', onSelect: () => this.onAction()}),
      )
      .addMenu({label: 'Edit', menu: {filter: {placeholder: 'Sueche...', notFoundText: 'Nüd gfunde.'}}}, menu => menu
        .addMenuItem({label: 'Undo', icon: 'undo', accelerator: ['Ctrl', 'Z'], onSelect: () => this.onAction()})
        .addMenuItem({label: 'Redo', icon: 'redo', onSelect: () => this.onAction()})
        .addMenuItem({label: 'Cut', icon: 'content_cut', accelerator: ['Ctrl', 'X'], onSelect: () => this.onAction()})
        .addMenuItem({label: 'Copy', icon: 'content_copy', accelerator: ['Ctrl', 'C'], onSelect: () => this.onAction()})
        .addMenuItem({label: 'Paste', icon: 'content_paste', accelerator: ['Ctrl', 'V'], onSelect: () => this.onAction()})
        .addMenuItem({label: 'Find and replace', icon: 'find_replace', accelerator: ['Ctrl', 'F'], onSelect: () => this.onAction()}),
      )
      .addGroup(group => group
        .addGroup(group => group
          .addToolbarItem('lens_blur', () => this.onAction())
          .addToolbarItem('lens_blur', () => this.onAction())
          .addToolbarItem('lens_blur', () => this.onAction()),
        ),
      )
      .addGroup(group => group
        .addToolbarItem({icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: computed(() => flags().has('format_bold')), onSelect: () => toggleMultiFlag(flags, 'format_bold')})
        .addToolbarItem({icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: computed(() => flags().has('format_italic')), onSelect: () => toggleMultiFlag(flags, 'format_italic')})
        .addToolbarItem({icon: 'format_underlined', checked: computed(() => flags().has('format_underlined')), onSelect: () => toggleMultiFlag(flags, 'format_underlined')})
        .addToolbarItem({icon: 'strikethrough_s', checked: computed(() => flags().has('strikethrough_s')), onSelect: () => toggleMultiFlag(flags, 'strikethrough_s')}),
      )
      .addGroup(group => group
        .addMenu({label: 'Menu 1', menu: {filter: true}}, menu => menu
          .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], onSelect: () => this.onAction()})
            .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], onSelect: () => this.onAction()})
            .addMenuItem({label: 'Underline', icon: 'format_underlined', onSelect: () => this.onAction()})
            .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', onSelect: () => this.onAction()})
            .addMenu({label: 'Size', icon: 'format_bold'}, menu => menu
              .addMenuItem('Increase font size', () => this.onAction())
              .addMenuItem('Decrease font size', () => this.onAction()),
            ),
          )
          .addMenu({label: 'Paragraph styles', icon: 'format_align_justify', name: 'menu:paragraph'}, menu => menu
            .addMenuItem({label: 'Normal text', checked: computed(() => paragraphStyle() === 'normal'), onSelect: () => paragraphStyle.set('normal')})
            .addMenuItem({label: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1'), onSelect: () => paragraphStyle.set('heading1')})
            .addMenuItem({label: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2'), onSelect: () => paragraphStyle.set('heading2')}),
          )
          .addMenu({icon: 'format_bold', label: 'Align & indent', menu: {filter: true}}, menu => menu
            .addMenuItem({label: 'Align left', icon: 'format_align_left', onSelect: () => this.onAction()})
            .addMenuItem({label: 'Align center', icon: 'format_align_center', onSelect: () => this.onAction()})
            .addMenuItem({label: 'Align right', icon: 'format_align_right', onSelect: () => this.onAction()})
            .addMenuItem({label: 'Justify', icon: 'format_align_justify', onSelect: () => this.onAction()}),
          ),
        )
        .addMenu({label: 'Menu 2'}, menu => menu
          // .addGroup({label: 'Group 1'}, group => group
          //   .addMenuItem({text: 'Nested Menu Item', onSelect: () => this.onAction()})
          //   .addGroup({label: 'Group 2'}, group => group
          //     .addGroup({label: 'Group 3'}, group => group
          //       .addMenuItem({text: 'Nested Menu Item', onSelect: () => this.onAction()}),
          //     ),
          //   )
          .addGroup({label: 'Formatting', collapsible: true}, group => group
              .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
                .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], onSelect: () => this.onAction()})
                .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], onSelect: () => this.onAction()})
                .addMenuItem({label: 'Underline', icon: 'format_underlined', onSelect: () => this.onAction()})
                .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', onSelect: () => this.onAction()})
                .addGroup({label: 'Size'}, menu => menu
                  .addMenuItem('Increase font size', () => this.onAction())
                  .addMenuItem('Decrease font size', () => this.onAction()),
                ),
              )
              // .addGroup(group => group
              .addMenu({label: 'Size', icon: 'format_size'}, menu => menu
                .addMenuItem('Increase font size', () => this.onAction())
                .addMenuItem('Decrease font size', () => this.onAction()),
              ),
            // ),
          )
          .addGroup(group => group
            .addMenu({label: 'Paragraph styles', icon: 'format_align_justify', name: 'menu:paragraph'}, menu => menu
              .addMenuItem({label: 'Normal text', checked: computed(() => paragraphStyle() === 'normal'), onSelect: () => paragraphStyle.set('normal')})
              .addMenuItem({label: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1'), onSelect: () => paragraphStyle.set('heading1')})
              .addMenuItem({label: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2'), onSelect: () => paragraphStyle.set('heading2')}),
            ),
          )
          .addGroup(group => group
            .addMenu({label: 'Align & indent', icon: 'format_bold'}, menu => menu
              .addMenuItem({label: 'Align left', icon: 'format_align_left', onSelect: () => this.onAction()})
              .addMenuItem({label: 'Align center', icon: 'format_align_center', onSelect: () => this.onAction()})
              .addMenuItem({label: 'Align right', icon: 'format_align_right', onSelect: () => this.onAction()})
              .addMenuItem({label: 'Justify', icon: 'format_align_justify', onSelect: () => this.onAction()}),
            ),
          ),
        ),
      ),
    );

    contributeMenu('menu:paragraph', menu => menu
      .addMenuItem({label: 'Heading 3', checked: computed(() => paragraphStyle() === 'heading3'), onSelect: () => paragraphStyle.set('heading3')}),
    );

    contributeMenu('menu:paragraph', menu => menu
      .addMenu({label: 'SCION Developers'}, menu => menu
        .addMenuItem('Etienne', () => this.onAction())
        .addMenuItem('Marc', () => this.onAction())
        .addMenuItem('Konstantin', () => this.onAction())
        .addMenuItem('Dani', () => this.onAction()),
      ),
    );

    contributeMenu('toolbar:workbench.part.secondary', menu => menu
      .addMenu({label: 'Database', icon: 'database', menu: {filter: {placeholder: 'Type to filter'}}}, menu => menu
        // .addMenuItem({icon: 'filter_alt', text: 'Filter', onSelect: () => this.onAction()})
        .addGroup({label: 'View in Groups', collapsible: true}, group => group
          .addMenuItem({label: 'Databases and Schemas', checked: computed(() => flags().has('databases_and_schmemas')), onSelect: () => toggleMultiFlag(flags, 'databases_and_schmemas')})
          .addMenuItem({label: 'Server and Database Objects', checked: computed(() => flags().has('server_and_database_objects')), onSelect: () => toggleMultiFlag(flags, 'server_and_database_objects')})
          .addMenuItem({label: 'Schema Objects', checked: computed(() => flags().has('schema_objects')), onSelect: () => toggleMultiFlag(flags, 'schema_objects')})
          .addMenuItem({label: 'Object Elements', checked: computed(() => flags().has('object_elements')), onSelect: () => toggleMultiFlag(flags, 'object_elements')})
          .addGroup(group => group
            .addMenuItem({label: 'Separate Procedures and Functions', checked: computed(() => flags().has('separate_procedures_and_functions')), onSelect: () => toggleMultiFlag(flags, 'separate_procedures_and_functions')})
            .addMenuItem({label: 'Place Table Elements Under Schema', checked: computed(() => flags().has('place_schema_elements_under_schema')), onSelect: () => toggleMultiFlag(flags, 'place_schema_elements_under_schema')})
            .addMenuItem({label: 'Use Natural Order When Sorting', checked: computed(() => flags().has('use_natural_order_when_sorting')), onSelect: () => toggleMultiFlag(flags, 'use_natural_order_when_sorting')})
            .addMenuItem({label: 'Sort folders and Data Sources', checked: computed(() => flags().has('sort_folders_and_data_sources')), onSelect: () => toggleMultiFlag(flags, 'sort_folders_and_data_sources')}),
          ),
        )
        .addGroup({label: 'Show Elements', collapsible: {collapsed: true}}, group => group
          .addMenuItem({label: 'All Namespaces', checked: computed(() => flags().has('all_namespaces')), onSelect: () => toggleMultiFlag(flags, 'all_namespaces')})
          .addMenuItem({label: 'Empty Groups', checked: computed(() => flags().has('empty_groups')), onSelect: () => toggleMultiFlag(flags, 'empty_groups')})
          .addMenuItem({label: 'Single-Object Levels', checked: computed(() => flags().has('single_object_levels')), onSelect: () => toggleMultiFlag(flags, 'single_object_levels')})
          .addMenuItem({label: 'Generate Objects', checked: computed(() => flags().has('generate_objects')), onSelect: () => toggleMultiFlag(flags, 'generate_objects')})
          .addMenuItem({label: 'Virtual Objects', checked: computed(() => flags().has('virtual_objects')), onSelect: () => toggleMultiFlag(flags, 'virtual_objects')})
          .addMenuItem({label: 'Query Files', checked: computed(() => flags().has('query_files')), onSelect: () => toggleMultiFlag(flags, 'query_files')}),
        )
        .addGroup({label: 'Node Details'}, group => group
          .addMenuItem({label: 'Comments Instead of Details', checked: computed(() => flags().has('comments_instead_of_details')), onSelect: () => toggleMultiFlag(flags, 'comments_instead_of_details')})
          .addMenuItem({label: 'Schema Refresh Time', checked: computed(() => flags().has('schema_refresh_time')), onSelect: () => toggleMultiFlag(flags, 'schema_refresh_time')})
          .addMenuItem({label: 'Bold Folders and Data Sources', checked: computed(() => flags().has('bold_folders_and_data_sources')), onSelect: () => toggleMultiFlag(flags, 'bold_folders_and_data_sources')}),
        ),
      ),
    );

    contributeMenu('toolbar:workbench.part', menu => menu
      .addMenu({icon: 'visibility'}, menu => menu
        .addGroup({label: 'Sort'}, group => group
          .addMenuItem({label: 'Alphabetically', checked: computed(() => flags().has('alphabetically')), onSelect: () => toggleMultiFlag(flags, 'alphabetically')}),
        )
        .addGroup({label: 'Show'}, group => group
          .addMenuItem({label: 'Fields', checked: computed(() => flags().has('fields')), onSelect: () => toggleMultiFlag(flags, 'fields')})
          .addMenuItem({label: 'Inherited', checked: computed(() => flags().has('inherited')), onSelect: () => toggleMultiFlag(flags, 'inherited')})
          .addMenuItem({label: 'Inherited from Object', checked: computed(() => flags().has('inherited_from_object')), onSelect: () => toggleMultiFlag(flags, 'inherited_from_object')}),
        )
        .addGroup({label: 'Group'}, group => group
          .addMenuItem({label: 'Members by Defining Type', checked: computed(() => flags().has('member_by_defining_type')), onSelect: () => toggleMultiFlag(flags, 'member_by_defining_type')}),
        ),
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

    contributeMenu('group(toolbar):perspective.menu', menu => menu
      .addToolbarItem({icon: 'undo', tooltip: 'Reset Perspective', onSelect: () => console.log('>>> Reset default perspective')})
      .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
        .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+'], onSelect: () => this.onAction()})
        .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-'], onSelect: () => this.onAction()})
        .addGroup(group => group
          .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
          .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')}),
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F'], onSelect: () => this.onAction()}),
        )
        .addGroup(group => group
          .addMenu({label: 'View Mode'}, menu => menu
            .addMenuItem({label: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned'), onSelect: () => viewMode.set('dock_pinned')})
            .addMenuItem({label: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned'), onSelect: () => viewMode.set('dock_unpinned')})
            .addMenuItem({label: 'Undock', checked: computed(() => viewMode() === 'unddock'), onSelect: () => viewMode.set('unddock')})
            .addMenuItem({label: 'Float', checked: computed(() => viewMode() === 'float'), onSelect: () => viewMode.set('float')})
            .addMenuItem({label: 'Window', checked: computed(() => viewMode() === 'window'), onSelect: () => viewMode.set('window')}),
          )
          .addMenu({label: 'Move To'}, menu => menu
            .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top'), onSelect: () => moveTo.set('left_top')})
            .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom'), onSelect: () => moveTo.set('left_bottom')})
            .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left'), onSelect: () => moveTo.set('bottom_left')})
            .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right'), onSelect: () => moveTo.set('bottom_right')})
            .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom'), onSelect: () => moveTo.set('right_bottom')})
            .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top'), onSelect: () => moveTo.set('right_top')}),
          )
          .addMenu({label: 'Resize'}, menu => menu
            .addMenuItem('Stretch to Left', () => this.onAction())
            .addMenuItem('Stretch to Right', () => this.onAction())
            .addMenuItem('Stretch to Top', () => this.onAction())
            .addMenuItem('Stretch to Bottom', () => this.onAction())
            .addMenuItem('Maximize Tool Window', () => this.onAction()),
          ),
        )
        .addMenuItem('Remove from Sidebar', () => this.onAction()),
      ),
    )

    contributeMenu('toolbar:workbench.part.secondary', menu => menu
      .addMenu({label: computed(() => perspectiveLabels.get(perspective()) ?? perspective()), visualMenuHint: true}, menu => menu
        .addMenuItem({label: 'A', checked: true, actions: actions => actions.addGroup({name: 'group:perspective.menu'}), onSelect: () => this.onAction()})
        .addMenuItem({label: 'B', actions: actions => actions.addGroup({name: 'group:perspective.menu'}), onSelect: () => this.onAction()})
        .addMenuItem({label: 'C', actions: actions => actions.addGroup({name: 'group:perspective.menu'}), onSelect: () => this.onAction()})
        .addMenuItem({label: 'D', actions: actions => actions.addGroup({name: 'group:perspective.menu'}), onSelect: () => this.onAction()})
        .addMenuItem({label: 'E', actions: actions => actions.addGroup({name: 'group:perspective.menu'}), onSelect: () => this.onAction()})
        .addMenuItem({label: 'F', actions: actions => actions.addGroup({name: 'group:perspective.menu'}), onSelect: () => this.onAction()})
        .addMenuItem({label: 'G', actions: actions => actions.addGroup({name: 'group:perspective.menu'}), onSelect: () => this.onAction()}),
      ),
    );
    contributeMenu('toolbar:workbench.part.secondary', menu => menu
      .addMenu({label: computed(() => perspectiveLabels.get(perspective()) ?? perspective())}, menu => menu
        .addMenuItem({
          label: 'Default Layout',
          // actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
          actions: actions => actions
            .addGroup({name: 'group:perspective.menu'})
            .addMenu('home', menu => menu
              .addMenuItem('Sub Menu 1', () => this.onAction())
              .addMenu('Sub Menu 2', menu => menu
                .addMenuItem('Sub Menu 1', () => this.onAction())
                .addMenuItem('Sub Menu 1', () => this.onAction()),
              )
              .addMenuItem('Sub Menu 3', () => this.onAction()),
            ),
          checked: computed(() => perspective() === 'default_layout'),
          onSelect: () => {
            perspective.set('default_layout');
            return true;
          },
        })
        .addGroup({label: 'Workbench Perspectives'}, group => group
          .addMenu({label: 'Layout with Docked Parts'}, menu => menu
            .addMenuItem({
              label: 'Sample Layout 1',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_docked_parts_1'),
              onSelect: () => {
                perspective.set('sample_layout_docked_parts_1');
                return true;
              },
            })
            .addMenuItem({
              label: 'Sample Layout 2',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_docked_parts_2'),
              onSelect: () => {
                perspective.set('sample_layout_docked_parts_2');
                return true;
              },
            }),
          )
          .addMenu({label: 'Layout with Aligned Parts'}, menu => menu
            .addMenuItem({
              label: 'Sample Layout 1',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_aligned_parts_1'),
              onSelect: () => {
                perspective.set('sample_layout_aligned_parts_1');
                return true;
              },
            })
            .addMenuItem({
              label: 'Sample Layout 2',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_aligned_parts_2'),
              onSelect: () => {
                perspective.set('sample_layout_aligned_parts_2');
                return true;
              },
            }),
          ),
        )
        .addGroup({label: 'Microfrontend Perspectives'}, group => group
          .addMenu({label: 'Layout with Docked Parts'}, menu => menu
            .addMenuItem({
              label: 'Sample Layout App 1',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_docked_parts_app_1'),
              onSelect: () => {
                perspective.set('sample_layout_docked_parts_app_1');
                return true;
              },
            })
            .addMenuItem({
              label: 'Sample Layout App 2',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_docked_parts_app_2'),
              onSelect: () => {
                perspective.set('sample_layout_docked_parts_app_2');
                return true;
              },
            }),
          )
          .addMenu({label: 'Layout with Aligned Parts'}, menu => menu
            .addMenuItem({
              label: 'Sample Layout App 1',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_aligned_parts_app_1'),
              onSelect: () => {
                perspective.set('sample_layout_aligned_parts_app_1');
                return true;
              },
            })
            .addMenuItem({
              label: 'Sample Layout App 2',
              actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
              checked: computed(() => perspective() === 'sample_layout_aligned_parts_app_2'),
              onSelect: () => {
                perspective.set('sample_layout_aligned_parts_app_2');
                return true;
              },
            }),
          ),
        )
        .addGroup({label: 'Test Perspectives', collapsible: {collapsed: true}}, group => group
          .addMenuItem({
            label: 'Focus Test Perspective',
            actions: actions => actions.addGroup({name: 'group:perspective.menu'}),
            checked: computed(() => perspective() === 'focus_test_perspective'),
            onSelect: () => {
              perspective.set('focus_test_perspective');
              return true;
            },
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

  private contributeNewTabToolbarItem(): void {
    contributeMenu('toolbar:workbench.part.secondary', (toolbar, context) => {
      const partId = context.get('partId') as PartId | undefined;
      const peripheral = context.get('peripheral') as boolean | undefined;
      if (!partId || peripheral) {
        return;
      }

      toolbar.addToolbarItem('add', () => void this.workbenchRouter.navigate(['/start-page'], {target: 'blank', partId, position: 'end'}));
    });
  }

  private contributeViewContextMenuAdditions(): void {
    // Contribute menu item to move view to new window.
    contributeMenu({location: 'group(menu):workbench.view.contextmenu.move', position: 'end'}, (menu, context) => {
      const view = inject(WorkbenchService).getView(context.get('viewId') as ViewId)!;

      menu.addMenuItem({
        label: 'Move View...',
        cssClass: 'e2e-move-view',
        onSelect: () => void inject(WorkbenchDialogService).open(ViewMoveDialogTestPageComponent, {
          inputs: {view},
          cssClass: 'e2e-move-view',
        }),
      });
    });

    // Contribute menu item to show view info.
    contributeMenu('group(menu):workbench.view.contextmenu.additions', (menu, context) => {
      const view = inject(WorkbenchService).getView(context.get('viewId') as ViewId);

      menu.addMenuItem({
        label: 'Show View Info',
        cssClass: 'e2e-show-view-info',
        accelerator: ['F1'],
        onSelect: () => void inject(WorkbenchDialogService).open(ViewInfoDialogComponent, {
          inputs: {view},
          modality: 'application', // to open view info of inactive views
          cssClass: 'e2e-view-info',
        }),
      });
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
      newFlags.delete(flag);
    }
    else {
      newFlags.add(flag);
    }
    return newFlags;
  });
}
