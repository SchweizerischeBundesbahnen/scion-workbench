/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, HostBinding, HostListener, inject, Signal} from '@angular/core';
import {Skeletons} from '../skeletons.util';
import {NgClass} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {fromDimension$} from '@scion/toolkit/observable';
import {filter, map} from 'rxjs/operators';
import {WorkbenchView} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';

@Component({
  selector: 'app-chart-skeleton',
  templateUrl: './chart-skeleton.component.html',
  styleUrls: ['./chart-skeleton.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    SciMaterialIconDirective,
  ],
})
export default class ChartSkeletonComponent {

  public readonly _width: Signal<number>;

  public type: 'area' | 'line' | 'bar';

  public chart = new Chart();

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view.part.active;
  }

  constructor(public view: WorkbenchView) {
    this._width = toSignal(fromDimension$(inject(ElementRef).nativeElement).pipe(map(size => size?.offsetWidth ?? 0), filter(Boolean)), {initialValue: 0});
    this.type = ChartTypes[Skeletons.random(0, ChartTypes.length - 1)];

    effect(() => {
      const points = computed(() => Math.ceil(this._width() / 20));
      if (points()) {
        this.chart.generate(points());
      }
    });
  }

  @HostListener('click')
  public onReload(): void {
    this.type = ChartTypes[(ChartTypes.indexOf(this.type) + 1) % ChartTypes.length];
    this.chart.generate();
  }
}

interface Point {
  x: number;
  y: number;
}

class Chart {
  public points: Point[] = [];
  public n = 15;
  public width = 150;
  public viewbox = `0 0 ${this.width} 100`;
  public rw = 0;

  constructor() {
    // this.generate(15);
  }

  public generate(n?: number): void {
    if (n !== undefined) {
      this.n = n;
    }
    this.rw = Math.floor((this.width / this.n) * .9);
    const points = new Array<Point>();

    points.push({x: 0, y: 50});

    for (let i = 1; i < this.n; i++) {
      const x = this.toXCoord(i);
      const prev = points.at(-1)!.y;
      points.push({x, y: Skeletons.random(Math.max(0, prev - 15), Math.min(100, prev + 15))});
    }

    this.points = points;
  }

  public lineChart(): string {
    if (!this.points.length) {
      return '';
    }

    return [
      `M ${this.points[0].x} ${this.points[0].y}`,
      ...this.points.slice(1).map(point => ` L${point.x} ${point.y}`),
    ].join(' ');
  }

  public areaChart(): string {
    if (!this.points.length) {
      return '';
    }

    return [
      `M ${this.points[0].x} ${this.points[0].y}`,
      ...this.points.slice(1).map(point => ` L${point.x} ${point.y}`),
      'V 100',
      'H 0',
      'Z',
    ].join(' ');
  }

  private toXCoord(x: number): number {
    return x * this.width / (this.n - 1);
  }
}

type ChartType = 'area' | 'line' | 'bar';
const ChartTypes: ChartType[] = ['area', 'line', 'bar'];

