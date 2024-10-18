/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, NgZone, viewChild} from '@angular/core';
import {coerceElement} from '@angular/cdk/coercion';
import {fromEvent} from 'rxjs';
import {subscribeInside} from '@scion/toolkit/operators';

@Component({
  selector: 'app-drag-page',
  templateUrl: './drag-page.component.html',
  styleUrls: ['./drag-page.component.scss'],
  standalone: true,
})
export default class DragPageComponent {

  private readonly host: HTMLElement;
  private readonly zone = inject(NgZone);
  private readonly dropZone = viewChild.required('drop_zone', {read: ElementRef<HTMLElement>});

  constructor(host: ElementRef<HTMLElement>) {
    this.host = host.nativeElement;
  }

  public ngOnInit(): void {
    fromEvent<DragEvent>(this.dropZone().nativeElement, 'dragover')
      .pipe(
        subscribeInside(fn => this.zone.runOutsideAngular(fn)),
      )
      .subscribe((event: DragEvent) => {
        requestAnimationFrame(() => {
          setCssVariable(this.host, {'--drag-image-width': `${event.clientX}px`});
        });
      });
  }
}

function setCssVariable(element: HTMLElement | ElementRef<HTMLElement>, variables: {[name: string]: string | null}): void {
  const target = coerceElement(element);
  Object.entries(variables).forEach(([name, value]) => {
    if (value === null) {
      target.style.removeProperty(name);
    }
    else {
      target.style.setProperty(name, value);
    }
  });
}
