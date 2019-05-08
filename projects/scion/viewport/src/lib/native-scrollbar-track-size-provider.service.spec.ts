/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { SciNativeScrollbarTrackSizeProvider } from './native-scrollbar-track-size-provider.service';

describe('SciNativeScrollbarTrackSizeProvider', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        SciNativeScrollbarTrackSizeProvider,
      ],
    });
  }));

  it('computes correct scrollbar track sizes', fakeAsync(inject([SciNativeScrollbarTrackSizeProvider], (testee: SciNativeScrollbarTrackSizeProvider) => {
    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    expect(testee.trackSize.vScrollbarTrackWidth).toEqual(fixture.componentInstance.vScrollbarTrackWidth, 'vScrollbarTrackWidth');
    expect(testee.trackSize.hScrollbarTrackHeight).toEqual(fixture.componentInstance.hScrollbarTrackHeight, 'hScrollbarTrackHeight');
    tick();
  })));
});

@Component({
  template: `
    <div #viewport style="width: 100px; height: 100px; border: 0; overflow: scroll">
      <div #viewport_client style="width: 100%; height: 100%;">
      </div>
    </div>
  `,
})
class AppComponent implements AfterViewInit {

  public vScrollbarTrackWidth: number;
  public hScrollbarTrackHeight: number;

  @ViewChild('viewport')
  public viewport: ElementRef<HTMLElement>;

  @ViewChild('viewport_client')
  public viewportClient: ElementRef<HTMLElement>;

  public ngAfterViewInit(): void {
    this.vScrollbarTrackWidth = this.viewport.nativeElement.offsetWidth - this.viewportClient.nativeElement.offsetWidth;
    this.hScrollbarTrackHeight = this.viewport.nativeElement.offsetHeight - this.viewportClient.nativeElement.offsetHeight;
  }
}

/**
 * Simulates the asynchronous passage of time for the timers and detects the fixture for changes.
 */
export function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
  tick();
}
