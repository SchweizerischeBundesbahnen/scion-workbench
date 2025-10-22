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
import {NgTemplateOutlet} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchPartCapability, ɵMicrofrontendRouteParams, ɵWorkbenchCommands, ɵWorkbenchPart, ɵWorkbenchView} from '@scion/workbench-client';
import {take} from 'rxjs/operators';
import {ManifestService, MessageClient} from '@scion/microfrontend-platform';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciAccordionComponent, SciAccordionItemDirective} from '@scion/components.internal/accordion';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-angular-zone-test-page',
  templateUrl: './angular-zone-test-page.component.html',
  styleUrls: ['./angular-zone-test-page.component.scss'],
  imports: [
    NgTemplateOutlet,
    FormsModule,
    SciCheckboxComponent,
    SciAccordionComponent,
    SciAccordionItemDirective,
  ],
})
export default class AngularZoneTestPageComponent {

  private _workbenchView = new ɵWorkbenchView('view.1');
  private _workbenchPart = new ɵWorkbenchPart({partId: 'part.1', capability: null as unknown as WorkbenchPartCapability, params: new Map()});

  protected readonly tests = {
    workbenchView: {
      partId: new TestCaseModel(model => void this.testWorkbenchPartId(model)),
      capability: new TestCaseModel(model => void this.testWorkbenchViewCapability(model)),
      params: new TestCaseModel(model => void this.testWorkbenchViewParams(model)),
      active: new TestCaseModel(model => void this.testWorkbenchViewActive(model)),
      focused: new TestCaseModel(model => void this.testWorkbenchViewFocused(model)),
    },
    workbenchPart: {
      active: new TestCaseModel(model => void this.testWorkbenchPartActive(model)),
      focused: new TestCaseModel(model => void this.testWorkbenchPartFocused(model)),
    },
  };

  constructor() {
    // Subscribe for the ref count to not drop to zero.
    this._workbenchView.partId$.pipe(takeUntilDestroyed()).subscribe();
    this._workbenchView.capability$.pipe(takeUntilDestroyed()).subscribe();
    this._workbenchView.params$.pipe(takeUntilDestroyed()).subscribe();
    this._workbenchView.active$.pipe(takeUntilDestroyed()).subscribe();
    this._workbenchView.focused$.pipe(takeUntilDestroyed()).subscribe();

    this._workbenchPart.active$.pipe(takeUntilDestroyed()).subscribe();
    this._workbenchPart.focused$.pipe(takeUntilDestroyed()).subscribe();
  }

  private async testWorkbenchPartId(model: TestCaseModel): Promise<void> {
    // Subscribe to partId
    this._workbenchView.partId$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received partId'));

    const partIdTopic = ɵWorkbenchCommands.viewPartIdTopic('view.1');

    // Simulate first emission
    await Beans.get(MessageClient).publish(partIdTopic, 'part.1');
    // Simulate second emission
    await Beans.get(MessageClient).publish(partIdTopic, 'part.2');
  }

  private async testWorkbenchViewCapability(model: TestCaseModel): Promise<void> {
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
    this._workbenchView.capability$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received capability'));

    const viewParamsTopic = ɵWorkbenchCommands.viewParamsTopic('view.1');

    // Simulate first emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map().set(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID, viewCapabilityId1));
    //  Wait until received first emission
    await firstValueFrom(this._workbenchView.capability$);
    // Simulate second emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map().set(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID, viewCapabilityId2));
  }

  private async testWorkbenchViewParams(model: TestCaseModel): Promise<void> {
    // Subscribe to params
    this._workbenchView.params$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received parms'));

    const viewParamsTopic = ɵWorkbenchCommands.viewParamsTopic('view.1');

    // Simulate first emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map());
    // Simulate second emission
    await Beans.get(MessageClient).publish(viewParamsTopic, new Map());
  }

  private async testWorkbenchViewActive(model: TestCaseModel): Promise<void> {
    // Subscribe to active state
    this._workbenchView.active$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received active state'));

    const viewActiveTopic = ɵWorkbenchCommands.viewActiveTopic('view.1');

    // Simulate first emission
    await Beans.get(MessageClient).publish(viewActiveTopic, true);
    // Simulate second emission
    await Beans.get(MessageClient).publish(viewActiveTopic, false);
  }

  private async testWorkbenchViewFocused(model: TestCaseModel): Promise<void> {
    // Subscribe to focused state
    this._workbenchView.focused$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received focused state'));

    const viewFocusedTopic = ɵWorkbenchCommands.viewFocusedTopic('view.1');

    // Simulate first emission
    await Beans.get(MessageClient).publish(viewFocusedTopic, true);
    // Simulate second emission
    await Beans.get(MessageClient).publish(viewFocusedTopic, false);
  }

  private async testWorkbenchPartActive(model: TestCaseModel): Promise<void> {
    // Subscribe to active state
    this._workbenchPart.active$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received active state'));

    const partActiveTopic = ɵWorkbenchCommands.partActiveTopic('part.1');

    // Simulate first emission
    await Beans.get(MessageClient).publish(partActiveTopic, true);
    // Simulate second emission
    await Beans.get(MessageClient).publish(partActiveTopic, false);
  }

  private async testWorkbenchPartFocused(model: TestCaseModel): Promise<void> {
    // Subscribe to focused state
    this._workbenchPart.focused$
      .pipe(take(2))
      .subscribe(() => model.addEmission('Received focused state'));

    const partFocusedTopic = ɵWorkbenchCommands.partFocusedTopic('part.1');

    // Simulate first emission
    await Beans.get(MessageClient).publish(partFocusedTopic, true);
    // Simulate second emission
    await Beans.get(MessageClient).publish(partFocusedTopic, false);
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
