/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
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
      imports: [AppTestModule],
    });
  }));

  it('allows to set a root viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const rootViewPart: ViewPartInfoArray = ['viewPart-root'];

    const testee = new ViewPartGrid(serializer.serializeGrid(rootViewPart), serializer);
    expect(testee.root).toEqual(rootViewPart);
  }));

  it('allows to add a sibling viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const leftViewPart: ViewPartInfoArray = ['viewPart-left', 'view-2', 'view-1', 'view-2', 'view-3'];

    const grid1 = new ViewPartGrid(serializer.serializeGrid(leftViewPart), serializer);
    const grid2 = grid1.addSiblingViewPart('east', 'viewPart-left', 'viewPart-right');

    expect(grid1.root).toEqual(leftViewPart); // expect that grid1 did not change (immutable)
    expect(grid2.root).toEqual({
      id: 1,
      sash1: leftViewPart,
      sash2: ['viewPart-right'],
      splitter: .5,
      hsplit: false,
    });
  }));

  it('allows to remove the right sibling viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const leftViewPart = ['viewPart-left', 'view-2', 'view-1', 'view-2', 'view-3'];
    const rightViewPart = ['viewPart-right', 'view-5', 'view-4', 'view-5', 'view-6'];

    const grid1 = new ViewPartGrid(serializer.serializeGrid({
      id: 1,
      sash1: leftViewPart,
      sash2: rightViewPart,
      splitter: .5,
      hsplit: false,
    }), serializer);
    const grid2 = grid1.removeViewPart('viewPart-left');

    expect(grid1.root).toEqual({ // expect that grid1 did not change (immutable)
      id: 1,
      sash1: leftViewPart,
      sash2: rightViewPart,
      splitter: .5,
      hsplit: false,
    });
    expect(grid2.root).toEqual(rightViewPart);
  }));

  it('allows to remove the left sibling viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const leftViewPart = ['viewPart-left', 'view-2', 'view-1', 'view-2', 'view-3'];
    const rightViewPart = ['viewPart-right', 'view-5', 'view-4', 'view-5', 'view-6'];

    const grid1 = new ViewPartGrid(serializer.serializeGrid({
      id: 1,
      sash1: leftViewPart,
      sash2: rightViewPart,
      splitter: .5,
      hsplit: false,
    }), serializer);

    const grid2 = grid1.removeViewPart('viewPart-right');

    expect(grid1.root).toEqual({ // expect that grid1 did not change (immutable)
      id: 1,
      sash1: leftViewPart,
      sash2: rightViewPart,
      splitter: .5,
      hsplit: false,
    });
    expect(grid2.root).toEqual(leftViewPart);
  }));

  it('allows to remove the root viewpart', inject([ViewPartGridSerializerService], (serializer: ViewPartGridSerializerService) => {
    const rootViewPart = ['viewPart-root', 'view-2', 'view-1', 'view-2', 'view-3'];
    const grid1 = new ViewPartGrid(serializer.serializeGrid(rootViewPart), serializer);
    const grid2 = grid1.removeViewPart('viewPart-root');

    expect(grid1.root).toEqual(rootViewPart); // expect that grid1 did not change (immutable)
    expect(grid2.root).toBeNull();
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
    const grid1 = new ViewPartGrid(serializer.serializeGrid(viewPart_1), serializer);
    const expectedGrid1 = viewPart_1;

    // Add ViewPart 2 to the east of ViewPart 2
    const grid2 = grid1.addSiblingViewPart('east', 'viewPart-1', 'viewPart-2');
    const expectedGrid2 = {
      id: 1,
      sash1: viewPart_1,
      sash2: viewPart_2,
      splitter: .5,
      hsplit: false,
    };

    // Add ViewPart 3 to the east of ViewPart 3
    const grid3 = grid2.addSiblingViewPart('east', 'viewPart-2', 'viewPart-3');
    const expectedGrid3 = {
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: viewPart_2,
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false,
      },
      splitter: .5,
      hsplit: false,
    };

    // Add ViewPart 4 to the south of ViewPart 2
    const grid4 = grid3.addSiblingViewPart('south', 'viewPart-2', 'viewPart-4');
    const expectedGrid4 = {
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true,
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false,
      },
      splitter: .5,
      hsplit: false,
    };

    // Add ViewPart 5 to the south of ViewPart 1
    const grid5 = grid4.addSiblingViewPart('south', 'viewPart-1', 'viewPart-5');
    const expectedGrid5 = {
      id: 1,
      sash1: {
        id: 4,
        sash1: viewPart_1,
        sash2: viewPart_5,
        splitter: .5,
        hsplit: true,
      },
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true,
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false,
      },
      splitter: .5,
      hsplit: false,
    };

    // Add ViewPart 6 to the east of ViewPart 5
    const grid6 = grid5.addSiblingViewPart('east', 'viewPart-5', 'viewPart-6');
    const expectedGrid6 = {
      id: 1,
      sash1: {
        id: 4,
        sash1: viewPart_1,
        sash2: {
          id: 5,
          sash1: viewPart_5,
          sash2: viewPart_6,
          splitter: .5,
          hsplit: false,
        },
        splitter: .5,
        hsplit: true,
      },
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true,
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false,
      },
      splitter: .5,
      hsplit: false,
    };

    // Remove ViewPart 6
    const grid7 = grid6.removeViewPart('viewPart-6');
    const expectedGrid7 = {
      id: 1,
      sash1: {
        id: 4,
        sash1: viewPart_1,
        sash2: viewPart_5,
        splitter: .5,
        hsplit: true,
      },
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true,
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false,
      },
      splitter: .5,
      hsplit: false,
    };

    // Remove ViewPart 5
    const grid8 = grid7.removeViewPart('viewPart-5');
    const expectedGrid8 = {
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: {
          id: 3,
          sash1: viewPart_2,
          sash2: viewPart_4,
          splitter: .5,
          hsplit: true,
        },
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false,
      },
      splitter: .5,
      hsplit: false,
    };

    // Remove ViewPart 4
    const grid9 = grid8.removeViewPart('viewPart-4');
    const expectedGrid9 = {
      id: 1,
      sash1: viewPart_1,
      sash2: {
        id: 2,
        sash1: viewPart_2,
        sash2: viewPart_3,
        splitter: .5,
        hsplit: false,
      },
      splitter: .5,
      hsplit: false,
    };

    // Remove ViewPart 3
    const grid10 = grid9.removeViewPart('viewPart-3');
    const expectedGrid10 = {
      id: 1,
      sash1: viewPart_1,
      sash2: viewPart_2,
      splitter: .5,
      hsplit: false,
    };

    // Remove ViewPart 2
    const grid11 = grid10.removeViewPart('viewPart-2');
    const expectedGrid11 = viewPart_1;

    // Remove ViewPart 1
    const grid12 = grid11.removeViewPart('viewPart-1');

    // assert grids and that previous grids did not change (immutability)
    expect(grid1.root).toEqual(expectedGrid1);
    expect(grid2.root).toEqual(expectedGrid2);
    expect(grid3.root).toEqual(expectedGrid3);
    expect(grid4.root).toEqual(expectedGrid4);
    expect(grid5.root).toEqual(expectedGrid5);
    expect(grid6.root).toEqual(expectedGrid6);
    expect(grid7.root).toEqual(expectedGrid7);
    expect(grid8.root).toEqual(expectedGrid8);
    expect(grid9.root).toEqual(expectedGrid9);
    expect(grid10.root).toEqual(expectedGrid10);
    expect(grid11.root).toEqual(expectedGrid11);
    expect(grid12.root).toBeNull();
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
