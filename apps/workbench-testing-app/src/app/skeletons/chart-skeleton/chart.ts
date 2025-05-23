/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {computed, ElementRef, inject, signal, Signal} from '@angular/core';
import {dimension} from '@scion/components/dimension';

/**
 * Generates a responsive chart based on the provided data series.
 */
export class Chart {

  private readonly _dataSeries = signal<number[]>([]);
  private readonly _points: Signal<Point[]>;

  public readonly lineChart: Signal<string | undefined>;
  public readonly viewbox: Signal<string | undefined>;

  constructor(private _config: ChartConfig) {
    this._points = this.computePoints();
    this.viewbox = this.computeViewbox();
    this.lineChart = this.computeLineChart();
  }

  /**
   * Computes the SVG `viewBox` attribute to fit the chart into the canvas.
   */
  private computeViewbox(): Signal<string | undefined> {
    return computed(() => {
      if (!this._points().length) {
        return undefined;
      }

      const values = this._points().map(point => point.y);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      const minX = 0;
      const minY = minValue - this._config.paddingTop;
      const width = values.length;
      const height = maxValue - minValue + this._config.paddingTop + this._config.paddingBottom;

      return `${minX} ${minY} ${width} ${height}`;
    });
  }

  /**
   * Computes the chart points from the data series.
   */
  private computePoints(): Signal<Point[]> {
    const hostSize = dimension(inject(ElementRef<HTMLElement>));

    return computed(() => {
      const width = hostSize().offsetWidth;
      if (!width) {
        return [];
      }

      // Sample data to reduce the number of points if the width is less than 1500px.
      const nth = Math.ceil(1500 / width);
      const sampledDataSeries = sample(this._dataSeries(), nth);

      const points = new Array<Point>();
      for (let i = 0; i < sampledDataSeries.length; i++) {
        points.push({x: i, y: sampledDataSeries[i]});
      }
      return points;
    });
  }

  /**
   * Computes the SVG path for the line chart.
   */
  private computeLineChart(): Signal<string | undefined> {
    return computed(() => {
      const points = this._points();
      if (!points.length) {
        return undefined;
      }

      return [
        `M ${points[0].x} ${points[0].y}`,
        ...points.slice(1).map(point => ` L${point.x} ${point.y}`),
      ].join(' ');
    });
  }

  /**
   * Updates the chart with a new data series.
   */
  public setDataSeries(dataSeries: number[]): void {
    this._dataSeries.set(dataSeries);
  }
}

/**
 * Samples the data series by averaging every nth subset of values.
 */
function sample(dataSeries: number[], nth: number): number[] {
  if (nth === 1) {
    return dataSeries;
  }

  const samples = new Array<number>();
  for (let i = 0; i < dataSeries.length; i += nth) {
    const sampleSum = dataSeries.slice(i, i + nth).reduce((acc, value) => acc + value, 0);
    const sampleCount = Math.min(i + nth, dataSeries.length) - i;
    samples.push(Math.floor(sampleSum / sampleCount));
  }
  return samples;
}

/**
 * Point in the chart canvas.
 */
interface Point {
  x: number;
  y: number;
}

/**
 * Configures the chart.
 */
export interface ChartConfig {
  paddingTop: number;
  paddingBottom: number;
}
