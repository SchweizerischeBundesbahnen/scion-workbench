/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
import {ɵMPartGrid} from './workbench-layout.model';
import {MAIN_AREA} from '@scion/workbench';

describe('WorkbenchLayoutSerializer', () => {

  it('should not serialize "view.markedForRemoval" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left')
      .addView('view.1', {partId: 'left'})
      .removeView('view.1');

    // Expect view to be marked for removal.
    expect(layout.view({viewId: 'view.1'}).markedForRemoval).toBeTrue();

    // Serialize layout without "view.markedForRemoval" field.
    const serializedLayout = layout.serialize({excludeViewMarkedForRemoval: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({workbenchGrid: serializedLayout.workbenchGrid});

    // Expect markedForRemoval not to be serialized.
    expect(deserializedLayout.view({viewId: 'view.1'}).markedForRemoval).toBeUndefined();
  });

  it('should not serialize "view.navigation.id" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left')
      .addView('view.1', {partId: 'left'})
      .navigateView('view.1', ['path/to/view']);

    // Expect navigation id to be set.
    expect(layout.view({viewId: 'view.1'}).navigation!.id).not.toBeUndefined();

    // Serialize layout without "view.navigation.id".
    const serializedLayout = layout.serialize({excludeViewNavigationId: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({workbenchGrid: serializedLayout.workbenchGrid});

    // Expect navigation id not to be serialized.
    expect(deserializedLayout.view({viewId: 'view.1'}).navigation!.id).toBeUndefined();
  });

  it('should not serialize "view.uid" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left')
      .addView('view.1', {partId: 'left'});

    // Expect view uid to be set.
    expect(layout.view({viewId: 'view.1'}).uid).not.toBeUndefined();

    // Serialize layout without "view.uid".
    const serializedLayout = layout.serialize({excludeViewUid: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({workbenchGrid: serializedLayout.workbenchGrid});

    // Expect uid not to be serialized.
    expect(deserializedLayout.view({viewId: 'view.1'}).uid).not.toEqual(layout.view({viewId: 'view.1'}).uid);
  });

  it('should not serialize "TreeNode.nodeId" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left')
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'right'});

    // Expect node id to be set.
    expect(layout.part({partId: 'left'}).parent!.nodeId).not.toBeUndefined();
    expect(layout.part({partId: 'right'}).parent!.nodeId).not.toBeUndefined();
    expect(layout.part({partId: 'left'}).parent!.nodeId).toEqual(layout.part({partId: 'right'}).parent!.nodeId);

    // Serialize layout without "nodeId".
    const serializedLayout = layout.serialize({excludeNodeId: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({workbenchGrid: serializedLayout.workbenchGrid});

    // Expect uid not to be serialized.
    expect(deserializedLayout.part({partId: 'left'}).parent!.nodeId).not.toEqual(layout.part({partId: 'left'}).parent!.nodeId);
    expect(deserializedLayout.part({partId: 'right'}).parent!.nodeId).not.toEqual(layout.part({partId: 'right'}).parent!.nodeId);
    expect(deserializedLayout.part({partId: 'left'}).parent!.nodeId).toEqual(deserializedLayout.part({partId: 'right'}).parent!.nodeId);
  });

  it('should not serialize "grid.migrated" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);

    (layout.workbenchGrid as Mutable<ɵMPartGrid>).migrated = true;
    (layout.mainAreaGrid as Mutable<ɵMPartGrid>).migrated = true;

    // Expect node id to be set.
    expect(layout.workbenchGrid.migrated).toBeTrue();
    expect(layout.mainAreaGrid!.migrated).toBeTrue();

    // Serialize layout.
    const serializedLayout = layout.serialize();
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({workbenchGrid: serializedLayout.workbenchGrid});

    // Expect "migrated" flag not to be serialized.
    expect(deserializedLayout.workbenchGrid.migrated).toBeUndefined();
    expect(deserializedLayout.mainAreaGrid!.migrated).toBeUndefined();
  });
});

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
