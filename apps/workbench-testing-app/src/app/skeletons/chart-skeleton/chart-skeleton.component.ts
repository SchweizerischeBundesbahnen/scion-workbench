/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostListener, inject, signal} from '@angular/core';
import {Skeletons} from '../skeletons.util';
import {WorkbenchPart, WorkbenchView} from '@scion/workbench';
import {Chart} from './chart';

/**
 * Represents a skeleton for a chart.
 *
 * The component supports the rendering of a line chart.
 */
@Component({
  selector: 'app-chart-skeleton',
  templateUrl: './chart-skeleton.component.html',
  styleUrls: ['./chart-skeleton.component.scss'],
  host: {
    '[attr.title]': `'Click to generate a new chart series.'`,
  },
})
export class ChartSkeletonComponent {

  protected readonly chart = new Chart({paddingTop: 2, paddingBottom: 2});
  protected readonly active = inject(WorkbenchView, {optional: true})?.focused ?? inject(WorkbenchPart, {optional: true})?.focused ?? signal(false);

  constructor() {
    this.chart.setDataSeries(this.generateDataSeries({n: 250, maxValue: 50}));
  }

  @HostListener('click')
  protected onReload(): void {
    // Update the chart with a new data series.
    this.chart.setDataSeries(this.generateDataSeries({n: 250, maxValue: 50}));
  }

  /**
   * Generates a data series of "n" values.
   *
   * Each value is randomly generated based on the previous value.
   */
  private generateDataSeries(config: {maxValue: number; n: number}): number[] {
    const initialValue = config.maxValue / 2;

    const dataSeries = new Array<number>();
    for (let i = 0; i < config.n; i++) {
      const previousValue = dataSeries.at(-1);
      const value = previousValue ? Skeletons.random(previousValue - 1, previousValue + 1) : initialValue;
      dataSeries.push(Skeletons.minmax(value, {min: 0, max: config.maxValue}));
    }
    return dataSeries;
  }
}
