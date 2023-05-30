/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {distinct, map, takeUntil} from 'rxjs/operators';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {combineLatest, Observable, Subject} from 'rxjs';
import {WorkbenchModule, WorkbenchRouter, WorkbenchRouterLinkDirective, WorkbenchService, WorkbenchStartup} from '@scion/workbench';
import {MenuService} from '../menu/menu.service';
import {MenuItem, MenuItemSeparator} from '../menu/menu-item';
import {WorkbenchStartupQueryParams} from './workbench-startup-query-params';
import {PerspectiveData} from '../workbench.perspectives';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';

@Component({
  selector: 'app-workbench',
  styleUrls: ['./workbench.component.scss'],
  templateUrl: './workbench.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    WorkbenchModule,
    WorkbenchRouterLinkDirective,
  ],
})
export class WorkbenchComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public showNewTabAction$: Observable<boolean>;
  public PerspectiveData = PerspectiveData;
  public whenWorkbenchStarted: Promise<boolean>;

  constructor(private _route: ActivatedRoute,
              private _wbRouter: WorkbenchRouter,
              private _menuService: MenuService,
              private _router: Router,
              public workbenchService: WorkbenchService,
              workbenchStartup: WorkbenchStartup) {
    this.whenWorkbenchStarted = workbenchStartup.whenStarted.then(() => true);
    this.showNewTabAction$ = this._route.queryParamMap.pipe(map(params => !params.has('showNewTabAction') || coerceBooleanProperty(params.get('showNewTabAction'))));
    this.installStickyStartViewTab();
  }

  public async onPerspectiveActivate(id: string): Promise<void> {
    await this.workbenchService.switchPerspective(id);
  }

  public onMenuOpen(event: MouseEvent): void {
    this._menuService.openMenu(event, [
        ...this.contributePerspectiveMenuItems(),
        new MenuItemSeparator(),
        ...this.contributeLoggerMenuItems(),
        new MenuItemSeparator(),
        ...this.contributeStartupMenuItems(),
      ],
    );
  }

  private contributePerspectiveMenuItems(): MenuItem[] {
    return [
      new MenuItem({
          text: 'Reset Perspective',
          disabled: !this.workbenchService.perspectives.length,
          onAction: () => this.workbenchService.resetPerspective(),
        },
      ),
    ];
  }

  private contributeLoggerMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Change log level to DEBUG',
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'debug'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Change log level to INFO',
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'info'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Change log level to WARN',
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'warn'}, queryParamsHandling: 'merge'}),
      }),
      new MenuItem({
        text: 'Change log level to ERROR',
        onAction: () => this._router.navigate([], {queryParams: {loglevel: 'error'}, queryParamsHandling: 'merge'}),
      }),
    ];
  }

  private contributeStartupMenuItems(): MenuItem[] {
    return [
      new MenuItem({
        text: 'Open workbench in new tab (LAZY)',
        onAction: () => this.openInNewWindow({standalone: false, launcher: 'LAZY'}),
      }),
      new MenuItem({
        text: 'Open workbench in new tab (APP_INITIALIZER)',
        onAction: () => this.openInNewWindow({standalone: false, launcher: 'APP_INITIALIZER'}),
      }),
      new MenuItem({
        text: 'Open standalone workbench in new tab (LAZY)',
        onAction: () => this.openInNewWindow({standalone: true, launcher: 'LAZY'}),
      }),
      new MenuItem({
        text: 'Open standalone workbench in new tab (APP_INITIALIZER)',
        onAction: () => this.openInNewWindow({standalone: true, launcher: 'APP_INITIALIZER'}),
      }),
    ];
  }

  /**
   * If enabled, installs the handler to automatically open the start tab when the user closes the last tab.
   */
  private installStickyStartViewTab(): void {
    const stickyStartViewTab$ = this._route.queryParamMap.pipe(map(params => coerceBooleanProperty(params.get('stickyStartViewTab'))), distinct());
    const views$ = this.workbenchService.views$;
    combineLatest([stickyStartViewTab$, views$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([stickyStartViewTab, views]) => {
        if (stickyStartViewTab && views.length === 0) {
          this._wbRouter.navigate(['/start-page']).then();
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
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
