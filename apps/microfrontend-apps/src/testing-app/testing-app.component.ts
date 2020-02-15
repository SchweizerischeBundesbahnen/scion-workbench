/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Component, ElementRef, OnDestroy } from '@angular/core';
import { Beans, ClientConfig, ContextService, FocusMonitor, mapToBody, MessageClient, MicrofrontendPlatform, OutletContext, OUTLET_CONTEXT } from '@scion/microfrontend-platform';
import { ActivatedRoute } from '@angular/router';
import { filter, switchMapTo, takeUntil } from 'rxjs/operators';
import { fromEvent, merge, Subject } from 'rxjs';
import { Defined } from '@scion/toolkit/util';
import { ConsoleService } from './console/console.service';
import { TestingAppTopics } from './testing-app.topics';

@Component({
  selector: 'testing-app', // tslint:disable-line:component-selector
  templateUrl: './testing-app.component.html',
  styleUrls: ['./testing-app.component.scss'],
})
export class TestingAppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _routeActivate$ = new Subject<void>();
  public appSymbolicName: string;
  public pageTitle: string;
  public isFocusWithin: boolean;
  public isConsoleVisible = false;

  constructor(host: ElementRef<HTMLElement>, private _consoleService: ConsoleService) {
    this.appSymbolicName = Beans.get(ClientConfig).symbolicName;

    this.installFocusWithinListener();
    this.installRouteActivateListener();
    this.installKeyboardEventListener(host);
    this.installApplicationActivatedEventListener();
  }

  private installRouteActivateListener(): void {
    this._routeActivate$
      .pipe(
        switchMapTo(Beans.get(ContextService).observe$<OutletContext>(OUTLET_CONTEXT)),
        takeUntil(this._destroy$),
      )
      .subscribe(outletContext => {
        if (outletContext) {
          this._consoleService.log('onload', `${window.location.href} [app='${this.appSymbolicName}', outlet='${outletContext.name}']`);
        }
        else {
          this._consoleService.log('onload', `${window.location.href} [app='${this.appSymbolicName}']`);
        }
      });
  }

  private installFocusWithinListener(): void {
    Beans.get(FocusMonitor).focusWithin$
      .pipe(takeUntil(this._destroy$))
      .subscribe(isFocusWithin => {
        this.isFocusWithin = isFocusWithin;
      });
  }

  private installKeyboardEventListener(host: ElementRef<HTMLElement>): void {
    merge(fromEvent<KeyboardEvent>(host.nativeElement, 'keydown'), fromEvent<KeyboardEvent>(host.nativeElement, 'keyup'))
      .pipe(
        filter(event => (event.target as Element).tagName === 'SCI-ROUTER-OUTLET'),
        takeUntil(this._destroy$),
      )
      .subscribe(event => {
        this._consoleService.log(event.type, `[key='${event.key}', control=${event.ctrlKey}, shift=${event.shiftKey}, alt=${event.altKey}, meta=${event.metaKey}]`);
      });
  }

  private installApplicationActivatedEventListener(): void {
    Beans.get(MessageClient).observe$<string>(TestingAppTopics.ApplicationActivated)
      .pipe(
        mapToBody(),
        takeUntil(this._destroy$),
      )
      .subscribe(event => {
        this._consoleService.log('onActivate', event);
      });
  }

  public onRouteActivate(route: ActivatedRoute): void {
    const isPageTitleVisible = Defined.orElse(route.snapshot.data['pageTitleVisible'], true);
    this.pageTitle = isPageTitleVisible ? route.snapshot.data['pageTitle'] : null;
    this._routeActivate$.next();
  }

  public onConsoleToggle(): void {
    this.isConsoleVisible = !this.isConsoleVisible;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    MicrofrontendPlatform.destroy().then(); // Platform is started in {@link TestingAppPlatformInitializerResolver}
  }
}
