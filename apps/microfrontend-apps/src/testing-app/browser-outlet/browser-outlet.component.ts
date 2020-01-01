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
  public endpoints$: Observable<AppEndpoint[]>;

  @Input()
  @HostBinding('attr.id')
  public outletName: string;

  @ViewChild('settings_button', {static: true})
  public _settingsButton: ElementRef<HTMLButtonElement>;

  @ViewChild('context_define_button', {static: true})
  public _contextDefineButton: ElementRef<HTMLButtonElement>;

  @ViewChild('router_outlet', {static: true})
  public _routerOutlet: ElementRef<SciRouterOutletElement>;

  constructor(formBuilder: FormBuilder, private _overlay: Overlay, private _injector: Injector) {
    this.form = formBuilder.group({
      [URL]: new FormControl('', Validators.required),
    });
    this.endpoints$ = Beans.get(MessageClient).observe$(Topics.Applications)
      .pipe(
        take(1),
        map((reply: TopicMessage<Application[]>) => {
          const endpoints: AppEndpoint[] = [];
          const applications = reply.body;

          applications.forEach(application => {
            const origin = application.origin;
            const symbolicName = application.symbolicName;

            endpoints.push({url: `${origin}/#/testing-app/publish-message`, label: `Publish messages (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/receive-message`, label: `Receive messages (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/manage-capabilities`, label: `Manage capabilities (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/manage-intents`, label: `Manage intents (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/browser-outlets;count=2`, label: `Display web content in a browser outlet (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/outlet-router`, label: `Controls the web content to be displayed in a router outlet (router outlet navigation) (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/router-outlet`, label: `Mounts a router outlet to display some web content (<sci-router-outlet> web component) (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/context`, label: `Inspects the context at this level in the context tree (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/microfrontend-1`, label: `Displays the microfrontend page (${symbolicName})`});
            endpoints.push({url: `${origin}/#/testing-app/microfrontend-2`, label: `Displays the microfrontend page (${symbolicName})`});
          });
          return endpoints;
        }),
      );
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
}

export interface AppEndpoint {
  url: string;
  label: string;
}
