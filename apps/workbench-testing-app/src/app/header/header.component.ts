/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {PerspectiveData} from '../app.perspectives';
import {WorkbenchStartupQueryParams} from '../workbench/workbench-startup-query-params';
import {Router} from '@angular/router';
import {Logger, LogLevel, WorkbenchPerspective, WorkbenchRouter, WorkbenchService} from '@scion/workbench';
import {Settings} from '../settings.service';
import {Maps} from '@scion/toolkit/util';
import {comparePerspectives} from './perspective-comparator.util';
import {contributeMenu, SciMenuFactory, SciToolbarComponent, SciToolbarFactory, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {ThemeSwitcherComponent} from '../theme-switch-button/theme-switcher.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciToolbarComponent,
  ],
})
export class HeaderComponent {

  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _workbenchService = inject(WorkbenchService);
  private readonly _router = inject(Router);
  private readonly _settings = inject(Settings);
  private readonly _logger = inject(Logger);

  constructor() {
    this.contributeMainToolbar();
    this.contributeSettingsToolbar();
  }

  private contributeMainToolbar(): void {
    contributeMenu('toolbar:main', toolbar => {
      this.contributePerspectiveSwitcherMenu(toolbar);
    });
  }

  private contributeSettingsToolbar(): void {
    contributeMenu('toolbar:settings', toolbar => toolbar
      .addToolbarItem({control: ThemeSwitcherComponent})
      .addMenu({icon: 'more_vert', visualMenuHint: false, menu: {filter: true}, cssClass: 'e2e-settings-menu'}, menu => {
        this.contributeWorkbenchSettingsGroup(menu);
        this.contributeApplicationSettingsGroup(menu);
        this.contributeOpenGroup(menu);
        this.contributeNavigateGroup(menu);
        this.contributeLoggingGroup(menu)
      }),
    );
  }

  private contributeWorkbenchSettingsGroup(menu: SciMenuFactory): void {
    menu.addGroup({label: 'Workbench Settings'}, group => group
      .addMenu('Panel Alignment', menu => menu
        .addMenuItem({
          label: 'Left',
          checked: computed(() => this._workbenchService.settings.panelAlignment() === 'left'),
          cssClass: 'e2e-change-panel-alignment-left',
          onSelect: () => this._workbenchService.settings.panelAlignment.set('left'),
        })
        .addMenuItem({
          label: 'Right',
          checked: computed(() => this._workbenchService.settings.panelAlignment() === 'right'),
          cssClass: 'e2e-change-panel-alignment-right',
          onSelect: () => this._workbenchService.settings.panelAlignment.set('right'),
        })
        .addMenuItem({
          label: 'Center',
          checked: computed(() => this._workbenchService.settings.panelAlignment() === 'center'),
          cssClass: 'e2e-change-panel-alignment-center',
          onSelect: () => this._workbenchService.settings.panelAlignment.set('center'),
        })
        .addMenuItem({
          label: 'Justify',
          checked: computed(() => this._workbenchService.settings.panelAlignment() === 'justify'),
          cssClass: 'e2e-change-panel-alignment-justify',
          onSelect: () => this._workbenchService.settings.panelAlignment.set('justify'),
        }),
      )
      .addMenuItem({
        label: 'Show Toolbars Only on Hover or Focus',
        checked: computed(() => this._workbenchService.settings.toolbarVisibility() === 'on-hover-or-focus'),
        onSelect: () => this._workbenchService.settings.toolbarVisibility.update(visibility => visibility === 'always' ? 'on-hover-or-focus' : 'always'),
      })
      .addMenuItem({
        label: 'Enable Panel Animation',
        checked: this._workbenchService.settings.panelAnimation,
        onSelect: () => this._workbenchService.settings.panelAnimation.update(enabled => !enabled),
      })
    );
  }

  private contributeApplicationSettingsGroup(menu: SciMenuFactory): void {
    menu.addGroup({label: 'Application Settings'}, group => group
      .addMenuItem({
        label: 'Show Skeletons',
        checked: this._settings.showSkeletons,
        onSelect: () => {
          this._settings.showSkeletons.update(enabled => !enabled);
          // Perform navigation for Angular to evaluate `CanMatch` guards.
          void this._router.navigate([{outlets: {}}], {skipLocationChange: true});
        },
      })
      .addMenuItem({
        label: 'Show Microfrontend Application Labels',
        checked: this._settings.showMicrofrontendApplicationLabels,
        onSelect: () => this._settings.showMicrofrontendApplicationLabels.update(enabled => !enabled),
      })
      .addMenuItem({
        label: 'Show Test Perspectives',
        checked: this._settings.showTestPerspectives,
        onSelect: () => this._settings.showTestPerspectives.update(enabled => !enabled),
      })
      .addMenuItem({
        label: 'Highlight Focus',
        checked: this._settings.highlightFocus,
        onSelect: () => this._settings.highlightFocus.update(enabled => !enabled),
      })
      .addMenuItem({
        label: 'Highlight Glasspane',
        checked: this._settings.highlightGlasspane,
        onSelect: () => this._settings.highlightGlasspane.update(enabled => !enabled),
      })
      .addMenuItem({
        label: 'Reset Forms on Submit',
        checked: this._settings.resetFormsOnSubmit,
        onSelect: () => this._settings.resetFormsOnSubmit.update(enabled => !enabled),
      }),
    );
  }

  private contributeOpenGroup(menu: SciMenuFactory): void {
    menu.addGroup(group => group
      .addMenu('Open View', menu => menu
        .addMenuItem({
          label: 'Open Start Page',
          cssClass: 'e2e-open-start-page',
          onSelect: () => this._workbenchRouter.navigate(['start-page'], {target: 'blank'}),
        })
        .addMenuItem({
          label: 'Open Sample View',
          onSelect: () => this._workbenchRouter.navigate(['sample-view'], {target: 'blank'}),
        }),
      )
      .addMenu('Open Application', menu => menu
        .addGroup({label: 'Starting Workbench in App Component'}, group => group
          .addMenuItem({
            label: 'Open in new Browser Tab',
            onSelect: () => this.openInNewWindow({standalone: false, launcher: 'LAZY'}),
          })
          .addMenuItem({
            label: 'Open in new Browser Tab (Exclude Micro Apps)',
            onSelect: () => this.openInNewWindow({standalone: true, launcher: 'LAZY'}),
          }),
        )
        .addGroup({label: 'Starting Workbench in App Initializer'}, group => group
          .addMenuItem({
            label: 'Open in new Browser Tab',
            onSelect: () => this.openInNewWindow({standalone: false, launcher: 'APP_INITIALIZER'}),
          })
          .addMenuItem({
            label: 'Open in new Browser Tab (Exclude Micro Apps)',
            onSelect: () => this.openInNewWindow({standalone: true, launcher: 'APP_INITIALIZER'}),
          }),
        ),
      ),
    );
  }

  private contributeNavigateGroup(menu: SciMenuFactory): void {
    menu.addGroup(group => group.addMenu('Navigate Primary Router Outlet', menu => menu
      .addMenuItem({
        label: 'Navigate to Workbench Page',
        cssClass: 'e2e-navigate-to-workbench-page',
        disabled: computed(() => {
          // TODO [Angular 22] Check if Angular provides active signal on router.
          this._router.currentNavigation(); // Track navigation to invalidate reactive context.
          return !this._router.isActive('test-pages/blank-test-page', {paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored'});
        }),
        onSelect: () => this._router.navigate(['redirect-to-root']), // Do not navigate to the root page so Angular does not remove the view outlets from the URL.
      })
      .addMenuItem({
        label: 'Navigate to Non-Workbench Page',
        cssClass: 'e2e-navigate-to-blank-page',
        disabled: computed(() => {
          // TODO [Angular 22] Check if Angular provides active signal on router.
          this._router.currentNavigation(); // Track navigation to invalidate reactive context.
          return this._router.isActive('test-pages/blank-test-page', {paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored'});
        }),
        onSelect: () => this._router.navigate(['test-pages/blank-test-page']),
      }),
    ));
  }

  private contributeLoggingGroup(menu: SciMenuFactory): void {
    menu.addGroup(group => group
      .addMenu('Log Level', menu => menu
        .addMenuItem({
          label: 'Debug',
          checked: this._logger.logLevel === LogLevel.DEBUG,
          onSelect: () => this._router.navigate([], {queryParams: {loglevel: 'debug'}, queryParamsHandling: 'merge'}),
        })
        .addMenuItem({
          label: 'Info',
          checked: this._logger.logLevel === LogLevel.INFO,
          onSelect: () => this._router.navigate([], {queryParams: {loglevel: 'info'}, queryParamsHandling: 'merge'}),
        })
        .addMenuItem({
          label: 'Warn',
          checked: this._logger.logLevel === LogLevel.WARN,
          onSelect: () => this._router.navigate([], {queryParams: {loglevel: 'warn'}, queryParamsHandling: 'merge'}),
        })
        .addMenuItem({
          label: 'Error',
          checked: this._logger.logLevel === LogLevel.ERROR,
          onSelect: () => this._router.navigate([], {queryParams: {loglevel: 'error'}, queryParamsHandling: 'merge'}),
        }),
      )
      .addMenuItem({
        label: 'Log Angular Change Detection Cycles',
        checked: this._settings.logAngularChangeDetectionCycles,
        cssClass: 'e2e-log-angular-change-detection-cycles',
        onSelect: () => {
          this._settings.logAngularChangeDetectionCycles.update(enabled => !enabled);
          return true;
        },
      }),
    );
  }

  private contributePerspectiveSwitcherMenu(toolbar: SciToolbarFactory): void {
    const menuDescriptor: SciToolbarMenuDescriptor = {
      label: computed(() => this._workbenchService.activePerspective()?.data?.[PerspectiveData.label] as string | undefined ?? this._workbenchService.activePerspective()?.id ?? 'unkown'),
      tooltip: 'Switch Perspective',
      cssClass: ['perspective-switcher', 'e2e-perspective-switcher-menu'],
    };
    toolbar.addMenu(menuDescriptor, menu => {
      const groupLabels = new Map()
        .set('docked-part-layout', 'Layout with Docked Parts')
        .set('aligned-part-layout', 'Layout with Aligned Parts')
        .set('test-perspectives', 'Test Perspectives');

      this._workbenchService.perspectives()
        // Filter perspectives based on the visible flag.
        .filter(perspective => isPerspectiveVisible(perspective))
        // Sort perspectives.
        .sort(comparePerspectives)
        // Group perspectives.
        .reduce((grouped, perspective) => {
          const group = (perspective.data[PerspectiveData.menuGroup] ?? 'default') as string;
          return Maps.addListValue(grouped, group, perspective);
        }, new Map<string, WorkbenchPerspective[]>())
        // Add perspectives by group.
        .forEach((perspectives, group) => {
          menu.addGroup({label: groupLabels.get(group)}, group => {
            contributePerspectiveMenuItems(group, perspectives);
          });
        });
    });

    function contributePerspectiveMenuItems(group: SciMenuFactory, perspectives: WorkbenchPerspective[]): void {
      const workbenchService = inject(WorkbenchService);

      for (const perspective of perspectives) {
        group.addMenuItem({
          label: perspective.data[PerspectiveData.menuItemLabel] as string | undefined ?? perspective.id,
          active: perspective.active,
          attributes: {'data-perspectiveid': perspective.id},
          actions: actions => perspective.active() && actions.addToolbarItem({
            icon: 'undo',
            tooltip: 'Reset Perspective',
            onSelect: () => workbenchService.resetPerspective(),
          }),
          onSelect: () => void workbenchService.switchPerspective(perspective.id),
        });
      }
    }

    function isPerspectiveVisible(perspective: WorkbenchPerspective): boolean {
      const visible = perspective.data[PerspectiveData.visible] as boolean | (() => boolean) | undefined ?? true;
      return typeof visible === 'function' ? visible() : visible;
    }
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
}
