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
import { CommonModule } from '@angular/common';
import { SciViewportModule } from '@scion/viewport';
import { SciAccordionModule, SciFilterFieldModule, SciListModule, SciParamsEnterModule, SciPopupShellModule, SciPropertyModule, SciSashModule } from '@scion/app/common';
import { DevToolsRoutingModule } from './dev-tools-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkbenchApplicationModule } from '@scion/workbench-application.angular';
import { DevToolsComponent } from './dev-tools/dev-tools.component';
import { ApplicationListItemComponent } from './application-list-item/application-list-item.component';
import { ApplicationViewComponent } from './application-view/application-view.component';
import { CapabilityAccordionItemComponent } from './capability-accordion-item/capability-accordion-item.component';
import { QualifierChipListComponent } from './qualifier-chip-list/qualifier-chip-list.component';
import { IntentAccordionItemComponent } from './intent-accordion-item/intent-accordion-item.component';
import { IntentAccordionPanelComponent } from './intent-accordion-panel/intent-accordion-panel.component';
import { CapabilityAccordionPanelComponent } from './capability-accordion-panel/capability-accordion-panel.component';
import { OutletCapabilityExecPopupComponent } from './outlet-capability-exec-popup/outlet-capability-exec-popup.component';

@NgModule({
  declarations: [
    DevToolsComponent,
    ApplicationListItemComponent,
    ApplicationViewComponent,
    CapabilityAccordionItemComponent,
    CapabilityAccordionPanelComponent,
    IntentAccordionItemComponent,
    IntentAccordionPanelComponent,
    QualifierChipListComponent,
    OutletCapabilityExecPopupComponent,
  ],
  imports: [
    CommonModule,
    SciViewportModule,
    ReactiveFormsModule,
    WorkbenchApplicationModule.forChild(),
    DevToolsRoutingModule,
    SciListModule,
    SciAccordionModule,
    SciSashModule,
    SciFilterFieldModule,
    SciPopupShellModule,
    SciParamsEnterModule,
    SciPropertyModule,
  ],
  exports: [],
  providers: [],
})
export class DevToolsModule {
}
