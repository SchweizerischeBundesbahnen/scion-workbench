import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublishMessageComponent } from './messaging/publish-message/publish-message.component';
import { SciSashboxModule } from '@scion/toolkit/sashbox';
import { RouterModule } from '@angular/router';
import { TestingAppComponent } from './testing-app.component';
import { OutletsComponent } from './outlets/outlets.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { SciAccordionModule, SciCheckboxModule, SciFormFieldModule, SciListModule, SciParamsEnterModule, SciPropertyModule, SciQualifierChipListModule } from '@scion/ɵtoolkit/widgets';
import { ReceiveMessageComponent } from './messaging/receive-message/receive-message.component';
import { MessageListItemComponent } from './messaging/message-list-item/message-list-item.component';
import { ManageCapabilitiesComponent } from './manifest/manage-capabilities/manage-capabilities.component';
import { ManageIntentsComponent } from './manifest/manage-intents/manage-intents.component';
import { TopicSubscriberCountPipe } from './messaging/topic-subscriber-count.pipe';
import { Title } from '@angular/platform-browser';
import { OutletComponent } from './outlet/outlet.component';

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
  ],
  declarations: [
    TestingAppComponent,
    OutletsComponent,
    OutletComponent,
    PublishMessageComponent,
    ReceiveMessageComponent,
    MessageListItemComponent,
    ManageCapabilitiesComponent,
    ManageIntentsComponent,
    TopicSubscriberCountPipe,
  ],
})
export class TestingAppModule {

  constructor(title: Title) {
    title.setTitle('Testing App - SCION Microfrontend Platform');
  }
}
