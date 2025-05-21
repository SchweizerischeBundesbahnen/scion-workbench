/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, effect, inject, signal, untracked, WritableSignal} from '@angular/core';
import {PerspectiveData} from '../workbench.perspectives';
import {MenuItem, MenuItemSeparator} from '../menu/menu-item';
import {WorkbenchStartupQueryParams} from '../workbench/workbench-startup-query-params';
import {Router} from '@angular/router';
import {MenuService} from '../menu/menu.service';
import {Logger, LogLevel, WorkbenchPerspective, WorkbenchRouter, WorkbenchService} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciToggleButtonComponent} from '@scion/components.internal/toggle-button';
import {SettingsService} from '../settings.service';
import {Maps} from '@scion/toolkit/util';
import {comparePerspectives} from './perspective-comparator.util';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    SciToggleButtonComponent,
  ],
})
export class HeaderComponent {

  private readonly _router = inject(Router);
  private readonly _wbRouter = inject(WorkbenchRouter);
  private readonly _menuService = inject(MenuService);
  private readonly _settingsService = inject(SettingsService);
  private readonly _logger = inject(Logger);

  protected readonly workbenchService = inject(WorkbenchService);
  protected readonly PerspectiveData = PerspectiveData;
  protected readonly lightThemeActiveFormControl = inject(NonNullableFormBuilder).control<boolean | undefined>(undefined);
  protected readonly perspectiveSwitcherMenuState = signal<'open' | 'closed'>('closed');
  protected readonly settingsMenuState = signal<'open' | 'closed'>('closed');

  constructor() {
    this.installThemeSwitcher();
  }

  protected onPerspectiveSwitcherMenuOpen(element: Element): void {
    void runIfMenuClosed(async () => {
      const menuItems = this.findPerspectiveSwitcherMenuItems();
      await this._menuService.openMenu(element, menuItems);
    }, this.perspectiveSwitcherMenuState);
  };

  protected onSettingsMenuOpen(element: Element): void {
    void runIfMenuClosed(async () => {
      await this._menuService.openMenu(element, [
        new MenuItemSeparator('Log Level'),
        ...this.contributeLogLevelMenuItems(),
        new MenuItemSeparator(),
        ...this.contributeViewMenuItems(),
        new MenuItemSeparator(),
        ...this.contributeStartupMenuItems(),
        new MenuItemSeparator(),
        ...this.contributeNavigationMenuItems(),
        new MenuItemSeparator(),
        ...this.contributeSettingsMenuItems(),
      ]);
    }, this.settingsMenuState);
  }

  private contributeLogLevelMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Debug',
        checked: this._logger.logLevel === LogLevel.DEBUG,
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'debug'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Info',
        checked: this._logger.logLevel === LogLevel.INFO,
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'info'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Warn',
        checked: this._logger.logLevel === LogLevel.WARN,
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'warn'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Error',
        checked: this._logger.logLevel === LogLevel.ERROR,
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'error'}, queryParamsHandling: 'merge'}),
      }),
    ];
  }

  private contributeViewMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Open Start Page',
        cssClass: 'e2e-open-start-page',
        onAction: () => this._wbRouter.navigate(['start-page'], {target: 'blank'}),
      }),
      new MenuItem({
        text: 'Open Sample View',
        onAction: () => this._wbRouter.navigate(['sample-view'], {target: 'blank'}),
      }),
    ];
  }

  private contributeStartupMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Open in new Browser Tab',
        onAction: () => this.openInNewWindow({standalone: false, launcher: 'LAZY'}),
      }),
      new MenuItem({
        text: 'Open in new Browser Tab (No Micro Apps)',
        onAction: () => this.openInNewWindow({standalone: true, launcher: 'LAZY'}),
      }),
      new MenuItem({
        text: 'Open in new Browser Tab (App Initializer)',
        onAction: () => this.openInNewWindow({standalone: false, launcher: 'APP_INITIALIZER'}),
      }),
      new MenuItem({
        text: 'Open in new Browser Tab (App Initializer, No Micro Apps)',
        onAction: () => this.openInNewWindow({standalone: true, launcher: 'APP_INITIALIZER'}),
      }),
    ];
  }

  private contributeNavigationMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Navigate to Workbench Page',
        cssClass: 'e2e-navigate-to-workbench-page',
        disabled: !this._router.isActive('test-pages/blank-test-page', {paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored'}),
        onAction: () => this._router.navigate(['workbench-page']), // Do not navigate to the root page so Angular does not remove the view outlets from the URL.
      }),
      new MenuItem({
        text: 'Navigate to Blank Page',
        cssClass: 'e2e-navigate-to-blank-page',
        disabled: this._router.isActive('test-pages/blank-test-page', {paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored'}),
        onAction: () => this._router.navigate(['test-pages/blank-test-page']),
      }),
    ];
  }

  /**
   * Opens a new browser window with given startup options, preserving the current workbench layout.
   */
  private openInNewWindow(options: {launcher: 'APP_INITIALIZER' | 'LAZY'; standalone: boolean}): void {
    const href = new URL(location.href);
    href.searchParams.append(WorkbenchStartupQueryParams.LAUNCHER_QUERY_PARAM, options.launcher);
    href.searchParams.append(WorkbenchStartupQueryParams.STANDALONE_QUERY_PARAM, `${options.standalone}`);
    window.open(href);
  }

  protected onActivateLightTheme(): void {
    this.lightThemeActiveFormControl.setValue(true);
  }

  protected onActivateDarkTheme(): void {
    this.lightThemeActiveFormControl.setValue(false);
  }

  private installThemeSwitcher(): void {
    effect(() => {
      const theme = this.workbenchService.settings.theme();
      untracked(() => {
        this.lightThemeActiveFormControl.setValue(theme === 'scion-light', {emitEvent: false});
      });
    });

    this.lightThemeActiveFormControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(lightTheme => {
        this.workbenchService.settings.theme.set(lightTheme ? 'scion-light' : 'scion-dark');
      });
  }

  private contributeSettingsMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Reset Forms on Submit',
        checked: this._settingsService.isEnabled('resetFormsOnSubmit'),
        onAction: () => this._settingsService.toggle('resetFormsOnSubmit'),
      }),
      new MenuItem({
        text: 'Display Skeletons in Sample View',
        checked: this._settingsService.isEnabled('displaySkeletons'),
        onAction: () => {
          this._settingsService.toggle('displaySkeletons');
          // Perform navigation for Angular to evaluate `CanMatch` guards.
          void inject(Router).navigate([{outlets: {}}], {skipLocationChange: true});
        },
      }),
      new MenuItem({
        text: 'Log Angular Change Detection Cycles',
        cssClass: 'e2e-log-angular-change-detection-cycles',
        checked: this._settingsService.isEnabled('logAngularChangeDetectionCycles'),
        onAction: () => this._settingsService.toggle('logAngularChangeDetectionCycles'),
      }),
    ];
  }

  private findPerspectiveSwitcherMenuItems(): Array<MenuItem | MenuItemSeparator> {
    const groupLabels = new Map<string, string>()
      .set('peripheral-part-layout', 'Layout with Peripheral Parts');

    const menuItems = new Array<MenuItem | MenuItemSeparator>();

    [...this.workbenchService.perspectives()]
      // Sort perspectives.
      .sort(comparePerspectives)
      // Group perspectives.
      .reduce((grouped, perspective) => {
        const group = (perspective.data[PerspectiveData.menuGroup] ?? 'default') as string;
        return Maps.addListValue(grouped, group, perspective);
      }, new Map<string, WorkbenchPerspective[]>())
      // Add perspectives by group.
      .forEach((perspectives, group) => {
        menuItems.push(new MenuItemSeparator(groupLabels.get(group)));
        perspectives.forEach(perspective => menuItems.push(new MenuItem({
          text: (perspective.data[PerspectiveData.menuItemLabel] ?? perspective.id) as string,
          onAction: () => void this.workbenchService.switchPerspective(perspective.id),
          checked: perspective.active(),
          attributes: {'data-perspectiveid': perspective.id},
          actions: perspective.active() ? [{icon: 'undo', tooltip: 'Reset Perspective', onAction: () => this.workbenchService.resetPerspective()}] : [],
        })));
      });
    return menuItems;
  }
}

async function runIfMenuClosed(openFn: () => Promise<void>, state: WritableSignal<'open' | 'closed'>): Promise<void> {
  if (state() === 'open') {
    return;
  }

  state.set('open');
  try {
    await openFn();
  }
  finally {
    state.set('closed');
  }
}
