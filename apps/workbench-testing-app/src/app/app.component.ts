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

    const paragraphStyle = signal<string>('');

    provideMenu('toolbar:workbench.part.tools', menu => menu
      .addMenu({text: 'File'}, menu => menu
        .addMenuItem({text: 'New', icon: 'article', accelerator: ['Ctrl', 'N']}, () => this.onAction())
        .addMenuItem({text: 'Open', icon: 'folder'}, () => this.onAction())
        .addMenuItem({text: 'Make a Copy', icon: 'file_copy'}, () => this.onAction())
        .addMenu({text: 'Share', icon: 'person_add', id: 'extend-me'}, menu => menu
          .addMenuItem({text: 'Share with others', icon: 'person_add'}, () => this.onAction())
          .addMenuItem({text: 'Publish to web', icon: 'public'}, () => this.onAction()),
        )
        .addMenuItem({text: 'Download', icon: 'download'}, () => this.onAction())
        .addMenuItem({text: 'Print', icon: 'print'}, () => this.onAction()),
      )
      .addMenu({text: 'Edit', filter: {placeholder: 'Sueche...', notFoundText: 'Nüd gfunde.'}}, menu => menu
        .addMenuItem({text: 'Undo', icon: 'undo', accelerator: ['Ctrl', 'Z']}, () => this.onAction())
        .addMenuItem({text: 'Redo', icon: 'redo'}, () => this.onAction())
        .addMenuItem({text: 'Cut', icon: 'content_cut', accelerator: ['Ctrl', 'X']}, () => this.onAction())
        .addMenuItem({text: 'Copy', icon: 'content_copy', accelerator: ['Ctrl', 'C']}, () => this.onAction())
        .addMenuItem({text: 'Paste', icon: 'content_paste', accelerator: ['Ctrl', 'V']}, () => this.onAction())
        .addMenuItem({text: 'Find and replace', icon: 'find_replace', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
      )
      .addMenu({text: 'Format', filter: true}, menu => menu
        .addMenu({text: 'Text', icon: 'format_bold'}, menu => menu
          .addMenuItem({text: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B']}, () => this.onAction())
          .addMenuItem({text: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I']}, () => this.onAction())
          .addMenuItem({text: 'Underline', icon: 'format_underlined'}, () => this.onAction())
          .addMenuItem({text: 'Strikethrough', icon: 'strikethrough_s'}, () => this.onAction())
          .addMenu({text: 'Size', icon: 'format_bold'}, menu => menu
            .addMenuItem({text: 'Increase font size'}, () => this.onAction())
            .addMenuItem({text: 'Decrease font size'}, () => this.onAction()),
          ),
        )
        .addMenu({text: 'Paragraph styles', icon: 'format_align_justify', id: 'menu:paragraph'}, menu => {
            return menu
              .addMenuItem({text: 'Normal text', checked: computed(() => paragraphStyle() === 'normal')}, () => paragraphStyle.set('normal'))
              .addMenuItem({text: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1')}, () => paragraphStyle.set('heading1'))
              .addMenuItem({text: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2')}, () => paragraphStyle.set('heading2'))
          },
        )
        .addMenu({text: 'Align & indent', filter: true, icon: 'format_bold'}, menu => menu
          .addMenuItem({text: 'Align left', icon: 'format_align_left'}, () => this.onAction())
          .addMenuItem({text: 'Align center', icon: 'format_align_center'}, () => this.onAction())
          .addMenuItem({text: 'Align right', icon: 'format_align_right'}, () => this.onAction())
          .addMenuItem({text: 'Justify', icon: 'format_align_justify'}, () => this.onAction()),
        ),
      )
      .addMenu({text: 'Format with Groups'}, menu => menu
        // .addGroup({label: 'Group 1'}, group => group
        //   .addMenuItem({text: 'Nested Menu Item'}, () => this.onAction())
        //   .addGroup({label: 'Group 2'}, group => group
        //     .addGroup({label: 'Group 3'}, group => group
        //       .addMenuItem({text: 'Nested Menu Item'}, () => this.onAction()),
        //     ),
        //   )
        .addGroup({label: 'Formatting', collapsible: true}, group => group
            .addMenu({text: 'Text', icon: 'format_bold'}, menu => menu
              .addMenuItem({text: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B']}, () => this.onAction())
              .addMenuItem({text: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I']}, () => this.onAction())
              .addMenuItem({text: 'Underline', icon: 'format_underlined'}, () => this.onAction())
              .addMenuItem({text: 'Strikethrough', icon: 'strikethrough_s'}, () => this.onAction())
              .addGroup({label: 'Size'}, menu => menu
                .addMenuItem({text: 'Increase font size'}, () => this.onAction())
                .addMenuItem({text: 'Decrease font size'}, () => this.onAction()),
              ),
            )
            // .addGroup(group => group
            .addMenu({text: 'Size', icon: 'format_size'}, menu => menu
              .addMenuItem({text: 'Increase font size'}, () => this.onAction())
              .addMenuItem({text: 'Decrease font size'}, () => this.onAction()),
            ),
          // ),
        )
        .addGroup(group => group
          .addMenu({text: 'Paragraph styles', icon: 'format_align_justify', id: 'menu:paragraph'}, menu => {
              return menu
                .addMenuItem({text: 'Normal text', checked: computed(() => paragraphStyle() === 'normal')}, () => paragraphStyle.set('normal'))
                .addMenuItem({text: 'Heading 1', checked: computed(() => paragraphStyle() === 'heading1')}, () => paragraphStyle.set('heading1'))
                .addMenuItem({text: 'Heading 2', checked: computed(() => paragraphStyle() === 'heading2')}, () => paragraphStyle.set('heading2'))
            },
          ),
        )
        .addGroup(group => group
          .addMenu({text: 'Align & indent', icon: 'format_bold'}, menu => menu
            .addMenuItem({text: 'Align left', icon: 'format_align_left'}, () => this.onAction())
            .addMenuItem({text: 'Align center', icon: 'format_align_center'}, () => this.onAction())
            .addMenuItem({text: 'Align right', icon: 'format_align_right'}, () => this.onAction())
            .addMenuItem({text: 'Justify', icon: 'format_align_justify'}, () => this.onAction()),
          ),
        ),
      ),
    );

    provideMenu('menu:paragraph', menu => menu
      .addMenuItem({text: 'Heading 3', checked: computed(() => paragraphStyle() === 'heading3')}, () => paragraphStyle.set('heading3')),
    );

    provideMenu('menu:paragraph', menu => menu
      .addMenu({text: 'SCION'}, menu => menu
        .addMenuItem({text: 'Dani'}, () => this.onAction())
        .addMenuItem({text: 'Marc'}, () => this.onAction())
        .addMenuItem({text: 'Konstantin'}, () => this.onAction()),
      ),
    );
    const databaseFlags = signal(new Set<string>()
      .add('server_and_database_objects')
      .add('schema_objects')
      .add('object_elements')
      .add('use_natural_order_when_sorting')
      .add('single_object_levels')
      .add('generate_objects')
      .add('virtual_objects')
      .add('query_files')
      .add('single_object_levels'),
    );

    provideMenu('toolbar:workbench.part.tools', menu => menu
      .addMenu({text: 'Database', filter: {placeholder: 'Type to filter'}}, menu => menu
        // .addMenuItem({icon: 'filter_alt', text: 'Filter'}, () => this.onAction())
        .addGroup({label: 'View in Groups', collapsible: true}, group => group
          .addMenuItem({text: 'Databases and Schemas', checked: computed(() => databaseFlags().has('databases_and_schmemas'))}, () => toggleMultiFlag(databaseFlags, 'databases_and_schmemas'))
          .addMenuItem({text: 'Server and Database Objects', checked: computed(() => databaseFlags().has('server_and_database_objects'))}, () => toggleMultiFlag(databaseFlags, 'server_and_database_objects'))
          .addMenuItem({text: 'Schema Objects', checked: computed(() => databaseFlags().has('schema_objects'))}, () => toggleMultiFlag(databaseFlags, 'schema_objects'))
          .addMenuItem({text: 'Object Elements', checked: computed(() => databaseFlags().has('object_elements'))}, () => toggleMultiFlag(databaseFlags, 'object_elements'))
          .addGroup(group => group
            .addMenuItem({text: 'Separate Procedures and Functions', checked: computed(() => databaseFlags().has('separate_procedures_and_functions'))}, () => toggleMultiFlag(databaseFlags, 'separate_procedures_and_functions'))
            .addMenuItem({text: 'Place Table Elements Under Schema', checked: computed(() => databaseFlags().has('place_schema_elements_under_schema'))}, () => toggleMultiFlag(databaseFlags, 'place_schema_elements_under_schema'))
            .addMenuItem({text: 'Use Natural Order When Sorting', checked: computed(() => databaseFlags().has('use_natural_order_when_sorting'))}, () => toggleMultiFlag(databaseFlags, 'use_natural_order_when_sorting'))
            .addMenuItem({text: 'Sort folders and Data Sources', checked: computed(() => databaseFlags().has('sort_folders_and_data_sources'))}, () => toggleMultiFlag(databaseFlags, 'sort_folders_and_data_sources')),
          ),
        )
        .addGroup({filter: true, label: 'Show Elements', collapsible: {collapsed: true}}, group => group
          .addMenuItem({text: 'All Namespaces', checked: computed(() => databaseFlags().has('all_namespaces'))}, () => toggleMultiFlag(databaseFlags, 'all_namespaces'))
          .addMenuItem({text: 'Empty Groups', checked: computed(() => databaseFlags().has('empty_groups'))}, () => toggleMultiFlag(databaseFlags, 'empty_groups'))
          .addMenuItem({text: 'Single-Object Levels', checked: computed(() => databaseFlags().has('single_object_levels'))}, () => toggleMultiFlag(databaseFlags, 'single_object_levels'))
          .addMenuItem({text: 'Generate Objects', checked: computed(() => databaseFlags().has('generate_objects'))}, () => toggleMultiFlag(databaseFlags, 'generate_objects'))
          .addMenuItem({text: 'Virtual Objects', checked: computed(() => databaseFlags().has('virtual_objects'))}, () => toggleMultiFlag(databaseFlags, 'virtual_objects'))
          .addMenuItem({text: 'Query Files', checked: computed(() => databaseFlags().has('query_files'))}, () => toggleMultiFlag(databaseFlags, 'query_files')),
        )
        .addGroup({label: 'Node Details'}, group => group
          .addMenuItem({text: 'Comments Instead of Details', checked: computed(() => databaseFlags().has('comments_instead_of_details'))}, () => toggleMultiFlag(databaseFlags, 'comments_instead_of_details'))
          .addMenuItem({text: 'Schema Refresh Time', checked: computed(() => databaseFlags().has('schema_refresh_time'))}, () => toggleMultiFlag(databaseFlags, 'schema_refresh_time'))
          .addMenuItem({text: 'Bold Folders and Data Sources', checked: computed(() => databaseFlags().has('bold_folders_and_data_sources'))}, () => toggleMultiFlag(databaseFlags, 'bold_folders_and_data_sources')),
        ),
      ),
    );

    const options = signal(new Set<string>()
      .add('always_select_opened_element'),
    );
    const viewMode = signal('dock_pinned');
    const moveTo = signal('left_top');

    provideMenu('toolbar:workbench.part.tools', menu => menu
      .addMenu({text: 'Options'}, menu => menu
        .addMenuItem({text: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+']}, () => this.onAction())
        .addMenuItem({text: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-']}, () => this.onAction())
        .addGroup(group => group
          .addMenuItem({text: 'Navigate with Single Click', checked: computed(() => options().has('navigate_with_single_click'))}, () => toggleMultiFlag(options, 'navigate_with_single_click'))
          .addMenuItem({text: 'Always Select Opened Element', checked: computed(() => options().has('always_select_opened_element'))}, () => toggleMultiFlag(options, 'always_select_opened_element')),
        )
        .addGroup(group => group
          .addMenuItem({text: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F']}, () => this.onAction()),
        )
        .addGroup(group => group
          .addMenu({text: 'View Mode'}, menu => menu
            .addMenuItem({text: 'Dock Pinned', checked: computed(() => viewMode() === 'dock_pinned')}, () => viewMode.set('dock_pinned'))
            .addMenuItem({text: 'Dock Unpinned', checked: computed(() => viewMode() === 'dock_unpinned')}, () => viewMode.set('dock_unpinned'))
            .addMenuItem({text: 'Undock', checked: computed(() => viewMode() === 'unddock')}, () => viewMode.set('unddock'))
            .addMenuItem({text: 'Float', checked: computed(() => viewMode() === 'float')}, () => viewMode.set('float'))
            .addMenuItem({text: 'Window', checked: computed(() => viewMode() === 'window')}, () => viewMode.set('window')),
          )
          .addMenu({text: 'Move To'}, menu => menu
            .addMenuItem({text: 'Left Top', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_top')}, () => moveTo.set('left_top'))
            .addMenuItem({text: 'Left Bottom', icon: 'dock_to_left', disabled: computed(() => moveTo() === 'left_bottom')}, () => moveTo.set('left_bottom'))
            .addMenuItem({text: 'Bottom Left', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_left')}, () => moveTo.set('bottom_left'))
            .addMenuItem({text: 'Bottom Right', icon: 'dock_to_bottom', disabled: computed(() => moveTo() === 'bottom_right')}, () => moveTo.set('bottom_right'))
            .addMenuItem({text: 'Right Bottom', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_bottom')}, () => moveTo.set('right_bottom'))
            .addMenuItem({text: 'Right Top', icon: 'dock_to_right', disabled: computed(() => moveTo() === 'right_top')}, () => moveTo.set('right_top')),
          )
          .addMenu({text: 'Resize'}, menu => menu
            .addMenuItem({text: 'Stretch to Left'}, () => this.onAction())
            .addMenuItem({text: 'Stretch to Right'}, () => this.onAction())
            .addMenuItem({text: 'Stretch to Top'}, () => this.onAction())
            .addMenuItem({text: 'Stretch to Bottom'}, () => this.onAction())
            .addMenuItem({text: 'Maximize Tool Window'}, () => this.onAction()),
          ),
        )
        .addMenuItem({text: 'Remove from Sidebar'}, () => this.onAction()),
      ),
    );

    provideMenu('toolbar:workbench.part.tools', menu => menu
      .addMenu({text: 'View Options'}, menu => menu
        .addGroup({label: 'Sort'}, group => group
          .addMenuItem({text: 'Alphabetically', checked: computed(() => options().has('alphabetically'))}, () => toggleMultiFlag(options, 'alphabetically')),
        )
        .addGroup({label: 'Show'}, group => group
          .addMenuItem({text: 'Fields', checked: computed(() => options().has('fields'))}, () => toggleMultiFlag(options, 'fields'))
          .addMenuItem({text: 'Inherited', checked: computed(() => options().has('inherited'))}, () => toggleMultiFlag(options, 'inherited'))
          .addMenuItem({text: 'Inherited from Object', checked: computed(() => options().has('inherited_from_object'))}, () => toggleMultiFlag(options, 'inherited_from_object')),
        )
        .addGroup({label: 'Group'}, group => group
          .addMenuItem({text: 'Members by Defininbg Type', checked: computed(() => options().has('member_by_defining_type'))}, () => toggleMultiFlag(options, 'member_by_defining_type')),
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
