/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Injector, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Application, Beans, MessageClient, OutletRouter, SciRouterOutletElement, TopicMessage } from '@scion/microfrontend-platform';
import { Topics } from '../microfrontend-api';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Overlay } from '@angular/cdk/overlay';
import { RouterOutletContextComponent } from '../router-outlet-context/router-outlet-context.component';
import { RouterOutletSettingsComponent } from '../router-outlet-settings/router-outlet-settings.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleService } from '../console/console.service';

export const URL = 'url';

/**
 * Allows entering a URL and displaying the web content in an iframe.
 */
@Component({
  selector: 'app-browser-outlet',
  templateUrl: './browser-outlet.component.html',
  styleUrls: ['./browser-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowserOutletComponent {

  public URL = URL;
  public form: FormGroup;
  public appEntryPoints$: Observable<AppEndpoint[]>;

  @Input()
  @HostBinding('attr.id')
  public outletName: string;

  @ViewChild('settings_button', {static: true})
  public _settingsButton: ElementRef<HTMLButtonElement>;

  @ViewChild('context_define_button', {static: true})
  public _contextDefineButton: ElementRef<HTMLButtonElement>;

  @ViewChild('router_outlet', {static: true})
  public _routerOutlet: ElementRef<SciRouterOutletElement>;

  constructor(host: ElementRef<HTMLElement>,
              formBuilder: FormBuilder,
              router: Router,
              private _route: ActivatedRoute,
              private _overlay: Overlay,
              private _injector: Injector,
              private _consoleService: ConsoleService) {
    this.form = formBuilder.group({
      [URL]: new FormControl('', Validators.required),
    });
    this.appEntryPoints$ = this.readAppEntryPoints();
  }

  public onUrlClearClick(): void {
    this.form.reset();
    this.navigate();
  }

  public onNavigateClick(): boolean {
    this.navigate();
    return false;
  }

  private navigate(): void {
    Beans.get(OutletRouter).navigate(this.form.get(URL).value, {outlet: this.outletName}).then();
  }

  public onSettingsClick(): void {
    RouterOutletSettingsComponent.openAsOverlay({
      anchor: this._settingsButton.nativeElement,
      overlay: this._overlay,
      routerOutlet: this._routerOutlet.nativeElement,
      injector: this._injector,
    });
  }

  public onContextDefineClick(): void {
    RouterOutletContextComponent.openAsOverlay({
      anchor: this._contextDefineButton.nativeElement,
      overlay: this._overlay,
      routerOutlet: this._routerOutlet.nativeElement,
      injector: this._injector,
    });
  }

  public onActivate(event: CustomEvent): void {
    this._consoleService.log('sci-router-outlet:onactivate', event.detail);
  }

  public onDeactivate(event: CustomEvent): void {
    this._consoleService.log('sci-router-outlet:ondeactivate', event.detail);
  }

  private readAppEntryPoints(): Observable<AppEndpoint[]> {
    return Beans.get(MessageClient).observe$(Topics.Applications)
      .pipe(
        take(1),
        map((reply: TopicMessage<Application[]>) => {
          const endpoints: AppEndpoint[] = [];
          const applications = reply.body;

          applications.forEach(application => {
            const origin = application.origin;
            const symbolicName = application.symbolicName;

            this._route.snapshot.parent.routeConfig.children
              .filter(childRoute => childRoute.data)
              .forEach(childRoute => {
                const matrixParams: Map<string, any> = childRoute.data['matrixParams'] || new Map();
                const matrixParamsEncoded = Array.from(matrixParams.keys())
                  .reduce((encoded, paramKey) => encoded.concat(`${paramKey}=${matrixParams.get(paramKey)}`), [])
                  .join(';');
                endpoints.push({url: `${origin}/#/testing-app/${childRoute.path}${matrixParamsEncoded ? `;${matrixParamsEncoded}` : ''}`, label: `${symbolicName}: ${childRoute.data['pageTitle']}`});
              });
          });
          return endpoints;
        }),
      );
  }
}

export interface AppEndpoint {
  url: string;
  label: string;
}
