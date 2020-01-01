/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestingAppModule } from './testing-app.module';
import { TestingAppComponent } from './testing-app.component';
import { BrowserOutletsComponent } from './browser-outlets/browser-outlets.component';
import { ReceiveMessageComponent } from './messaging/receive-message/receive-message.component';
import { ManageCapabilitiesComponent } from './manifest/manage-capabilities/manage-capabilities.component';
import { ManageIntentsComponent } from './manifest/manage-intents/manage-intents.component';
import { TestingAppPlatformInitializerResolver } from './testing-app-platform-initializer.resolver';
import { ContextComponent } from './context/context.component';
import { OutletRouterComponent } from './outlet-router/outlet-router.component';
import { PublishMessageComponent } from './messaging/publish-message/publish-message.component';
import { RouterOutletComponent } from './router-outlet/router-outlet.component';
import { MicrofrontendComponent } from './microfrontend/microfrontend.component';

const routes: Routes = [
  {
    path: '',
    component: TestingAppComponent,
    resolve: {platform: TestingAppPlatformInitializerResolver},
    children: [
      {path: 'browser-outlets', component: BrowserOutletsComponent},
      {path: 'router-outlet', component: RouterOutletComponent, data: {title: 'Displays web content in a router outlet'}},
      {path: 'outlet-router', component: OutletRouterComponent, data: {title: 'Controls the web content to be displayed in a router outlet'}},
      {path: 'publish-message', component: PublishMessageComponent, data: {title: 'Publish messages'}},
      {path: 'receive-message', component: ReceiveMessageComponent, data: {title: 'Receive messages'}},
      {path: 'manage-capabilities', component: ManageCapabilitiesComponent, data: {title: 'Manage capabilities'}},
      {path: 'manage-intents', component: ManageIntentsComponent, data: {title: 'Manage intents'}},
      {path: 'context', component: ContextComponent, data: {title: 'Shows the context at this level in the context tree'}},
      {path: 'microfrontend-1', component: MicrofrontendComponent, data: {title: 'Displays the microfrontend-1 page'}},
      {path: 'microfrontend-2', component: MicrofrontendComponent, data: {title: 'Displays the microfrontend-2 page'}},
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TestingAppModule,
  ],
})
export class TestingRoutingModule {
}
