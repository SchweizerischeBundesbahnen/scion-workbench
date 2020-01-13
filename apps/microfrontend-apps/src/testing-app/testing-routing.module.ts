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
import { ScrollableMicrofrontendComponent } from './scrollable-microfrontend/scrollable-microfrontend.component';
import { PreferredSizeComponent } from './preferred-size/preferred-size.component';

const routes: Routes = [
  {
    path: '',
    component: TestingAppComponent,
    resolve: {platform: TestingAppPlatformInitializerResolver},
    children: [
      {path: 'browser-outlets', component: BrowserOutletsComponent, data: {pageTitle: 'Allows displaying web content in one or more browser outlets', matrixParams: new Map().set('count', 2), pageTitleVisible: false}},
      {path: 'router-outlet', component: RouterOutletComponent, data: {pageTitle: 'Allows displaying web content in a router outlet'}},
      {path: 'outlet-router', component: OutletRouterComponent, data: {pageTitle: 'Allowd controlling the web content to be displayed in a router outlet'}},
      {path: 'publish-message', component: PublishMessageComponent, data: {pageTitle: 'Allows publishing messages'}},
      {path: 'receive-message', component: ReceiveMessageComponent, data: {pageTitle: 'Allows receiving messages'}},
      {path: 'manage-capabilities', component: ManageCapabilitiesComponent, data: {pageTitle: 'Allows managing capabilities'}},
      {path: 'manage-intents', component: ManageIntentsComponent, data: {pageTitle: 'Allows managing intents'}},
      {path: 'context', component: ContextComponent, data: {pageTitle: 'Allows showing the context at this level in the context tree'}},
      {path: 'microfrontend-1', component: MicrofrontendComponent, data: {pageTitle: 'Displays the \'microfrontend-1\' page'}},
      {path: 'microfrontend-2', component: MicrofrontendComponent, data: {pageTitle: 'Displays the \'microfrontend-2\' page'}},
      {path: 'scrollable-microfrontend', component: ScrollableMicrofrontendComponent, data: {pageTitle: 'Displays a microfrontend with some tall content displayed in a viewport'}},
      {path: 'preferred-size', component: PreferredSizeComponent, data: {pageTitle: 'Allows playing around with the microfrontend\'s preferred size'}},
      {path: '', redirectTo: 'browser-outlets;count=2', pathMatch: 'full'},
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
