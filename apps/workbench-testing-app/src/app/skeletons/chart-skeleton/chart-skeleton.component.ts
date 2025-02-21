/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostListener, inject, signal, WritableSignal} from '@angular/core';
import {Skeletons} from '../skeletons.util';
import {NgClass} from '@angular/common';
import {WorkbenchPart, WorkbenchView} from '@scion/workbench';
import {Chart} from './chart';

/**
 * Represents a skeleton for a chart.
 *
 * The component supports the rendering of a line and area chart.
 */
@Component({
  selector: 'app-chart-skeleton',
  templateUrl: './chart-skeleton.component.html',
  styleUrls: ['./chart-skeleton.component.scss'],
  imports: [
    NgClass,
  ],
})
export class ChartSkeletonComponent {

  protected chart = new Chart({paddingTop: 2, paddingBottom: 2});
  protected chartType: WritableSignal<ChartType>;
  protected active = inject(WorkbenchView, {optional: true})?.part().active ?? inject(WorkbenchPart, {optional: true})?.active ?? signal(false);

  constructor() {
    this.chartType = signal(chartTypes[Skeletons.random(0, chartTypes.length - 1)]);
    this.chart.setDataSeries(this.generateDataSeries({n: 250, maxValue: 50}));
  }

  @HostListener('click')
  protected onReload(): void {
    // Select next chart type.
    this.chartType.set(chartTypes[(chartTypes.indexOf(this.chartType()) + 1) % chartTypes.length]);
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

type ChartType = 'line' | 'area';
const chartTypes: ChartType[] = ['line', 'area'];
