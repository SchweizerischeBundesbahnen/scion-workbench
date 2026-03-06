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
import {ActivatedMicrofrontend, CanCloseRef, WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPartActionDirective, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
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
import {contributeMenu, installMenuAccelerators, SciMenuService, SciToolbarComponent} from '@scion/sci-components/menu';
import {Notification1Component} from '../notification-1/notification-1.component';

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
  ],
})
export default class ViewPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _menuService = inject(SciMenuService);
  private readonly _notificationService = inject(WorkbenchNotificationService);

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

    this.partActions = this.computePartActions();
    this.installViewActiveStateLogger();
    this.installCssClassUpdater();
    this.installCanCloseGuard();

    contributeMenu('toolbar:workbench.part.tools.end', toolbar => toolbar
      .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
        .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+'], onSelect: () => onAction()})
        .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-'], onSelect: () => onAction()})
        .addMenu({label: 'Additions', name: 'menu:additions'}, menu => menu)
        .addGroup(group => group
          .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
          .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')}),
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F'], onSelect: () => onAction()}),
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
            .addMenuItem('Stretch to Left', () => onAction())
            .addMenuItem('Stretch to Right', () => onAction())
            .addMenuItem('Stretch to Top', () => onAction())
            .addMenuItem('Stretch to Bottom', () => onAction())
            .addMenuItem('Maximize Tool Window', () => onAction()),
          ),
        )
        .addMenuItem('Remove from Sidebar', () => onAction()),
      ));

    contributeMenu(`menu:contextmenu`, menu => menu
      .addMenuItem({label: 'Expand All', accelerator: ['Ctrl', 'NumPad', '+'], onSelect: onAction})
      .addMenuItem({label: 'Collapse All', accelerator: ['Ctrl', 'NumPad', '-'], onSelect: onAction})
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')},
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', accelerator: ['Ctrl', 'F'], onSelect: context => console.log('>>> speed search (Ctrl + F)', context)}),
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

    installMenuAccelerators(`menu:contextmenu`);

    contributeMenu({location: 'toolbar:hello', context: new Map().set('marc', 'dani')}, toolbar => toolbar
      .addGroup(group => group
        .addToolbarItem('lens_blur', () => onAction())
        .addToolbarItem('lens_blur', () => onAction())
        .addToolbarItem('lens_blur', () => onAction()),
      )
      .addMenu({icon: 'content_cut'}, menu => menu
        .addMenuItem({label: 'Undo', icon: 'undo', accelerator: ['Ctrl', 'Z'], onSelect: () => onAction()})
        .addMenuItem({label: 'Redo', icon: 'redo', onSelect: () => onAction()})
        .addMenuItem({label: 'Cut', icon: 'content_cut', accelerator: ['Ctrl', 'X'], onSelect: () => console.log('>>> ctrl x')})
        .addMenuItem({label: 'Copy', icon: 'content_copy', accelerator: ['Ctrl', 'C'], onSelect: () => onAction()})
        .addMenuItem({label: 'Paste', icon: 'content_paste', accelerator: ['Ctrl', 'V'], onSelect: () => onAction()})
        .addMenuItem({label: 'Find and replace', icon: 'find_replace', accelerator: ['Ctrl', 'F'], onSelect: () => onAction()}),
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

  protected onShowNotification(): void {
    this._notificationService.show(Notification1Component, {
      title: 'Workbench Notification',
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
