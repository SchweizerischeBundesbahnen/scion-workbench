/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Component, inject, NgZone} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Beans} from '@scion/toolkit/bean-manager';
import {ɵMicrofrontendRouteParams, ɵWorkbenchCommands, ɵWorkbenchView} from '@scion/workbench-client';
import {take} from 'rxjs/operators';
import {ManifestService, MessageClient} from '@scion/microfrontend-platform';
import {firstValueFrom} from 'rxjs';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';

@Component({
  selector: 'app-angular-zone-test-page',
  templateUrl: './angular-zone-test-page.component.html',
  styleUrls: ['./angular-zone-test-page.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    SciCheckboxComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
  ],
})
export default class AngularZoneTestPageComponent {

  private readonly _zone = inject(NgZone);

  protected readonly tests = {
    workbenchView: {
      capability: new TestCaseModel(model => void this.testWorkbenchViewCapability(model)),
      params: new TestCaseModel(model => void this.testWorkbenchViewParams(model)),
      active: new TestCaseModel(model => void this.testWorkbenchViewActive(model)),
    },
  };

  private async testWorkbenchViewCapability(model: TestCaseModel): Promise<void> {
    const workbenchViewTestee = this._zone.runOutsideAngular(() => new ɵWorkbenchView('view.999'));

    // Register two view capabilities
    const viewCapabilityId1 = await Beans.get(ManifestService).registerCapability({
      type: 'view',
      qualifier: {view: 1},
      properties: {
        path: 'path',
      },
    });
    const viewCapabilityId2 = await Beans.get(ManifestService).registerCapability({
      type: 'view',
      qualifier: {view: 2},
      properties: {
        path: 'path',
      },
    });

    // Subscribe to capability
    workbenchViewTestee.capability$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received capability'));

    const viewParamsTopic = ɵWorkbenchCommands.viewParamsTopic(workbenchViewTestee.id);

    // Simulate first emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map().set(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID, viewCapabilityId1));
    //  Wait until received first emission
    await firstValueFrom(workbenchViewTestee.capability$);
    // Simulate second emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map().set(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID, viewCapabilityId2));
  }

  private async testWorkbenchViewParams(model: TestCaseModel): Promise<void> {
    const workbenchViewTestee = this._zone.runOutsideAngular(() => new ɵWorkbenchView('view.999'));

    // Subscribe to params
    workbenchViewTestee.params$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received parms'));

    const viewParamsTopic = ɵWorkbenchCommands.viewParamsTopic(workbenchViewTestee.id);

    // Simulate emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map());
    //  Wait until received first emission
    await firstValueFrom(workbenchViewTestee.params$);
    // Simulate second emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map());
  }

  private async testWorkbenchViewActive(model: TestCaseModel): Promise<void> {
    const workbenchViewTestee = this._zone.runOutsideAngular(() => new ɵWorkbenchView('view.999'));

    // Subscribe to active state
    workbenchViewTestee.active$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received active state'));

    const viewActiveTopic = ɵWorkbenchCommands.viewActiveTopic(workbenchViewTestee.id);

    // Simulate first emission
    await Beans.get(MessageClient).publish(viewActiveTopic, true);
    //  Wait until received first emission
    await firstValueFrom(workbenchViewTestee.active$);
    // Simulate second emission
    await Beans.get(MessageClient).publish(viewActiveTopic, false);
  }
}

/**
 * Model of a single test case.
 */
export class TestCaseModel {

  public runInAngular = true;
  public emissions = new Array<{insideAngular: boolean; label: string}>();
  private _zone = inject(NgZone);

  constructor(private _testFn: (model: TestCaseModel) => void) {
  }

  /**
   * Invoke to register received emission.
   */
  public addEmission(emission: string): void {
    if (NgZone.isInAngularZone()) {
      this.emissions.push({insideAngular: true, label: `${emission} (INSIDE NgZone)`});
    }
    else {
      this._zone.run(() => this.emissions.push({insideAngular: false, label: `${emission} (OUTSIDE NgZone)`}));
    }
  }

  /**
   * Invoke from the template to run this test.
   */
  protected onTestClick(): void {
    this.emissions.length = 0;
    if (this.runInAngular) {
      this._zone.run(() => this._testFn(this));
    }
    else {
      this._zone.runOutsideAngular(() => this._testFn(this));
    }
  }
}
