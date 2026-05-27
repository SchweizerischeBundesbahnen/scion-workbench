/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, effect, inject, Injector, inputBinding, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
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
import {UnderlineToolbarControlComponent} from './underline-toolbar-control/underline-toolbar-control.component';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-component-instance-id]': `uuid`,
  },
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
        .addMenu({label: 'Share', icon: 'person_add', menu: {name: 'menu:share'}}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()}),
        ),
      ),
    );

    contributeMenu('menubar:demo', menubar => menubar
      .addMenu({label: 'Menu 1'}, menu => menu
        .addMenuItem({label: 'Menu 1a', onSelect})
        .addMenuItem({label: 'Menu 1b', onSelect})
        .addMenuItem({label: 'Menu 1c', onSelect}),
      )
      .addMenu({label: 'Menu 2'}, menu => menu
        .addMenuItem({label: 'Menu 2a', onSelect})
        .addMenu({label: 'Menu 2b'}, menu => menu
          .addMenuItem({label: 'Submenu 1', onSelect})
          .addMenuItem({label: 'Submenu 2', onSelect})
          .addMenuItem({label: 'Submenu 3', onSelect}),
        )
        .addMenuItem({label: 'Menu 2c', onSelect}),
      )
      .addMenu({label: 'Menu 3'}, menu => menu
        .addMenuItem({label: 'Menu 3a', onSelect})
        .addMenuItem({label: 'Menu 3b', onSelect})
        .addMenuItem({label: 'Menu 3c', onSelect}),
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
    const underlinedStyle = signal<'solid' | 'double' | 'dashed' | 'dotted'>('solid');
    const strikethrough = signal(false);

    const gitAction = signal('pull_rebase');
    const gitIcons = new Map<string, string>()
      .set('pull_merge', 'merge')
      .set('pull_rebase', 'download')
      .set('fetch', 'south')
      .set('fetch_all', 'keyboard_double_arrow_down')
      .set('fetch_and_prune', 'download_2');

    const gitLabels = new Map<string, string>()
      .set('pull_merge', 'Pull - Merge')
      .set('pull_rebase', 'Pull - Rebase')
      .set('fetch', 'Fetch')
      .set('fetch_all', 'Fetch All')
      .set('fetch_and_prune', 'Fetch and Prune All');

    const listStyleActive = signal(false);
    const selectedListStyle = signal('number_list');
    const listStyleIcons = new Map<string, string>()
      .set('number_list', 'format_list_numbered')
      .set('bullet_list', 'format_list_bulleted');
    const listStyleLabels = new Map<string, string>()
      .set('number_list', 'Number List')
      .set('bullet_list', 'Bullet List');

    contributeMenu('toolbar:demo', toolbar => toolbar
      // TODO [menu]: Find better example for split button
      .addToolbarSplitButton({
        icon: computed(() => gitIcons.get(gitAction())!),
        label: computed(() => gitLabels.get(gitAction())!),
        tooltip: computed(() => gitLabels.get(gitAction())!),
        accelerator: {ctrl: true, shift: true, key: 'G'},
        onSelect: () => console.log(`>>> Git Default Action: ${gitAction()}`),
      }, menu => menu
        .addMenuItem({label: 'Open Pull Dialog...', accelerator: {ctrl: true, key: 'ArrowDown'}, onSelect: () => console.log('>>> Opening Pull Dialog [Ctrl+Down]')})
        .addGroup(group => group
          .addMenuItem({icon: gitIcons.get('pull_merge'), label: 'Pull - Merge', onSelect})
          .addMenuItem({icon: gitIcons.get('pull_rebase'), label: 'Pull - Rebase', onSelect})
          .addMenuItem({icon: gitIcons.get('fetch'), label: 'Fetch', onSelect})
          .addMenuItem({icon: gitIcons.get('fetch_all'), label: 'Fetch All', onSelect})
          .addMenuItem({icon: gitIcons.get('fetch_and_prune'), label: 'Fetch and Prune All', onSelect}),
        )
        .addMenu({label: 'Set Default Pull Button Action'}, menu => menu
          .addMenuItem({checked: computed(() => gitAction() === 'pull_merge'), label: gitLabels.get('pull_merge')!, onSelect: () => setDefaultGitAction('pull_merge')})
          .addMenuItem({checked: computed(() => gitAction() === 'pull_rebase'), label: gitLabels.get('pull_rebase')!, onSelect: () => setDefaultGitAction('pull_rebase')})
          .addMenuItem({checked: computed(() => gitAction() === 'fetch'), label: gitLabels.get('fetch')!, onSelect: () => setDefaultGitAction('fetch')})
          .addMenuItem({checked: computed(() => gitAction() === 'fetch_all'), label: gitLabels.get('fetch_all')!, onSelect: () => setDefaultGitAction('fetch_all')})
          .addMenuItem({checked: computed(() => gitAction() === 'fetch_and_prune'), label: gitLabels.get('fetch_and_prune')!, onSelect: () => setDefaultGitAction('fetch_and_prune')}),
        ))
      // TODO [menu]: Find better example for checkable split button
      .addToolbarSplitButton({
        icon: computed(() => listStyleIcons.get(selectedListStyle())!),
        tooltip: computed(() => listStyleLabels.get(selectedListStyle())!),
        checked: listStyleActive,
        onSelect: () => listStyleActive.update(active => !active),
      }, menu => menu
        .addMenuItem({icon: listStyleIcons.get('number_list'), label: listStyleLabels.get('number_list')!, onSelect: () => selectedListStyle.set('number_list')})
        .addMenuItem({icon: listStyleIcons.get('bullet_list'), label: listStyleLabels.get('bullet_list')!, onSelect: () => selectedListStyle.set('bullet_list')}))
      .addGroup(group => group
        .addToolbarButton({icon: 'format_bold', checked: bold, tooltip: 'Bold', accelerator: {ctrl: true, key: 'b'}, onSelect: () => bold.update(bold => !bold)})
        .addToolbarButton({icon: 'format_italic', checked: italic, tooltip: 'Italic', accelerator: {ctrl: true, key: 'i'}, onSelect: () => italic.update(italic => !italic)})
        .addToolbarSplitButton({icon: 'format_underlined', checked: underlined, tooltip: 'Underline', accelerator: {ctrl: true, key: 'u'}, onSelect: () => underlined.update(underlined => !underlined)}, menu => menu
          .addGroup({glyphArea: false}, group => group
            .addMenuItem({label: {component: UnderlineToolbarControlComponent, bindings: [inputBinding('style', signal('solid'))]}, onSelect: () => setUnderlined('solid')})
            .addMenuItem({label: {component: UnderlineToolbarControlComponent, bindings: [inputBinding('style', signal('double'))]}, onSelect: () => setUnderlined('double')})
            .addMenuItem({label: {component: UnderlineToolbarControlComponent, bindings: [inputBinding('style', signal('dashed'))]}, onSelect: () => setUnderlined('dashed')}),
          )
          .addMenu({icon: 'format_color_fill', label: 'Underline Color'}, menu => menu
            .addMenuItem({label: 'Black', onSelect})
            .addMenuItem({label: 'Red', onSelect})
            .addMenuItem({label: 'Green', onSelect})
            .addMenuItem({label: 'Blue', onSelect})
            .addMenuItem({label: 'Yellow', onSelect})
            .addMenuItem({label: 'More...', onSelect}),
          ),
        ),
      )
      .addToolbarMenu({icon: 'palette', menu: {filter: true}}, menu => menu
        .addGroup(group => group
          .addMenuItem({label: 'Bold', checked: bold, onSelect: () => bold.update(bold => !bold)})
          .addMenuItem({label: 'Italic', checked: italic, onSelect: () => italic.update(italic => !italic)})
          .addMenuItem({label: 'Underline', checked: underlined, onSelect: () => underlined.update(underlined => !underlined)})
          .addMenuItem({label: 'Strikethrough', checked: strikethrough, onSelect: () => strikethrough.update(strikethrough => !strikethrough)}),
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
        .addToolbarButton({icon: 'undo', onSelect})
        .addToolbarButton({icon: 'redo', onSelect})
        .addToolbarButton({icon: 'content_cut', onSelect})
        .addToolbarButton({icon: 'content_copy', onSelect})
        .addToolbarButton({icon: 'content_paste', onSelect}),
      ),
    );

    function contributeHeadingGroupActions(toolbar: SciToolbarFactory): void {
      toolbar
        .addToolbarButton({icon: 'favorite', accelerator: {ctrl: true, shift: true, key: 'Enter'}, onSelect})
        .addToolbarMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
          .addMenuItem({label: 'Don\'t Show Again For This Project', onSelect})
          .addMenuItem({label: 'Don\'t Show Again', accelerator: {ctrl: true, shift: true, key: 'S'}, onSelect}),
        );
    }

    function onSelect(): void {
      // NOOP
    }

    function setUnderlined(style: 'solid' | 'double' | 'dashed' | 'dotted'): void {
      underlined.set(true);
      underlinedStyle.set(style);
    }

    function setDefaultGitAction(action: string): boolean {
      gitAction.set(action);
      return true;
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
            .addMenuItem({label: 'Stretch to Left', onSelect})
            .addMenuItem({label: 'Stretch to Right', onSelect})
            .addMenuItem({label: 'Stretch to Top', onSelect})
            .addMenuItem({label: 'Stretch to Bottom', onSelect})
            .addMenuItem({label: 'Maximize Tool Window', onSelect}),
          ),
        )
        .addMenuItem({label: 'Remove from Sidebar', onSelect}),
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
