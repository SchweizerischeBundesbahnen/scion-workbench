/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, signal, Signal, WritableSignal} from '@angular/core';
import {ActivatedMicrofrontend, CanCloseRef, WorkbenchMenuContextKeys, WorkbenchMessageBoxService, WorkbenchPartActionDirective, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
import {startWith} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Arrays} from '@scion/toolkit/util';
import {AsyncPipe} from '@angular/common';
import {AppendDataTypePipe, MultiValueInputComponent, NullIfEmptyPipe} from 'workbench-testing-app-common';
import {JoinPipe} from '../common/join.pipe';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {rootEffect} from '../common/root-effect';
import ActivatedMicrofrontendComponent from '../activated-microfrontend/activated-microfrontend.component';
import {contributeMenu, installMenuAccelerators, SciMenubarComponent, SciMenuService, SciToolbarComponent, SciToolbarFactory} from '@scion/sci-components/menu';
import {renderingFlag} from '../rendering-flag';

@Component({
  selector: 'app-view-page',
  templateUrl: './view-page.component.html',
  styleUrls: ['./view-page.component.scss'],
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
    SciKeyValueComponent,
    NullIfEmptyPipe,
    JoinPipe,
    AppendDataTypePipe,
    WorkbenchPartActionDirective,
    MultiValueInputComponent,
    ActivatedMicrofrontendComponent,
    SciToolbarComponent,
    SciMenubarComponent,
  ],
})
export default class ViewPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _menuService = inject(SciMenuService);

  protected readonly view = inject(WorkbenchView);
  protected readonly activatedMicrofrontend = inject(ActivatedMicrofrontend, {optional: true});
  protected readonly route = inject(ActivatedRoute);
  protected readonly uuid = UUID.randomUUID();
  protected readonly partActions: Signal<WorkbenchPartActionDescriptor[]>;

  protected readonly form = this._formBuilder.group({
    partActions: this._formBuilder.control(''),
    cssClass: this._formBuilder.control(''),
    confirmClosing: this._formBuilder.control(false),
  });

  constructor() {
    if (!inject(WorkbenchStartup).done()) {
      throw Error('[LifecycleError] Component constructed before the workbench startup completed!'); // Do not remove as required by `startup.e2e-spec.ts` in [#1]
    }

    this.contributeMenubar();

    contributeMenu('menubar:view', menubar => menubar
      .addMenu('Menu 1', menu => menu
        .addMenuItem('Menu 1 - A', onSelect)
        .addMenuItem('Menu 1 - B', onSelect)
        .addMenuItem('Menu 1 - C', onSelect),
      )
      .addMenu({label: 'Menu 2', name: 'menu:2'}, menu => menu
        .addMenuItem('Menu 2 - A', onSelect)
        .addMenuItem('Menu 2 - B', onSelect)
        .addMenuItem('Menu 2 - C', onSelect),
      )
      .addMenu('Menu 3', menu => menu
        .addMenuItem('Menu 3 - A', onSelect)
        .addMenuItem('Menu 3 - B', onSelect)
        .addMenuItem('Menu 3 - C', onSelect),
      ),
    );

    contributeMenu({location: 'menubar:view', position: 'start'}, menu => menu
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
    )

    contributeMenu({location: 'menubar:view', position: 'end'}, menubar => menubar
      .addMenu({label: 'Menu 4', name: 'menu:view.menubar:additions'}, menu => menu),
    );

    contributeMenu('menu:view.menubar:additions', menu => menu
      .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+'], onSelect: () => onAction()})
      .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-'], onSelect: () => onAction()})
      .addMenu({label: 'Additions', name: 'menu:additions'}, menu => menu)
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')}),
      )
      .addGroup(group => group
        .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F'], onSelect: () => onAction()}),
      ),
    );

    this.partActions = this.computePartActions();
    this.installViewActiveStateLogger();
    this.installCssClassUpdater();
    this.installCanCloseGuard();

    this.contributeToolbar();

    contributeMenu('menu:workbench.part.toolbar', menu => menu
      .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+'], onSelect: () => onAction()})
      .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-'], onSelect: () => onAction()})
      .addMenu({label: 'Additions', name: 'menu:additions'}, menu => menu)
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')}),
      )
      .addGroup(group => group
        .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F'], onSelect: () => onAction()}),
      ),
    );

    contributeMenu(`menu:contextmenu`, (menu, context) => menu
      .addMenuItem({label: 'Expand All', disabled: context.get(WorkbenchMenuContextKeys.PartId) === 'part.d7b1190a', accelerator: ['Ctrl', 'NumPad', '+'], onSelect: onAction})
      .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-'], onSelect: onAction})
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')},
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F'], onSelect: () => console.log('>>> speed search (Ctrl + F)', context)}),
        )
        .addGroup(group => group
          .addMenu({label: '%viewmode1.label'}, menu => menu
            .addMenuItem({label: '%docked_pinned1.label', checked: computed(() => viewMode() === 'dock_pinned'), onSelect: () => viewMode.set('dock_pinned')})
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
            .addMenuItem('Stretch to Left', onAction)
            .addMenuItem('Stretch to Right', onAction)
            .addMenuItem('Stretch to Top', onAction)
            .addMenuItem('Stretch to Bottom', onAction)
            .addMenuItem('Maximize Tool Window', onAction),
          ),
        )
        .addMenuItem('Remove from Sidebar', onAction),
      ),
    );

    installMenuAccelerators('menu:contextmenu');
  }

  private contributeMenubar(): void {

    contributeMenu({location: 'menubar:demo', position: 'start'}, menu => menu

      .addMenu({label: 'File', name: 'menu:file'}, menu => menu,
      ),
    );

    contributeMenu({location: 'menu:file'}, menu => menu

      .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu,
      ),
    );

    contributeMenu({location: 'menu:share'}, menu => menu

      .addMenuItem({label: 'Publish to web', icon: 'public', onSelect})
    );
  }

  private contributeToolbar(): void {
    const bold = renderingFlag<boolean>('toolbar.bold', false);
    const italic = renderingFlag<boolean>('toolbar.italic', false);
    const underlined = renderingFlag<boolean>('toolbar.underlined', false);
    const strikethrough = renderingFlag<boolean>('toolbar.strikethrough', false);

    contributeMenu('toolbar:view', toolbar => toolbar
      .addGroup(group => group
        .addToolbarItem({icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: bold, onSelect: () => bold.update(bold => !bold)})
        .addToolbarItem({icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: italic, onSelect: () => italic.update(italic => !italic)})
        .addToolbarItem({icon: 'format_underlined', checked: underlined, onSelect: () => underlined.update(underlined => !underlined)}),
      )
      .addMenu({icon: 'palette', menu: {filter: true, maxHeight: '200px'}}, menu => menu
        .addGroup(group => group
          .addMenuItem({label: 'Bold', icon: 'format_bold', accelerator: ['Ctrl', 'Shift', 'B'], checked: bold, onSelect: () => bold.update(bold => !bold)})
          .addMenuItem({label: 'Italic', icon: 'format_italic', accelerator: ['Ctrl', 'Shift', 'I'], checked: italic, onSelect: () => italic.update(italic => !italic)})
          .addMenuItem({label: 'Underline', icon: 'format_underlined', accelerator: ['Ctrl', 'Shift', 'U'], checked: underlined, onSelect: () => underlined.update(underlined => !underlined)})
          .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', accelerator: ['Ctrl', 'Shift', 'S'], checked: strikethrough, onSelect: () => strikethrough.update(strikethrough => !strikethrough)}),
        )
        .addGroup({label: 'Heading', collapsible: {collapsed: true}, actions: addHeadingGroupActions}, menu => menu
          .addMenuItem({icon: 'format_h1', label: 'H1', onSelect})
          .addMenuItem({icon: 'format_h2', label: 'H2', onSelect})
          .addMenuItem({icon: 'format_h3', label: 'H3', onSelect})
          .addMenuItem({icon: 'format_h4', label: 'H4', onSelect}),
        )
        .addMenu({label: 'Size', icon: 'format_size'}, menu => menu
          .addGroup(group => group
            .addMenuItem({icon: 'text_increase', label: 'Increase font size', onSelect})
            .addMenuItem({icon: 'text_decrease', label: 'Decrease font size', onSelect}),
          )
          .addMenuItem({icon: 'view_real_size', label: 'Reset font size', onSelect}),
        )
        .addMenu({label: 'Align', icon: 'format_align_center'}, menu => menu
          .addMenuItem({icon: 'format_align_left', label: 'Align left', onSelect})
          .addMenuItem({icon: 'format_align_center', label: 'Align center', onSelect})
          .addMenuItem({icon: 'format_align_right', label: 'Align right', onSelect})
          .addMenuItem({icon: 'format_align_justify', label: 'Align justify', onSelect}),
        )
        .addMenu({label: 'Style', icon: 'match_case'}, menu => menu
          .addMenuItem({icon: 'uppercase', label: 'Uppercase', onSelect})
          .addMenuItem({icon: 'lowercase', label: 'Lowercase', onSelect})
          .addMenuItem({icon: 'titlecase', label: 'Titlecase', onSelect}),
        )
        .addMenu({label: 'Rotate', icon: 'text_rotation_angledown'}, menu => menu
          .addMenuItem({icon: 'text_rotate_vertical', label: 'Rotate 90°', onSelect})
          .addMenuItem({icon: 'text_rotation_angledown', label: 'Rotate 45°', onSelect})
          .addMenuItem({icon: 'text_rotation_angleup', label: 'Rotate -45°', onSelect}),
        )
        .addMenu({icon: 'format_list_numbered', label: 'Enumeration'}, menu => menu
          .addMenuItem({icon: 'format_list_bulleted', label: 'Bullet list', onSelect})
          .addMenuItem({icon: 'format_list_numbered', label: 'Number list', onSelect}),
        )
        .addMenu({label: 'Align', icon: 'format_align_center'}, menu => menu
          .addMenuItem({icon: 'format_align_left', label: 'Align left', onSelect})
          .addMenuItem({icon: 'format_align_center', label: 'Align center', onSelect})
          .addMenuItem({icon: 'format_align_right', label: 'Align right', onSelect})
          .addMenuItem({icon: 'format_align_left', label: 'Align left', onSelect})
          .addMenuItem({icon: 'format_align_center', label: 'Align center', onSelect})
          .addMenuItem({icon: 'format_align_right', label: 'Align right', onSelect})
          .addMenuItem({icon: 'format_align_left', label: 'Align left', onSelect})
          .addMenuItem({icon: 'format_align_center', label: 'Align center', onSelect})
          .addMenuItem({icon: 'format_align_right', label: 'Align right', onSelect})
          .addMenuItem({icon: 'format_align_left', label: 'Align left', onSelect})
          .addMenuItem({icon: 'format_align_center', label: 'Align center', onSelect})
          .addMenuItem({icon: 'format_align_right', label: 'Align right', onSelect})
          .addMenuItem({icon: 'format_align_left', label: 'Align left', onSelect})
          .addMenuItem({icon: 'format_align_center', label: 'Align center', onSelect})
          .addMenuItem({icon: 'format_align_right', label: 'Align right', onSelect})
          .addMenuItem({icon: 'format_align_justify', label: 'Align justify', onSelect}),
        ),
      )
      .addGroup(group => group
        .addToolbarItem({icon: 'undo', accelerator: ['Ctrl', 'Z'], onSelect: () => onSelect()})
        .addToolbarItem({icon: 'redo', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_cut', accelerator: ['Ctrl', 'X'], onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_copy', accelerator: ['Ctrl', 'C'], onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_paste', accelerator: ['Ctrl', 'V'], onSelect: () => onSelect()}),
      ),
    );
  }

  private async confirmClosing(): Promise<boolean> {
    const action = await inject(WorkbenchMessageBoxService).open('Do you want to close this view?', {
      actions: {yes: 'Yes', no: 'No', error: 'Throw Error'},
      cssClass: ['e2e-close-view', this.view.id],
    });

    if (action === 'error') {
      throw Error(`[CanCloseSpecError] Error in CanLoad of view '${this.view.id}'.`);
    }
    return action === 'yes';
  }

  private computePartActions(): Signal<WorkbenchPartActionDescriptor[]> {
    const partActions = toSignal(this.form.controls.partActions.valueChanges, {initialValue: this.form.controls.partActions.value});
    return computed(() => {
      try {
        return Arrays.coerce(JSON.parse(partActions() || '[]') as WorkbenchPartActionDescriptor[]);
      }
      catch {
        return [];
      }
    });
  }

  private installViewActiveStateLogger(): void {
    rootEffect(() => {
      if (this.view.active()) {
        console.debug(`[ViewActivate] [component=ViewPageComponent@${this.uuid}]`);
      }
      else {
        console.debug(`[ViewDeactivate] [component=ViewPageComponent@${this.uuid}]`);
      }
    });
  }

  private installCssClassUpdater(): void {
    this.form.controls.cssClass.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(cssClasses => {
        this.view.cssClass = cssClasses;
      });
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

  protected onContextMenuOpen(event: MouseEvent): void {
    this._menuService.open('menu:contextmenu', {
      anchor: event,
    });
  }
}

interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}

function onAction(): void {

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

function onSelect(): void {

}

function addHeadingGroupActions(toolbar: SciToolbarFactory): void {
  toolbar
    .addToolbarItem('favorite', onSelect)
    .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
      .addMenuItem('Don\'t Show Again For This Project', onSelect)
      .addMenuItem('Don\'t Show Again', onSelect),
    );
}
