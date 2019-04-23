/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestingViewComponent } from './testing-view/testing-view.component';
import { TestingRoutingModule } from './testing-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SciAccordionModule, SciParamsEnterModule, SciPopupShellModule, SciPropertyModule } from '@scion/app/common';
import { View0c4fe9e3Component } from './view-0c4fe9e3/view-0c4fe9e3.component';
import { ViewInterationPanelComponent } from './view-interaction-panel/view-interation-panel.component';
import { ViewNavigationPanelComponent } from './view-navigation-panel/view-navigation-panel.component';
import { MessageBoxPanelComponent } from './message-box-panel/message-box-panel.component';
import { WorkbenchApplicationModule } from '@scion/workbench-application.angular';
import { NotificationPanelComponent } from './notification-panel/notification-panel.component';
import { PopupPanelComponent } from './popup-panel/popup-panel.component';
import { TestingPopupComponent } from './testing-popup/testing-popup.component';
import { TestingActivityComponent } from './testing-activity/testing-activity.component';
import { ActivityInterationPanelComponent } from './activity-interaction-panel/activity-interation-panel.component';
import { ActivityActionsPanelComponent } from './activity-actions-panel/activity-actions-panel.component';
import { CustomNotifyActivityActionDirective } from './activity-actions-panel/custom-notify-activity-action.directive';
import { View354aa6daComponent } from './view-354aa6da/view-354aa6da.component';
import { View85dde646Component } from './view-85dde646/view-85dde646.component';
import { View56657ad1Component } from './view-56657ad1/view-56657ad1.component';
import { ViewC8e40918Component } from './view-c8e40918/view-c8e40918.component';
import { ViewA686d615Component } from './view-a686d615/view-a686d615.component';
import { View4a4e6970Component } from './view-4a4e6970/view-4a4e6970.component';
import { View608aa47cComponent } from './view-608aa47c/view-608aa47c.component';
import { ViewF389a9d5Component } from './view-f389a9d5/view-f389a9d5.component';
import { ViewB1dd152aComponent } from './view-b1dd152a/view-b1dd152a.component';
import { ViewFfd6a78fComponent } from './view-ffd6a78f/view-ffd6a78f.component';
import { ViewCc977da9Component } from './view-cc977da9/view-cc977da9.component';
import { ViewB6a8fe23Component } from './view-b6a8fe23/view-b6a8fe23.component';
import { View28f32b51Component } from './view-28f32b51/view-28f32b51.component';
import { Popup1a90c8d2Component } from './popup-1a90c8d2/popup-1a90c8d2.component';
import { Popup7330f506Component } from './popup-7330f506/popup-7330f506.component';
import { Popup9c5319f7Component } from './popup-9c5319f7/popup-9c5319f7.component';
import { Popup45dc693fComponent } from './popup-45dc693f/popup-45dc693f.component';
import { PopupF4286ac4Component } from './popup-f4286ac4/popup-f4286ac4.component';
import { Popup159913adComponent } from './popup-159913ad/popup-159913ad.component';
import { Popup8a468258Component } from './popup-8a468258/popup-8a468258.component';
import { PopupFc077b32Component } from './popup-fc077b32/popup-fc077b32.component';
import { Popup5782ab19Component } from './popup-5782ab19/popup-5782ab19.component';
import { View5782ab19Component } from './view-5782ab19/view-5782ab19.component';
import { View68f302b4Component } from './view-68f302b4/view-68f302b4.component';
import { Activity4a3a8984Component } from './activity-4a3a8984/activity-4a3a8984.component';
import { Activity28f32b51Component } from './activity-28f32b51/activity-28f32b51.component';
import { ViewBe587bd6Component } from './view-be587bd6/view-be587bd6.component';
import { Activity6d806beaComponent } from './activity-6d806bea/activity-6d806bea.component';
import { Activity5782ab19Component } from './activity-5782ab19/activity-5782ab19.component';
import { ViewOpenActivityActionPanelComponent } from './view-open-activity-action-panel/view-open-activity-action-panel.component';
import { PopupOpenActivityActionPanelComponent } from './popup-open-activity-action-panel/popup-open-activity-action-panel.component';
import { ViewC91805e8Component } from './view-c91805e8/view-c91805e8.component';
import { CustomIntentPanelComponent } from './custom-intent/custom-intent-panel.component';
import { ViewCba33eafComponent } from './view-cba33eaf/view-cba33eaf.component';

@NgModule({
  declarations: [
    TestingViewComponent,
    ViewNavigationPanelComponent,
    ViewInterationPanelComponent,
    MessageBoxPanelComponent,
    CustomIntentPanelComponent,
    NotificationPanelComponent,
    PopupPanelComponent,
    TestingPopupComponent,
    TestingActivityComponent,
    ActivityInterationPanelComponent,
    ActivityActionsPanelComponent,
    CustomNotifyActivityActionDirective,
    ViewOpenActivityActionPanelComponent,
    PopupOpenActivityActionPanelComponent,
    View0c4fe9e3Component,
    View354aa6daComponent,
    View85dde646Component,
    View56657ad1Component,
    ViewC8e40918Component,
    ViewA686d615Component,
    View4a4e6970Component,
    View608aa47cComponent,
    ViewF389a9d5Component,
    ViewB1dd152aComponent,
    ViewFfd6a78fComponent,
    ViewCc977da9Component,
    ViewB6a8fe23Component,
    View28f32b51Component,
    View5782ab19Component,
    View68f302b4Component,
    ViewBe587bd6Component,
    ViewC91805e8Component,
    ViewCba33eafComponent,
    Popup1a90c8d2Component,
    Popup7330f506Component,
    Popup9c5319f7Component,
    Popup45dc693fComponent,
    PopupF4286ac4Component,
    Popup159913adComponent,
    Popup8a468258Component,
    PopupFc077b32Component,
    Popup5782ab19Component,
    Activity4a3a8984Component,
    Activity28f32b51Component,
    Activity6d806beaComponent,
    Activity5782ab19Component,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TestingRoutingModule,
    SciAccordionModule,
    SciParamsEnterModule,
    SciPropertyModule,
    SciPopupShellModule,
    WorkbenchApplicationModule.forChild(),
  ],
  exports: [],
  providers: [],
})
export class TestingModule {
}
