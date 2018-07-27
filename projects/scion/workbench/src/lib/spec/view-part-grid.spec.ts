/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { ViewPartGridSerializerService, ViewPartInfoArray } from '../view-part-grid/view-part-grid-serializer.service';
import { ViewPartGrid } from '../view-part-grid/view-part-grid.model';

describe('ViewPartGrid', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [AppTestModule]
    });
  }));

  it('allows to set a root viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const rootViewPart: ViewPartInfoArray = ['viewPart-root'];
    const testee = new ViewPartGrid(rootViewPart, serializer);
    expect(testee.root).toBe(rootViewPart);
  }));

  it('allows to add a sibling viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const leftViewPart: ViewPartInfoArray = ['viewPart-left', 'view-2', 'view-1', 'view-2', 'view-3'];

    const testee = new ViewPartGrid(leftViewPart, serializer);
    testee.addSiblingViewPart('east', 'viewPart-left', 'viewPart-right');

    expect(testee.root).toEqual({
      id: 1,
      sash1: leftViewPart,
      sash2: ['viewPart-right'],
      splitter: .5,
      hsplit: false
    });
  }));

  it('allows to remove the right sibling viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const leftViewPart = ['viewPart-left', 'view-2', 'view-1', 'view-2', 'view-3'];
    const rightViewPart = ['viewPart-right', 'view-5', 'view-4', 'view-5', 'view-6'];

    const testee = new ViewPartGrid({
      id: 1,
      sash1: leftViewPart,
      sash2: rightViewPart,
      splitter: .5,
      hsplit: false
    }, serializer);

    testee.removeViewPart('viewPart-left');
    expect(testee.root).toEqual(rightViewPart);
  }));

  it('allows to remove the left sibling viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const leftViewPart = ['viewPart-left', 'view-2', 'view-1', 'view-2', 'view-3'];
    const rightViewPart = ['viewPart-right', 'view-5', 'view-4', 'view-5', 'view-6'];

    const testee = new ViewPartGrid({
      id: 1,
      sash1: leftViewPart,
      sash2: rightViewPart,
      splitter: .5,
      hsplit: false
    }, serializer);

    testee.removeViewPart('viewPart-right');
    expect(testee.root).toEqual(leftViewPart);
  }));

  it('allows to remove the root viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const rootViewPart = ['viewPart-root', 'view-2', 'view-1', 'view-2', 'view-3'];
    const testee = new ViewPartGrid(rootViewPart, serializer);

    testee.removeViewPart('viewPart-root');

    expect(testee.root).toBeNull();
  }));

  /**
   * Adds 6 portals and removes the 6 portals again.
   *
   * Grid:
   * +-------+---+---+
   * | 1     | 2 | 3 |
   * |---+---|   |   |
   * | 5 | 6 |   |   |
   * |   |   +---+   |
   * |   |   | 4 |   |
   * +---+---+---+---+
   *
   */
  it('allows to create a grid which consists of 6 viewparts', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const viewPart_1 = ['viewPart-1'];
    const viewPart_2 = ['viewPart-2'];
    const viewPart_3 = ['viewPart-3'];
    const viewPart_4 = ['viewPart-4'];
    const viewPart_5 = ['viewPart-5'];
    const viewPart_6 = ['viewPart-6'];

    // Set ViewPart 1 as root viewpart
    const testee = new ViewPartGrid(viewPart_1, serializer);
    expect(testee.root).toEqual(viewPart_1, 'Add ViewPart 1');

    // Add ViewPart 2 to the east of ViewPart 2
    testee.addSiblingViewPart('east', 'viewPart-1', 'viewPart-2');
    expect(testee.root).toEqual({
      id: 1,
      sash1: viewPart_1,
      sash2: viewPart_2,
      splitter: .5,
      hsplit: false
    }, 'Add ViewPart 2');

    // Add ViewPart 3 to the east of ViewPart 3
    testee.addSiblingViewPart('east', 'viewPart-2', 'viewPart-3');
    expect(testee.root).toEqual({
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: viewPart_2,
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false
      },
      splitter: .5,
      hsplit: false
    }, 'Add ViewPart 3');

    // Add ViewPart 4 to the south of ViewPart 2
    testee.addSiblingViewPart('south', 'viewPart-2', 'viewPart-4');
    expect(testee.root).toEqual({
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false
      },
      splitter: .5,
      hsplit: false
    }, 'Add ViewPart 4');

    // Add ViewPart 5 to the south of ViewPart 1
    testee.addSiblingViewPart('south', 'viewPart-1', 'viewPart-5');
    expect(testee.root).toEqual({
      id: 1,
      sash1: {
        id: 4,
        sash1: viewPart_1,
        sash2: viewPart_5,
        splitter: .5,
        hsplit: true
      },
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false
      },
      splitter: .5,
      hsplit: false
    }, 'Add ViewPart 5');

    // Add ViewPart 6 to the east of ViewPart 5
    testee.addSiblingViewPart('east', 'viewPart-5', 'viewPart-6');
    expect(testee.root).toEqual({
      id: 1,
      sash1: {
        id: 4,
        sash1: viewPart_1,
        sash2: {
          id: 5,
          sash1: viewPart_5,
          sash2: viewPart_6,
          splitter: .5,
          hsplit: false
        },
        splitter: .5,
        hsplit: true
      },
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false
      },
      splitter: .5,
      hsplit: false
    }, 'Add ViewPart 6');

    // Remove ViewPart 6
    testee.removeViewPart('viewPart-6');
    expect(testee.root).toEqual({
      id: 1,
      sash1: {
        id: 4,
        sash1: viewPart_1,
        sash2: viewPart_5,
        splitter: .5,
        hsplit: true
      },
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false
      },
      splitter: .5,
      hsplit: false
    }, 'Remove ViewPart 6');

    // Remove ViewPart 5
    testee.removeViewPart('viewPart-5');
    expect(testee.root).toEqual({
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false
      },
      splitter: .5,
      hsplit: false
    }, 'Remove ViewPart 5');

    // Remove ViewPart 4
    testee.removeViewPart('viewPart-4');
    expect(testee.root).toEqual({
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: viewPart_2,
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false
      },
      splitter: .5,
      hsplit: false
    }, 'Remove ViewPart 4');

    // Remove ViewPart 3
    testee.removeViewPart('viewPart-3');
    expect(testee.root).toEqual({
      id: 1,
      sash1: viewPart_1,
      sash2: viewPart_2,
      splitter: .5,
      hsplit: false
    }, 'Remove ViewPart 3');

    // Remove ViewPart 2
    testee.removeViewPart('viewPart-2');
    expect(testee.root).toEqual(viewPart_1, 'Remove ViewPart 2');

    // Remove ViewPart 1
    testee.removeViewPart('viewPart-1');
    expect(testee.root).toBeNull('Remove ViewPart 1');
  }));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/

@NgModule({
  providers: [ViewPartGridSerializerService],
})
class AppTestModule {
}
