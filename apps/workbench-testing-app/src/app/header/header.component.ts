/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, effect, inject, signal} from '@angular/core';
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
import {sortPerspectives} from './sort-perspectives.util';

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
  protected readonly lightThemeActiveFormControl = inject(NonNullableFormBuilder).control(true);
  protected readonly perspectiveSwitcherMenuOpen = signal(false);
  protected readonly settingsMenuOpen = signal(false);

  constructor() {
    this.installThemeSwitcher();
  }

  protected onPerspectiveSwitcherMenuOpen(element: Element): void {
    this.perspectiveSwitcherMenuOpen.set(true);
    const menuItems = this.contributePerspectiveSwitcherMenuItems();
    void this._menuService.openMenu(element, menuItems).finally(() => this.perspectiveSwitcherMenuOpen.set(false));
  };

  protected onSettingsMenuOpen(element: Element): void {
    this.settingsMenuOpen.set(true);
    void this._menuService.openMenu(element, [
      ...this.contributePerspectiveMenuItems(),
      new MenuItemSeparator(),
      ...this.contributeLayoutMenuItems(),
      new MenuItemSeparator(),
      ...this.contributeLoggerMenuItems(),
      new MenuItemSeparator(),
      ...this.contributeViewMenuItems(),
      new MenuItemSeparator(),
      ...this.contributeStartupMenuItems(),
      new MenuItemSeparator(),
      ...this.contributeNavigationMenuItems(),
      new MenuItemSeparator(),
      ...this.contributeSettingsMenuItems(),
    ]).finally(() => this.settingsMenuOpen.set(false));
  }

  private contributePerspectiveMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Reset Perspective',
        onAction: () => this.workbenchService.resetPerspective(),
      }),
    ];
  }

  private contributeLoggerMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Change log level to DEBUG',
        checked: this._logger.logLevel === LogLevel.DEBUG,
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'debug'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Change log level to INFO',
        checked: this._logger.logLevel === LogLevel.INFO,
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'info'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Change log level to WARN',
        checked: this._logger.logLevel === LogLevel.WARN,
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'warn'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Change log level to ERROR',
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
        text: 'Open workbench in new browser tab (LAZY)',
        onAction: () => this.openInNewWindow({standalone: false, launcher: 'LAZY'}),
      }),
      new MenuItem({
        text: 'Open workbench in new browser tab (APP_INITIALIZER)',
        onAction: () => this.openInNewWindow({standalone: false, launcher: 'APP_INITIALIZER'}),
      }),
      new MenuItem({
        text: 'Open standalone workbench in new browser tab (LAZY)',
        onAction: () => this.openInNewWindow({standalone: true, launcher: 'LAZY'}),
      }),
      new MenuItem({
        text: 'Open standalone workbench in new browser tab (APP_INITIALIZER)',
        onAction: () => this.openInNewWindow({standalone: true, launcher: 'APP_INITIALIZER'}),
      }),
    ];
  }

  private contributeNavigationMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Navigate to workbench page',
        cssClass: 'e2e-navigate-to-workbench-page',
        disabled: !this._router.isActive('test-pages/blank-test-page', {paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored'}),
        onAction: () => this._router.navigate(['workbench-page']), // Do not navigate to the root page so Angular does not remove the view outlets from the URL.
      }),
      new MenuItem({
        text: 'Navigate to blank page',
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
      this.lightThemeActiveFormControl.setValue(this.workbenchService.theme()?.colorScheme === 'light', {emitEvent: false});
    });

    this.lightThemeActiveFormControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(lightTheme => {
        void this.workbenchService.switchTheme(lightTheme ? 'scion-light' : 'scion-dark');
      });
  }

  private contributeSettingsMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Reset forms on submit',
        checked: this._settingsService.isEnabled('resetFormsOnSubmit'),
        onAction: () => this._settingsService.toggle('resetFormsOnSubmit'),
      }),
      new MenuItem({
        text: 'Display skeletons in sample view',
        checked: this._settingsService.isEnabled('displaySkeletons'),
        onAction: () => {
          this._settingsService.toggle('displaySkeletons');
          // Perform navigation for Angular to evaluate `CanMatch` guards.
          void inject(Router).navigate([{outlets: {}}], {skipLocationChange: true});
        },
      }),
      new MenuItem({
        text: 'Log Angular change detection cycles',
        cssClass: 'e2e-log-angular-change-detection-cycles',
        checked: this._settingsService.isEnabled('logAngularChangeDetectionCycles'),
        onAction: () => this._settingsService.toggle('logAngularChangeDetectionCycles'),
      }),
    ];
  }

  private contributeLayoutMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Widescreen Layout',
        checked: this.workbenchService.widescreenModeEnabled(),
        onAction: () => this.workbenchService.widescreenModeEnabled.update(enabled => !enabled),
      }),
    ];
  }

  private contributePerspectiveSwitcherMenuItems(): Array<MenuItem | MenuItemSeparator> {
    const groupLabels = new Map<string, string>()
      .set('sample-layout-docked-parts', 'Layout with Docked Parts')
      .set('sample-layout-fixed-parts', 'Layout with Fixed Parts');

    const menuItems = new Array<MenuItem | MenuItemSeparator>();

    [...this.workbenchService.perspectives()]
      // Sort perspectives.
      .sort(sortPerspectives)
      // Group perspectives.
      .reduce((grouped, perspective) => {
        const group = (perspective.data[PerspectiveData.menuGroup] ?? 'default') as string;
        return Maps.addListValue(grouped, group, perspective);
      }, new Map<string, WorkbenchPerspective[]>())
      // Create menu item for each perspective.
      .forEach((perspectives, group) => {
        if (menuItems.length) {
          menuItems.push(new MenuItemSeparator(groupLabels.get(group)));
        }
        perspectives.forEach(perspective => menuItems.push(new MenuItem({
          text: (perspective.data[PerspectiveData.menuItemLabel] ?? perspective.id) as string,
          onAction: () => void this.workbenchService.switchPerspective(perspective.id),
          checked: perspective.active(),
          attributes: {
            'data-perspectiveid': perspective.id,
          },
        })));
      });
    return menuItems;
  }
}
