/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { By } from '@angular/platform-browser';

describe('Viewport', () => {

  let fixture: ComponentFixture<TesteeComponent>;
  let component: TesteeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TesteeComponent,
      ],
      imports: [
        SciViewportModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TesteeComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
  });

  it('should show a vertical scrollbar on vertical overflow', async () => {
    component.direction = 'column';
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(1) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(1) horizonal)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(2) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(2) horizonal)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(3) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(3) horizonal)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(4) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(4) horizonal)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeTruthy('(5) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(5) horizonal)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeTruthy('(6) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(6) horizonal)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeTruthy('(7) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(7) horizonal)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(8) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(8) horizonal)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(9) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(9) horizonal)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(10) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(10) horizonal)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('vertical')).toBeFalsy('(11) vertical)');
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(11) horizonal)');
  });

  it('should show a horizontal scrollbar on horizontal overflow', async () => {
    component.direction = 'row';
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(1) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(1) vertical)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(2) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(2) vertical)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(3) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(3) vertical)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(4) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(4) vertical)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeTruthy('(5) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(5) vertical)');

    component.onAdd();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeTruthy('(6) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(6) vertical)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeTruthy('(7) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(7) vertical)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(8) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(8) vertical)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(9) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(9) vertical)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(10) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(10) vertical)');

    component.onRemove();
    await waitUntilRendered();
    expect(isScrollbarVisible('horizontal')).toBeFalsy('(11) horizonal)');
    expect(isScrollbarVisible('vertical')).toBeFalsy('(11) vertical)');
  });

  function isScrollbarVisible(scrollbar: 'vertical' | 'horizontal'): boolean {
    const scrollbarElement: HTMLElement = fixture.debugElement.query(By.css(`sci-scrollbar.${scrollbar}`)).nativeElement;
    return scrollbarElement.classList.contains('overflow');
  }

  /**
   * Wait until the browser reported the dimension change.
   */
  function waitUntilRendered(renderCyclesToWait: number = 2): Promise<void> {
    fixture.detectChanges();
    if (renderCyclesToWait === 0) {
      return Promise.resolve();
    }

    return new Promise(resolve => { // tslint:disable-line:typedef
      requestAnimationFrame(() => waitUntilRendered(renderCyclesToWait - 1).then(() => resolve()));
    });
  }
});

@Component({
  selector: 'spec-testee',
  template: `
    <sci-viewport>
      <div class="container" [class.row]="direction === 'row'" [class.column]="direction === 'column'">
        <button *ngFor="let element of elements" (click)="onRemove()">Remove element</button>
      </div>
    </sci-viewport>
    <button (click)="onAdd()">Add element</button>
  `,
  styles: [`
    sci-viewport {
      height: 300px;
      width: 300px;
      background-color: cornflowerblue;
    }

    div.container.row {
      display: flex;
      flex-direction: row;
    }

    div.container.row > button {
      width: 100px;
    }

    div.container.column {
      display: flex;
      flex-direction: column;
    }

    div.container.column > button {
      height: 100px;
    }
  `],
})
class TesteeComponent {

  public elements: null[] = [];

  @Input()
  public direction: 'row' | 'column';

  public onRemove(): void {
    this.elements = this.elements.slice(0, -1);
  }

  public onAdd(): void {
    this.elements = [...this.elements, null];
  }
}

