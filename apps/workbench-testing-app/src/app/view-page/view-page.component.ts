/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, inject, Injector, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {ActivatedMicrofrontend, CanCloseRef, WorkbenchMessageBoxService, WorkbenchPartActionDirective, WorkbenchStartup, WorkbenchView} from '@scion/workbench';
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
import {Settings} from '../settings.service';
import {contributeMenu, installMenuAccelerators, SciMenubarComponent, SciMenuService, SciToolbarComponent, SciToolbarFactory} from '@scion/components/menu';
import {createDestroyableInjector} from '@scion/components/common';

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
    SciMenubarComponent,
    SciToolbarComponent,
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
  protected readonly settings = inject(Settings);

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

    this.contributeSampleMenus();
  }

  protected onContextMenuOpen(event: MouseEvent): void {
    this._menuService.open('menu:demo.contextmenu', {anchor: event});
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

  /**
   * Contributes sample toolbars and menus when `showSampleMenus` application setting is enabled.
   */
  private contributeSampleMenus(): void {
    const showSampleMenus = inject(Settings).showSampleMenus;
    const injector = inject(Injector);

    effect(onCleanup => {
      if (!showSampleMenus()) {
        return;
      }

      untracked(() => {
        const contributionInjector = createDestroyableInjector({parent: injector});
        onCleanup(() => contributionInjector.destroy());

        runInInjectionContext(contributionInjector, () => {
          this.contributeSampleMenubar();
          this.contributeSampleToolbar();
          this.contributeSampleContextMenu();

          this.contributeWorkbenchPartToolbar();
          this.contributeWorkbenchViewContextMenu();
        });
      });
    });
  }

  private contributeWorkbenchPartToolbar(): void {
    const navigateWithSingleClick = signal(false);
    const alwaysShowOpenedElement = signal(false);

    contributeMenu('menu:workbench.part.toolbar', menu => menu
      .addMenuItem({label: 'Expand All', accelerator: {ctrl: true, key: '+', location: 'numpad'}, onSelect: () => console.log(`>>> Ctrl+NumPad+ [location=menu:workbench.part.toolbar, contributor=${this.view.id}]`)})
      .addMenuItem({label: 'Collapse All', accelerator: {ctrl: true, key: '-', location: 'numpad'}, onSelect: () => console.log(`>>> Ctrl+NumPad- [location=menu:workbench.part.toolbar, contributor=${this.view.id}]`)})
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: navigateWithSingleClick, onSelect: () => navigateWithSingleClick.update(bold => !bold)})
        .addMenuItem({label: 'Always Select Opened Element', checked: alwaysShowOpenedElement, onSelect: () => alwaysShowOpenedElement.update(bold => !bold)}),
      )
      .addGroup(group => group
        .addMenuItem({label: 'Speed Search', accelerator: {ctrl: true, key: 'F'}, icon: 'search', onSelect: () => console.log(`>>> Speed Search [location=menu:workbench.part.toolbar, contributor=${this.view.id}]`)}),
      ),
    );
  }

  private contributeWorkbenchViewContextMenu(): void {
    contributeMenu('menu:workbench.view.contextmenu', menu => menu
      .addMenuItem({label: 'Speed Search', accelerator: {ctrl: true, key: 'F'}, icon: 'search', onSelect: () => console.log(`>>> Speed Search [location=menu:workbench.view.contextmenu, contributor=${this.view.id}]`)}),
    );
  }

  private contributeSampleMenubar(): void {
    contributeMenu({location: 'menubar:demo', position: 'start'}, menu => menu
      .addMenu({label: 'File', cssClass: 'file-menu'}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', onSelect})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()}),
        ),
      ),
    );

    contributeMenu('menubar:demo', menubar => menubar
      .addMenu('Menu 1', menu => menu
        .addMenuItem('Menu 1a', onSelect)
        .addMenuItem('Menu 1b', onSelect)
        .addMenuItem('Menu 1c', onSelect),
      )
      .addMenu({label: 'Menu 2'}, menu => menu
        .addMenuItem('Menu 2a', onSelect)
        .addMenu('Menu 2b', menu => menu
          .addMenuItem('Submenu 1', onSelect)
          .addMenuItem('Submenu 2', onSelect)
          .addMenuItem('Submenu 3', onSelect),
        )
        .addMenuItem('Menu 2c', onSelect),
      )
      .addMenu('Menu 3', menu => menu
        .addMenuItem('Menu 3a', onSelect)
        .addMenuItem('Menu 3b', onSelect)
        .addMenuItem('Menu 3c', onSelect),
      ),
    );

    function onSelect(): void {
      // NOOP
    }
  }

  private contributeSampleToolbar(): void {
    const bold = signal(false);
    const italic = signal(false);
    const underlined = signal(false);
    const strikethrough = signal(false);

    contributeMenu('toolbar:demo', toolbar => toolbar
      .addGroup(group => group
        .addToolbarItem({icon: 'format_bold', checked: bold, onSelect: () => bold.update(bold => !bold)})
        .addToolbarItem({icon: 'format_italic', checked: italic, onSelect: () => italic.update(italic => !italic)})
        .addToolbarItem({icon: 'format_underlined', checked: underlined, onSelect: () => underlined.update(underlined => !underlined)}),
      )
      .addMenu({icon: 'palette', filter: true}, menu => menu
        .addGroup(group => group
          .addMenuItem({label: 'Bold', icon: 'format_bold', checked: bold, onSelect: () => bold.update(bold => !bold)})
          .addMenuItem({label: 'Italic', icon: 'format_italic', checked: italic, onSelect: () => italic.update(italic => !italic)})
          .addMenuItem({label: 'Underline', icon: 'format_underlined', checked: underlined, onSelect: () => underlined.update(underlined => !underlined)})
          .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', checked: strikethrough, onSelect: () => strikethrough.update(strikethrough => !strikethrough)}),
        )
        .addGroup({label: 'Heading', collapsible: {collapsed: true}, actions: contributeHeadingGroupActions}, menu => menu
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
        ),
      )
      .addGroup(group => group
        .addToolbarItem({icon: 'undo', onSelect})
        .addToolbarItem({icon: 'redo', onSelect})
        .addToolbarItem({icon: 'content_cut', onSelect})
        .addToolbarItem({icon: 'content_copy', onSelect})
        .addToolbarItem({icon: 'content_paste', onSelect}),
      ),
    );

    function contributeHeadingGroupActions(toolbar: SciToolbarFactory): void {
      toolbar
        .addToolbarItem({icon: 'favorite', accelerator: {ctrl: true, shift: true, key: 'Enter'}, onSelect})
        .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
          .addMenuItem('Don\'t Show Again For This Project', onSelect)
          .addMenuItem({label: 'Don\'t Show Again', accelerator: {ctrl: true, shift: true, key: 'S'}, onSelect}),
        );
    }

    function onSelect(): void {
      // NOOP
    }
  }

  private contributeSampleContextMenu(): void {
    const navigateWithSingleClick = signal(false);
    const alwaysSelectOpenedElement = signal(false);

    const dockedPinned = signal(false);
    const dockedUnpinned = signal(true);
    const undock = signal(false);
    const float = signal(false);
    const window = signal(false);

    const moveTo = signal<string | undefined>(undefined);

    contributeMenu('menu:demo.contextmenu', menu => menu
      .addMenuItem({label: 'Expand All', accelerator: {ctrl: true, shift: true, key: '+', location: 'numpad'}, onSelect: () => console.log(`>>> Ctrl+NumPad+ [location=menu:demo.contextmenu, contributor=${this.view.id}]`)})
      .addMenuItem({label: 'Collapse All', accelerator: {ctrl: true, shift: true, key: '-', location: 'numpad'}, onSelect: () => console.log(`>>> Ctrl+NumPad- [location=menu:demo.contextmenu, contributor=${this.view.id}]`)})
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: navigateWithSingleClick, onSelect: () => navigateWithSingleClick.update(navigateWithSingleClick => !navigateWithSingleClick)})
        .addMenuItem({label: 'Always Select Opened Element', checked: alwaysSelectOpenedElement, onSelect: () => alwaysSelectOpenedElement.update(alwaysSelectOpenedElement => !alwaysSelectOpenedElement)},
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', onSelect}),
        )
        .addGroup(group => group
          .addMenu({label: 'View Mode'}, menu => menu
            .addMenuItem({label: 'Docked pinned', checked: dockedPinned, onSelect: () => dockedPinned.update(value => !value)})
            .addMenuItem({label: 'Docked unpinned', checked: dockedUnpinned, onSelect: () => dockedUnpinned.update(value => !value)})
            .addMenuItem({label: 'Undock', checked: undock, onSelect: () => undock.update(value => !value)})
            .addMenuItem({label: 'Float', checked: float, onSelect: () => float.update(value => !value)})
            .addMenuItem({label: 'Window', checked: window, onSelect: () => window.update(value => !value)}),
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
            .addMenuItem('Stretch to Left', onSelect)
            .addMenuItem('Stretch to Right', onSelect)
            .addMenuItem('Stretch to Top', onSelect)
            .addMenuItem('Stretch to Bottom', onSelect)
            .addMenuItem('Maximize Tool Window', onSelect),
          ),
        )
        .addMenuItem('Remove from Sidebar', onSelect),
      ),
    );

    installMenuAccelerators('menu:demo.contextmenu');

    function onSelect(): void {
      // NOOP
    }
  }
}

interface WorkbenchPartActionDescriptor {
  content: string;
  align: 'start' | 'end';
  cssClass: string;
}
