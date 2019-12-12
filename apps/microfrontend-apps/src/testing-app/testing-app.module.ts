/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublishMessageComponent } from './messaging/publish-message/publish-message.component';
import { SciSashboxModule } from '@scion/toolkit/sashbox';
import { RouterModule } from '@angular/router';
import { TestingAppComponent } from './testing-app.component';
import { BrowserOutletsComponent } from './browser-outlets/browser-outlets.component';
import { BrowserOutletComponent } from './browser-outlet/browser-outlet.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { SciAccordionModule, SciCheckboxModule, SciFormFieldModule, SciListModule, SciParamsEnterModule, SciPropertyModule, SciQualifierChipListModule } from '@scion/ɵtoolkit/widgets';
import { ReceiveMessageComponent } from './messaging/receive-message/receive-message.component';
import { MessageListItemComponent } from './messaging/message-list-item/message-list-item.component';
import { RegisterCapabilityProvidersComponent } from './manifest/register-capability-providers/register-capability-providers.component';
import { RegisterIntentionsComponent } from './manifest/register-intentions/register-intentions.component';
import { TopicSubscriberCountPipe } from './messaging/topic-subscriber-count.pipe';
import { Title } from '@angular/platform-browser';
import { RouterOutletContextComponent } from './router-outlet-context/router-outlet-context.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { ContextComponent } from './context/context.component';
import { ContextEntryComponent } from './context-entry/context-entry.component';
import { A11yModule } from '@angular/cdk/a11y';
import { OutletRouterComponent } from './outlet-router/outlet-router.component';
import { RouterOutletComponent } from './router-outlet/router-outlet.component';
import { MicrofrontendComponent } from './microfrontend/microfrontend.component';
import { ScrollableMicrofrontendComponent } from './scrollable-microfrontend/scrollable-microfrontend.component';
import { ConsolePanelComponent } from './console/console-panel.component';
import { RouterOutletSettingsComponent } from './router-outlet-settings/router-outlet-settings.component';
import { PreferredSizeComponent } from './preferred-size/preferred-size.component';
import { PlatformPropertiesComponent } from './platform-properties/platform-properties.component';
import { LookupCapabilityProvidersComponent } from './manifest/lookup-capability-providers/lookup-capability-providers.component';
import { LookupIntentionsComponent } from './manifest/lookup-intentions/lookup-intentions.component';

@NgModule({
  imports: [
    CommonModule,
    SciSashboxModule,
    SciViewportModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SciListModule,
    SciSashboxModule,
    SciAccordionModule,
    SciCheckboxModule,
    SciFormFieldModule,
    SciParamsEnterModule,
    SciQualifierChipListModule,
    SciPropertyModule,
    OverlayModule,
    A11yModule,
  ],
  declarations: [
    TestingAppComponent,
    BrowserOutletsComponent,
    BrowserOutletComponent,
    RouterOutletComponent,
    RouterOutletSettingsComponent,
    RouterOutletContextComponent,
    ConsolePanelComponent,
    OutletRouterComponent,
    ContextComponent,
    ContextEntryComponent,
    PublishMessageComponent,
    ReceiveMessageComponent,
    MessageListItemComponent,
    RegisterCapabilityProvidersComponent,
    RegisterIntentionsComponent,
    LookupCapabilityProvidersComponent,
    LookupIntentionsComponent,
    TopicSubscriberCountPipe,
    MicrofrontendComponent,
    ScrollableMicrofrontendComponent,
    PreferredSizeComponent,
    PlatformPropertiesComponent,
  ],
  entryComponents: [
    RouterOutletSettingsComponent,
    RouterOutletContextComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element and unknown to Angular
})
export class TestingAppModule {

  constructor(title: Title) {
    title.setTitle('Testing App - SCION Microfrontend Platform');
  }
}
