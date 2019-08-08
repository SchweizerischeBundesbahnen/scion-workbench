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
import { TestingViewComponent } from './testing-view/testing-view.component';
import { View0c4fe9e3Component } from './view-0c4fe9e3/view-0c4fe9e3.component';
import { TestingPopupComponent } from './testing-popup/testing-popup.component';
import { TestingActivityComponent } from './testing-activity/testing-activity.component';
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
import { ViewC91805e8Component } from './view-c91805e8/view-c91805e8.component';
import { ViewCba33eafComponent } from './view-cba33eaf/view-cba33eaf.component';
import { ViewB8bbbb11Component } from './view-b8bbbb11/view-b8bbbb11.component';

const routes: Routes = [
  {path: 'view', component: TestingViewComponent},
  {path: 'popup', component: TestingPopupComponent},
  {path: 'activity', component: TestingActivityComponent},
  {path: 'view-0c4fe9e3', component: View0c4fe9e3Component},
  {path: 'view-354aa6da', component: View354aa6daComponent},
  {path: 'view-85dde646', component: View85dde646Component},
  {path: 'view-56657ad1', component: View56657ad1Component},
  {path: 'view-c8e40918', component: ViewC8e40918Component},
  {path: 'view-a686d615', component: ViewA686d615Component},
  {path: 'view-4a4e6970', component: View4a4e6970Component},
  {path: 'view-608aa47c', component: View608aa47cComponent},
  {path: 'view-f389a9d5', component: ViewF389a9d5Component},
  {path: 'view-b1dd152a', component: ViewB1dd152aComponent},
  {path: 'view-ffd6a78f', component: ViewFfd6a78fComponent},
  {path: 'view-cc977da9/:a/:b', component: ViewCc977da9Component},
  {path: 'view-b6a8fe23/:pathParam1', component: ViewB6a8fe23Component},
  {path: 'view-28f32b51', component: View28f32b51Component},
  {path: 'view-5782ab19', component: View5782ab19Component},
  {path: 'view-68f302b4/:param', component: View68f302b4Component},
  {path: 'view-be587bd6', component: ViewBe587bd6Component},
  {path: 'view-c91805e8', component: ViewC91805e8Component},
  {path: 'view-cba33eaf', component: ViewCba33eafComponent},
  {path: 'view-b8bbbb11', component: ViewB8bbbb11Component},
  {path: 'popup-1a90c8d2', component: Popup1a90c8d2Component},
  {path: 'popup-7330f506', component: Popup7330f506Component},
  {path: 'popup-9c5319f7', component: Popup9c5319f7Component},
  {path: 'popup-45dc693f', component: Popup45dc693fComponent},
  {path: 'popup-f4286ac4', component: PopupF4286ac4Component},
  {path: 'popup-159913ad/:a/:b', component: Popup159913adComponent},
  {path: 'popup-8a468258/:pathParam1', component: Popup8a468258Component},
  {path: 'popup-fc077b32', component: PopupFc077b32Component},
  {path: 'popup-5782ab19', component: Popup5782ab19Component},
  {path: 'activity-d11be592', component: TestingActivityComponent},
  {path: 'activity-4a3a8984', component: Activity4a3a8984Component},
  {path: 'activity-28f32b51', component: Activity28f32b51Component},
  {path: 'activity-6d806bea', component: Activity6d806beaComponent},
  {path: 'activity-5782ab19', component: Activity5782ab19Component},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestingRoutingModule {
}
