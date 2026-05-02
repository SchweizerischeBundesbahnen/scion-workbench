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
import {CanCloseRef, WorkbenchMenuContexts, WorkbenchMenuService, WorkbenchMessageBoxService, WorkbenchRouter, WorkbenchToolbarFactory, WorkbenchView} from '@scion/workbench-client';
import {ActivatedRoute} from '@angular/router';
import {UUID} from '@scion/toolkit/uuid';
import {BehaviorSubject, MonoTypeOperatorFunction, NEVER} from 'rxjs';
import {finalize, startWith, take} from 'rxjs/operators';
import {APP_INSTANCE_ID} from '../app-instance-id';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {AsyncPipe, JsonPipe, Location} from '@angular/common';
import {AppendDataTypePipe, NullIfEmptyPipe, parseTypedObject} from 'workbench-testing-app-common';
import {SciViewportComponent} from '@scion/components/viewport';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {contributeMenu, installMenuAccelerators, SciMenubarComponent, SciMenuService, SciToolbarComponent, SciToolbarFactory} from '@scion/components/menu';
import {Disposable} from '@scion/toolkit/types';

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
    SciMenubarComponent,
  ],
})
export default class ViewPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(WorkbenchRouter);
  private readonly _messageBoxService = inject(WorkbenchMessageBoxService);
  private readonly _menuService = inject(SciMenuService);
  private readonly _workbenchMenuService = inject(WorkbenchMenuService);
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

  protected contributionRef1: Disposable | undefined;
  protected contributionRef2: Disposable | undefined;
  protected toolbarVisible = true;

  constructor() {
    this.view.markDirty(NEVER.pipe(this.logCompletion('DirtyObservableComplete')));
    this.view.setClosable(this.form.controls.closable.valueChanges.pipe(this.logCompletion('ClosableObservableComplete')));

    this.installCanCloseGuard();
    this.installViewActiveStateLogger();
    this.installObservableCompletionLogger();

    this.contributeMenubar();
    // this.contributeClientMenubar();

    this.contributeViewToolbar();
    // this.contributeClientToolbar();

    this.contributePartToolbar();
    // this.contributeClientPartToolbar();

    this.contributeContextMenu();
    // this.contributeClientContextMenu();

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
  }

  private contributeMenubar(): void {
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
      .addMenu({label: 'File', filter: {placeholder: 'hello', notFoundText: 'nüd found'}}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', onSelect: () => onSelect()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => onSelect()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => onSelect()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()})
          .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', onSelect: () => onSelect()})
            .addMenuItem({label: 'Italic', icon: 'format_italic', onSelect: () => onSelect()})
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

    contributeMenu({location: 'menubar:view', position: 'end'}, menubar => menubar
      .addMenu({label: 'Menu 4', name: 'menu:view.menubar:additions'}, menu => menu),
    );
  }

  public contributeClientMenubar(): void {
    this._workbenchMenuService.contributeMenu('menubar:view', menubar => menubar
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

    this._workbenchMenuService.contributeMenu({location: 'menubar:view', position: 'start'}, menu => menu
      .addMenu({label: 'File', filter: {placeholder: 'hello', notFoundText: 'nüd found'}}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', onSelect: () => onSelect()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => onSelect()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => onSelect()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()})
          .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', onSelect: () => onSelect()})
            .addMenuItem({label: 'Italic', icon: 'format_italic', onSelect: () => onSelect()})
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

    this._workbenchMenuService.contributeMenu({location: 'menubar:view', position: 'end'}, menubar => menubar
      .addMenu({label: 'Menu 4', name: 'menu:view.menubar:additions'}, menu => menu),
    );

    this._workbenchMenuService.contributeMenu('menu:view.menubar:additions', menu => menu
      .addMenuItem({label: 'Expand All', onSelect: () => onSelect()})
      .addMenuItem({label: 'Collapse All', onSelect: () => onSelect()})
      .addMenu({label: 'Additions', name: 'menu:additions'}, menu => menu)
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: toObservable(computed(() => flags().has('navigate_with_single_click'))), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: toObservable(computed(() => flags().has('always_select_opened_element'))), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')}),
      )
      .addGroup(group => group
        .addMenuItem({label: 'Speed Search', icon: 'search', onSelect: () => onSelect()}),
      ),
    );
  }

  private contributeViewToolbar(): void {
    const bold = signal(false);
    const italic = signal(false);
    const underlined = signal(false);
    const strikethrough = signal(false);

    contributeMenu('toolbar:view', toolbar => toolbar
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
        .addGroup({label: 'Heading', collapsible: true, actions: addHeadingGroupActions}, menu => menu
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
        .addToolbarItem({icon: 'undo', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'redo', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_cut', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_copy', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_paste', onSelect: () => onSelect()}),
      ),
    );
  }

  public contributeClientToolbar(): void {
    const bold = new BehaviorSubject(false);
    const italic = new BehaviorSubject(true);
    const underlined = new BehaviorSubject(false);
    const strikethrough = new BehaviorSubject(false);

    this._workbenchMenuService.contributeMenu('toolbar:view', toolbar => toolbar
      .addGroup(group => group
        .addToolbarItem({icon: 'format_bold', checked: bold, onSelect: () => bold.next(!bold.value)})
        .addToolbarItem({icon: 'format_italic', checked: italic, onSelect: () => italic.next(!italic.value)})
        .addToolbarItem({icon: 'format_underlined', checked: underlined, onSelect: () => underlined.next(!underlined.value)}),
      )
      .addMenu({icon: 'palette', filter: true}, menu => menu
        .addGroup(group => group
          .addMenuItem({label: 'Bold', icon: 'format_bold', checked: bold, onSelect: () => bold.next(!bold.value)})
          .addMenuItem({label: 'Italic', icon: 'format_italic', checked: italic, onSelect: () => italic.next(!italic.value)})
          .addMenuItem({label: 'Underline', icon: 'format_underlined', checked: underlined, onSelect: () => underlined.next(!underlined.value)})
          .addMenuItem({label: 'Strikethrough', icon: 'strikethrough_s', checked: strikethrough, onSelect: () => strikethrough.next(!strikethrough.value)}),
        )
        .addGroup({label: 'Heading', collapsible: {collapsed: true}, actions: addHeadingGroupClientActions}, menu => menu
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
        .addToolbarItem({icon: 'undo', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'redo', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_cut', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_copy', onSelect: () => onSelect()})
        .addToolbarItem({icon: 'content_paste', onSelect: () => onSelect()}),
      ),
    );
  }

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
        menu.addToolbarItem('favorite', onSelect);
      }, {requiredContext: new Map().set(WorkbenchMenuContexts.ViewId, undefined), injector: this._injector});
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
        menu.addToolbarItem('train', onSelect);
      }, {requiredContext: new Map().set(WorkbenchMenuContexts.ViewId, undefined), injector: this._injector});
    }
  }

  public contributeClientPartToolbar(): void {
    this._workbenchMenuService.contributeMenu('toolbar:workbench.part.toolbar', menu => menu
      .addMenu({icon: 'computer', label: 'Client', filter: {placeholder: 'hello', notFoundText: 'nüd found'}}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', onSelect: () => onSelect()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => onSelect()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => onSelect()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()})
          .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', onSelect: () => onSelect()})
            .addMenuItem({label: 'Italic', icon: 'format_italic', onSelect: () => onSelect()})
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
  }

  private contributePartToolbar(): void {
    contributeMenu('menu:workbench.part.toolbar', menu => menu
      .addMenuItem({label: 'Expand All', accelerator: {ctrl: true, key: '+', location: 'numpad'}, onSelect: () => console.log('>>> expand all')})
      .addMenuItem({label: 'Collapse All', accelerator: {ctrl: true, key: '-', location: 'numpad'}, onSelect: () => console.log('>>> collapse all')}),
    );
    contributeMenu('toolbar:workbench.part.toolbar', toolbar => toolbar
      .addMenu({icon: 'star', filter: {placeholder: 'hello', notFoundText: 'nüd found'}}, menu => menu
        .addMenuItem({label: 'New', icon: 'article', accelerator: {ctrl: true, shift: true, key: 'N'}, onSelect: () => onSelect()})
        .addMenuItem({label: 'Open', icon: 'folder', onSelect: () => onSelect()})
        .addMenuItem({label: 'Make a Copy', icon: 'file_copy', onSelect: () => onSelect()})
        .addMenu({label: 'Share', name: 'menu:share', icon: 'person_add'}, menu => menu
          .addMenuItem({label: 'Share with others', icon: 'person_add', name: 'menuitem:share-with-others', onSelect: () => onSelect()})
          .addMenuItem({label: 'Publish to web', icon: 'public', onSelect: () => onSelect()})
          .addMenu({label: 'Text', icon: 'format_bold'}, menu => menu
            .addMenuItem({label: 'Bold', icon: 'format_bold', onSelect: () => onSelect()})
            .addMenuItem({label: 'Italic', icon: 'format_italic', onSelect: () => onSelect()})
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
    installMenuAccelerators('menu:contextmenu');

    contributeMenu('menu:contextmenu', (menu, context) => menu
      .addMenuItem({label: 'Expand All', accelerator: {ctrl: true, key: ' '}, onSelect: () => console.log('>>> expand all')})
      .addMenuItem({label: 'Collapse All', onSelect: onSelect})
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: computed(() => flags().has('navigate_with_single_click')), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: computed(() => flags().has('always_select_opened_element')), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')},
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', onSelect: () => console.log('>>> speed search (Ctrl + F)', context)}),
        )
        .addGroup(group => group
          .addMenu({label: '%viewmode.label'}, menu => menu
            .addMenuItem({label: '%docked_pinned.label', checked: computed(() => viewMode() === 'dock_pinned'), onSelect: () => viewMode.set('dock_pinned')})
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
    );
  }

  public contributeClientContextMenu(): void {
    const injector = inject(Injector);

    this._workbenchMenuService.installMenuAccelerators('menu:contextmenu');

    this._workbenchMenuService.contributeMenu('menu:contextmenu', (menu, context) => menu
      .addMenuItem({
        label: 'Expand All', accelerator: {ctrl: true, key: ' '}, onSelect: () => {
          console.log('>>> expand all');
        },
      })
      .addMenuItem({label: 'Collapse All', onSelect: onSelect})
      .addGroup(group => group
        .addMenuItem({label: 'Navigate with Single Click', checked: toObservable(computed(() => flags().has('navigate_with_single_click')), {injector}), onSelect: () => toggleMultiFlag(flags, 'navigate_with_single_click')})
        .addMenuItem({label: 'Always Select Opened Element', checked: toObservable(computed(() => flags().has('always_select_opened_element')), {injector}), onSelect: () => toggleMultiFlag(flags, 'always_select_opened_element')},
        )
        .addGroup(group => group
          .addMenuItem({label: 'Speed Search', icon: 'search', onSelect: () => console.log('>>> speed search (Ctrl + F)', context)}),
        )
        .addGroup(group => group
          .addMenu({label: '%viewmode.label'}, menu => menu
            .addMenuItem({label: '%docked_pinned.label', checked: toObservable(computed(() => viewMode() === 'dock_pinned'), {injector}), onSelect: () => viewMode.set('dock_pinned')})
            .addMenuItem({label: 'Dock Unpinned', checked: toObservable(computed(() => viewMode() === 'dock_unpinned'), {injector}), onSelect: () => viewMode.set('dock_unpinned')})
            .addMenuItem({label: 'Undock', checked: toObservable(computed(() => viewMode() === 'unddock'), {injector}), onSelect: () => viewMode.set('unddock')})
            .addMenuItem({label: 'Float', checked: toObservable(computed(() => viewMode() === 'float'), {injector}), onSelect: () => viewMode.set('float')})
            .addMenuItem({label: 'Window', checked: toObservable(computed(() => viewMode() === 'window'), {injector}), onSelect: () => viewMode.set('window')}))
          .addMenu({label: 'Move To'}, menu => menu
            .addMenuItem({label: 'Left Top', icon: 'dock_to_left', disabled: toObservable(computed(() => moveTo() === 'left_top'), {injector}), onSelect: () => moveTo.set('left_top')})
            .addMenuItem({label: 'Left Bottom', icon: 'dock_to_left', disabled: toObservable(computed(() => moveTo() === 'left_bottom'), {injector}), onSelect: () => moveTo.set('left_bottom')})
            .addMenuItem({label: 'Bottom Left', icon: 'dock_to_bottom', disabled: toObservable(computed(() => moveTo() === 'bottom_left'), {injector}), onSelect: () => moveTo.set('bottom_left')})
            .addMenuItem({label: 'Bottom Right', icon: 'dock_to_bottom', disabled: toObservable(computed(() => moveTo() === 'bottom_right'), {injector}), onSelect: () => moveTo.set('bottom_right')})
            .addMenuItem({label: 'Right Bottom', icon: 'dock_to_right', disabled: toObservable(computed(() => moveTo() === 'right_bottom'), {injector}), onSelect: () => moveTo.set('right_bottom')})
            .addMenuItem({label: 'Right Top', icon: 'dock_to_right', disabled: toObservable(computed(() => moveTo() === 'right_top'), {injector}), onSelect: () => moveTo.set('right_top')}),
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
  }

  protected onContextMenuWorkbenchClientOpen(event: PointerEvent): void {
    this._workbenchMenuService.open('menu:contextmenu', {anchor: event});
  }
}

function onSelect(): void {
  console.log('>>> onSelect');
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

function addHeadingGroupActions(toolbar: SciToolbarFactory): void {
  toolbar
    .addToolbarItem('favorite', onSelect)
    .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
      .addMenuItem('Don\'t Show Again For This Project', onSelect)
      .addMenuItem('Don\'t Show Again', onSelect),
    );
}

function addHeadingGroupClientActions(toolbar: WorkbenchToolbarFactory): void {
  toolbar
    .addToolbarItem('favorite', onSelect)
    .addMenu({icon: 'more_vert', visualMenuHint: false}, menu => menu
      .addMenuItem('Don\'t Show Again For This Project', onSelect)
      .addMenuItem('Don\'t Show Again', onSelect),
    );
}
