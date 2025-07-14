/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {ɵWorkbenchLayoutFactory} from './ɵworkbench-layout.factory';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchLayouts} from './workbench-layouts.util';

describe('WorkbenchLayouts.findPart', () => {

  it('should find part', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right-top', {relativeTo: 'part.left', align: 'right'})
      .addPart('part.right-bottom', {relativeTo: 'part.right-top', align: 'bottom'});

    expect(WorkbenchLayouts.findPart(layout.grids.main.root, part => part.id === 'part.left')).toBe(layout.part({partId: 'part.left'}));
    expect(WorkbenchLayouts.findPart(layout.grids.main.root, part => part.id === 'part.right-top')).toBe(layout.part({partId: 'part.right-top'}));
    expect(WorkbenchLayouts.findPart(layout.grids.main.root, part => part.id === 'part.right-bottom')).toBe(layout.part({partId: 'part.right-bottom'}));
    expect(WorkbenchLayouts.findPart(layout.grids.main.root, () => false)).toBeNull();
  });
});
