/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { TestBed } from '@angular/core/testing';
import { SciDimensionService } from './dimension.service';

describe('DimensionService', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SciDimensionService,
      ],
    });
  });

  it('should emit on size change of the element', async () => {
    const dimensionService = TestBed.get<SciDimensionService>(SciDimensionService);

    // create the testee <div> and subscribe for dimension changes
    const testeeDiv = document.createElement('div');
    testeeDiv.style.width = '100px';

    const reportedSizes: number[] = [];
    dimensionService.dimension$(testeeDiv, {useNativeResizeObserver: false}).subscribe(dimension => reportedSizes.push(dimension.clientWidth));

    // append the testee <div> to the DOM
    document.body.appendChild(testeeDiv);

    await waitUntilRendered();
    expect(reportedSizes).toEqual([100]);

    // change the size of the <div> to 200px and wait until the changed size is reported
    testeeDiv.style.width = '200px';
    await waitUntilRendered();
    expect(reportedSizes).toEqual([100, 200]);

    // change the size of the <div> to 300px and wait until the changed size is reported
    testeeDiv.style.width = '300px';
    await waitUntilRendered();
    expect(reportedSizes).toEqual([100, 200, 300]);
  });

  it('should emit on size change of the parent element', async () => {
    const dimensionService: SciDimensionService = TestBed.get(SciDimensionService);

    // create a parent <div> with a width of 300px
    const parentDiv = document.createElement('div');
    parentDiv.style.width = '100px';
    document.body.appendChild(parentDiv);

    // create the testee <div> and subscribe for dimension changes
    const testeeDiv = document.createElement('div');

    const reportedSizes: number[] = [];
    dimensionService.dimension$(testeeDiv, {useNativeResizeObserver: false}).subscribe(dimension => reportedSizes.push(dimension.clientWidth));

    // append the testee <div> to the DOM
    parentDiv.appendChild(testeeDiv);

    await waitUntilRendered();
    expect(reportedSizes).toEqual([100]);

    // change the size of the parent <div> to 200px and wait until the changed size is reported
    parentDiv.style.width = '200px';
    await waitUntilRendered();
    expect(reportedSizes).toEqual([100, 200]);

    // change the size of the parent <div> to 300px and wait until the changed size is reported
    parentDiv.style.width = '300px';
    await waitUntilRendered();
    expect(reportedSizes).toEqual([100, 200, 300]);
  });

  it('should allocate a single HTML object element for multiple observers', async () => {
    const dimensionService: SciDimensionService = TestBed.get(SciDimensionService);

    // create the testee <div>
    const testeeDiv = document.createElement('div');
    testeeDiv.style.width = '100px';
    document.body.appendChild(testeeDiv);
    await waitUntilRendered();

    // 1. subscription
    const reportedSizes1: number[] = [];
    const subscription1 = dimensionService.dimension$(testeeDiv, {useNativeResizeObserver: false}).subscribe(dimension => reportedSizes1.push(dimension.clientWidth));
    await waitUntilRendered();

    expect(reportedSizes1).toEqual([100]);
    expect(dimensionService._objectObservableRegistry.size).toEqual(1);
    expect(testeeDiv.querySelectorAll('object.synth-resize-observable').length).toEqual(1);

    // 2. subscription
    const reportedSizes2: number[] = [];
    const subscription2 = dimensionService.dimension$(testeeDiv, {useNativeResizeObserver: false}).subscribe(dimension => reportedSizes2.push(dimension.clientWidth));
    await waitUntilRendered();

    expect(reportedSizes2).toEqual([100]);
    expect(dimensionService._objectObservableRegistry.size).toEqual(1);
    expect(testeeDiv.querySelectorAll('object.synth-resize-observable').length).toEqual(1);

    // 3. subscription
    const reportedSizes3: number[] = [];
    const subscription3 = dimensionService.dimension$(testeeDiv, {useNativeResizeObserver: false}).subscribe(dimension => reportedSizes3.push(dimension.clientWidth));
    await waitUntilRendered();

    expect(reportedSizes3).toEqual([100]);
    expect(dimensionService._objectObservableRegistry.size).toEqual(1);
    expect(testeeDiv.querySelectorAll('object.synth-resize-observable').length).toEqual(1);

    // change the size of the <div> to 200px and wait until the changed size is reported
    testeeDiv.style.width = '200px';
    await waitUntilRendered();
    expect(reportedSizes1).toEqual([100, 200]);
    expect(reportedSizes2).toEqual([100, 200]);
    expect(reportedSizes3).toEqual([100, 200]);

    // Unsubscribe the 3. subscriber
    subscription3.unsubscribe();
    await waitUntilRendered();
    expect(dimensionService._objectObservableRegistry.size).toEqual(1);
    expect(testeeDiv.querySelectorAll('object.synth-resize-observable').length).toEqual(1);

    // change the size of the <div> to 300px and wait until the changed size is reported
    testeeDiv.style.width = '300px';
    await waitUntilRendered();
    expect(reportedSizes1).toEqual([100, 200, 300]);
    expect(reportedSizes2).toEqual([100, 200, 300]);
    expect(reportedSizes3).toEqual([100, 200]);

    // Unsubscribe the 2. subscriber
    subscription2.unsubscribe();
    await waitUntilRendered();
    expect(dimensionService._objectObservableRegistry.size).toEqual(1);
    expect(testeeDiv.querySelectorAll('object.synth-resize-observable').length).toEqual(1);

    // change the size of the <div> to 400px and wait until the changed size is reported
    testeeDiv.style.width = '400px';
    await waitUntilRendered();
    expect(reportedSizes1).toEqual([100, 200, 300, 400]);
    expect(reportedSizes2).toEqual([100, 200, 300]);
    expect(reportedSizes3).toEqual([100, 200]);

    // Unsubscribe the 1. subscriber
    subscription1.unsubscribe();
    await waitUntilRendered();
    expect(dimensionService._objectObservableRegistry.size).toEqual(0);
    expect(testeeDiv.querySelectorAll('object.synth-resize-observable').length).toEqual(0);

    // change the size of the <div> to 500px and wait until the changed size is reported
    testeeDiv.style.width = '500px';
    await waitUntilRendered();
    expect(reportedSizes1).toEqual([100, 200, 300, 400]);
    expect(reportedSizes2).toEqual([100, 200, 300]);
    expect(reportedSizes3).toEqual([100, 200]);
  });

  /**
   * Wait until the browser reported the dimension change.
   */
  function waitUntilRendered(renderCyclesToWait: number = 2): Promise<void> {
    if (renderCyclesToWait === 0) {
      return Promise.resolve();
    }

    return new Promise(resolve => { // tslint:disable-line:typedef
      requestAnimationFrame(() => waitUntilRendered(renderCyclesToWait - 1).then(() => resolve()));
    });
  }
});
