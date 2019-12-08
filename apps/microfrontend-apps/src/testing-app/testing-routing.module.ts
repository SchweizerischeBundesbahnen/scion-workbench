import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublishMessageComponent } from './messaging/publish-message/publish-message.component';
import { TestingAppModule } from './testing-app.module';
import { TestingAppComponent } from './testing-app.component';
import { OutletsComponent } from './outlets/outlets.component';
import { ReceiveMessageComponent } from './messaging/receive-message/receive-message.component';
import { ManageCapabilitiesComponent } from './manifest/manage-capabilities/manage-capabilities.component';
import { ManageIntentsComponent } from './manifest/manage-intents/manage-intents.component';
import { TestingAppPlatformInitializerResolver } from './testing-app-platform-initializer.resolver';

const routes: Routes = [
  {
    path: '',
    component: TestingAppComponent,
    resolve: {platform: TestingAppPlatformInitializerResolver},
    children: [
      {path: 'outlets', component: OutletsComponent},
      {path: 'publish-message', component: PublishMessageComponent, data: {title: 'Publish messages'}},
      {path: 'receive-message', component: ReceiveMessageComponent, data: {title: 'Receive messages'}},
      {path: 'manage-capabilities', component: ManageCapabilitiesComponent, data: {title: 'Manage capabilities'}},
      {path: 'manage-intents', component: ManageIntentsComponent, data: {title: 'Manage intents'}},
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
