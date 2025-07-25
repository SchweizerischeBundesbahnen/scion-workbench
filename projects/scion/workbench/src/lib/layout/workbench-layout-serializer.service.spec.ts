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
import {ɵMPartGrid} from './workbench-grid.model';
import {MAIN_AREA} from './workbench-layout';
import {any, MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';

describe('WorkbenchLayoutSerializer', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should not serialize "view.markedForRemoval" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addView('view.1', {partId: 'part.left'})
      .removeView('view.1');

    // Expect view to be marked for removal.
    expect(layout.view({viewId: 'view.1'}).markedForRemoval).toBeTrue();

    // Serialize layout without "view.markedForRemoval" field.
    const serializedLayout = layout.serialize({excludeViewMarkedForRemoval: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // Expect markedForRemoval not to be serialized.
    expect(deserializedLayout.view({viewId: 'view.1'}).markedForRemoval).toBeUndefined();
  });

  it('should not serialize "view.navigation.id" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addView('view.1', {partId: 'part.left'})
      .navigateView('view.1', ['path/to/view']);

    // Expect navigation id to be set.
    expect(layout.view({viewId: 'view.1'}).navigation!.id).not.toBeUndefined();

    // Serialize layout without "view.navigation.id".
    const serializedLayout = layout.serialize({excludeViewNavigationId: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // Expect navigation id not to be serialized.
    expect(deserializedLayout.view({viewId: 'view.1'}).navigation!.id).toBeUndefined();
  });

  it('should not serialize "part.navigation.id" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.1')
      .navigatePart('part.1', ['path/to/part']);

    // Expect navigation id to be set.
    expect(layout.part({partId: 'part.1'}).navigation!.id).not.toBeUndefined();

    // Serialize layout without "part.navigation.id".
    const serializedLayout = layout.serialize({excludePartNavigationId: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // Expect navigation id not to be serialized.
    expect(deserializedLayout.part({partId: 'part.1'}).navigation!.id).toBeUndefined();
  });

  it('should not serialize "view.activationInstant" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.main')
      .addView('view.1', {partId: 'part.main'})
      .activateView('view.1');

    // Expect activation id to be set.
    expect(layout.view({viewId: 'view.1'}).activationInstant).not.toBeUndefined();

    // Serialize layout without "view.activation.id".
    const serializedLayout = layout.serialize({excludeViewActivationInstant: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // Expect activation id not to be serialized.
    expect(deserializedLayout.view({viewId: 'view.1'}).activationInstant).toBeUndefined();
  });

  it('should not serialize "part.activationInstant" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.main')
      .activatePart('part.main');

    // Expect activation id to be set.
    expect(layout.part({partId: 'part.main'}).activationInstant).not.toBeUndefined();

    // Serialize layout without "part.activation.id".
    const serializedLayout = layout.serialize({excludePartActivationInstant: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // Expect activation id not to be serialized.
    expect(deserializedLayout.part({partId: 'part.main'}).activationInstant).toBeUndefined();
  });

  it('should not serialize "TreeNode.id" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.right'});

    // Expect node id to be set.
    expect(layout.part({partId: 'part.left'}).parent!.id).not.toBeUndefined();
    expect(layout.part({partId: 'part.right'}).parent!.id).not.toBeUndefined();
    expect(layout.part({partId: 'part.left'}).parent!.id).toEqual(layout.part({partId: 'part.right'}).parent!.id);

    // Serialize layout without "nodeId".
    const serializedLayout = layout.serialize({excludeTreeNodeId: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // Expect node id not to be serialized.
    expect(deserializedLayout.part({partId: 'part.left'}).parent!.id).toBeUndefined();
    expect(deserializedLayout.part({partId: 'part.right'}).parent!.id).toBeUndefined();

    // Expect part id to still be serialized.
    expect(deserializedLayout.part({partId: 'part.left'}).id).not.toBeUndefined();
    expect(deserializedLayout.part({partId: 'part.right'}).id).not.toBeUndefined();
  });

  it('should not serialize "grid.migrated" field', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);

    (layout.grids.main as Mutable<ɵMPartGrid>).migrated = true;
    (layout.grids.mainArea as Mutable<ɵMPartGrid>).migrated = true;

    // Expect "migrated" flag to be set.
    expect(layout.grids.main.migrated).toBeTrue();
    expect(layout.grids.mainArea.migrated).toBeTrue();

    // Serialize layout.
    const serializedLayout = layout.serialize();
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // Expect "migrated" flag not to be serialized.
    expect(deserializedLayout.grids.main.migrated).toBeUndefined();
    expect(deserializedLayout.grids.mainArea.migrated).toBeUndefined();
  });

  it('should serialize part identifiers into logical identifiers based on their order in the layout', async () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.right-top', {align: 'right', relativeTo: MAIN_AREA})
      .addPart('right-bottom', {align: 'bottom', relativeTo: 'part.right-top'}); // alternative id

    // Serialize and deserialize the layout.
    const serializedLayout = workbenchLayout.serialize({assignStablePartIdentifier: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    expect(deserializedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({
              id: 'part.__1__',
            }),
            child2: new MTreeNode({
              child1: new MPart({
                id: 'part.__2__',
              }),
              child2: new MPart({
                id: 'part.__3__',
                alternativeId: 'right-bottom',
              }),
            }),
          }),
        },
      },
    });
  });

  it('should serialize view identifiers into logical identifiers based on their order in the layout', async () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view-1', {partId: 'part.left', cssClass: 'view-1'}) // alternative id
      .addView('view.2', {partId: 'part.left', cssClass: 'view-2'})
      .addView('view-3', {partId: 'part.right', cssClass: 'view-3'}) // alternative id
      .addView('view.4', {partId: 'part.right', cssClass: 'view-4'});

    // Serialize and deserialize the layout.
    const serializedLayout = workbenchLayout.serialize({assignStableViewIdentifier: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    expect(deserializedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            child1: new MPart({
              views: [
                {id: 'view.__1__', cssClass: ['view-1'], alternativeId: 'view-1'},
                {id: 'view.__2__', cssClass: ['view-2']},
              ],
            }),
            child2: new MPart({
              views: [
                {id: 'view.__3__', cssClass: ['view-3'], alternativeId: 'view-3'},
                {id: 'view.__4__', cssClass: ['view-4']},
              ],
            }),
          }),
        },
      },
    });
  });

  it('should serialize activity identifiers into logical identifiers based on their order in the layout', async () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.activity-1', {dockTo: 'left-top'}, {label: 'Activity 1', icon: 'folder'})
      .addPart('part.activity-2', {dockTo: 'right-top'}, {label: 'Activity 2', icon: 'folder'});

    // Serialize and deserialize the layout.
    const serializedLayout = workbenchLayout.serialize({assignStableActivityIdentifier: true});
    const deserializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids, activityLayout: serializedLayout.activityLayout});

    expect(deserializedLayout).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {activities: [{id: 'activity.__1__'}]},
          rightTop: {activities: [{id: 'activity.__2__'}]},
        },
      },
      grids: {
        'activity.__1__': {
          root: new MPart({id: 'part.activity-1'}),
        },
        'activity.__2__': {
          root: new MPart({id: 'part.activity-2'}),
        },
      },
    });
  });

  /**
   * ## Given layout in version 4:
   *
   *           PERIPHERAL AREA                       MAIN AREA                                PERIPHERAL AREA
   * +-------------------------------+ +--------------------------------------------+ +-------------------------------+
   * | Part: left                    | | Part: 6f09e6e2-b63a-4f0d-9ae1-06624fdb37c7 | | Part: right                   |
   * | Views: [view.2, view.3]       | | Views: [view.1]                            | | Views: [view.4]               |
   * | Active View: view.2           | | Active View: view.1                        | | Active View: view.4           |
   * |                               | +--------------------------------------------+ |                               |
   * |                               | | Part: 1d94dcb6-76b6-47eb-b300-39448993d36b | |                               |
   * |                               | | Views: [view.5]                            | |                               |
   * |                               | | Active View: view.5                        | |                               |
   * +-------------------------------+ +--------------------------------------------+ +-------------------------------
   * view.1: [path='test-view']
   * view.2: [path='test-view']
   * view.3: [path='', navigationHint='test-view']
   * view.4: [path='test-view']
   * view.5: [path='test-view']
   */
  it('should migrate workbench layout v4 to the latest version', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      grids: {
        main: 'eyJyb290Ijp7InR5cGUiOiJNVHJlZU5vZGUiLCJjaGlsZDEiOnsidHlwZSI6Ik1QYXJ0IiwiaWQiOiJsZWZ0Iiwic3RydWN0dXJhbCI6dHJ1ZSwidmlld3MiOlt7ImlkIjoidmlldy4yIiwibmF2aWdhdGlvbiI6e319LHsiaWQiOiJ2aWV3LjMiLCJuYXZpZ2F0aW9uIjp7ImhpbnQiOiJ0ZXN0LXZpZXcifX1dLCJhY3RpdmVWaWV3SWQiOiJ2aWV3LjIifSwiY2hpbGQyIjp7InR5cGUiOiJNVHJlZU5vZGUiLCJjaGlsZDEiOnsidHlwZSI6Ik1QYXJ0IiwiaWQiOiJtYWluLWFyZWEiLCJzdHJ1Y3R1cmFsIjp0cnVlLCJ2aWV3cyI6W119LCJjaGlsZDIiOnsidHlwZSI6Ik1QYXJ0IiwiaWQiOiJyaWdodCIsInN0cnVjdHVyYWwiOnRydWUsInZpZXdzIjpbeyJpZCI6InZpZXcuNCIsIm5hdmlnYXRpb24iOnt9fV0sImFjdGl2ZVZpZXdJZCI6InZpZXcuNCJ9LCJkaXJlY3Rpb24iOiJyb3ciLCJyYXRpbyI6MC43NX0sImRpcmVjdGlvbiI6InJvdyIsInJhdGlvIjowLjI1fSwiYWN0aXZlUGFydElkIjoibGVmdCJ9Ly80',
        mainArea: 'eyJyb290Ijp7InR5cGUiOiJNVHJlZU5vZGUiLCJjaGlsZDEiOnsidHlwZSI6Ik1QYXJ0IiwiaWQiOiI2ZjA5ZTZlMi1iNjNhLTRmMGQtOWFlMS0wNjYyNGZkYjM3YzciLCJzdHJ1Y3R1cmFsIjpmYWxzZSwidmlld3MiOlt7ImlkIjoidmlldy4xIiwibmF2aWdhdGlvbiI6e319XSwiYWN0aXZlVmlld0lkIjoidmlldy4xIn0sImNoaWxkMiI6eyJ0eXBlIjoiTVBhcnQiLCJpZCI6IjFkOTRkY2I2LTc2YjYtNDdlYi1iMzAwLTM5NDQ4OTkzZDM2YiIsInN0cnVjdHVyYWwiOmZhbHNlLCJ2aWV3cyI6W3siaWQiOiJ2aWV3LjUiLCJuYXZpZ2F0aW9uIjp7fX1dLCJhY3RpdmVWaWV3SWQiOiJ2aWV3LjUifSwiZGlyZWN0aW9uIjoiY29sdW1uIiwicmF0aW8iOjAuNX0sImFjdGl2ZVBhcnRJZCI6IjFkOTRkY2I2LTc2YjYtNDdlYi1iMzAwLTM5NDQ4OTkzZDM2YiJ9Ly80',
      },
    });

    const [leftPart] = layout.parts({id: 'left'}, {throwIfEmpty: true});
    const [rightPart] = layout.parts({id: 'right'}, {throwIfEmpty: true});
    const [_1d94dcb6Part] = layout.parts({id: '1d94dcb6-76b6-47eb-b300-39448993d36b'}, {throwIfEmpty: true});
    const [_6f09e6e2] = layout.parts({id: '6f09e6e2-b63a-4f0d-9ae1-06624fdb37c7'}, {throwIfEmpty: true});

    expect(layout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            id: any(),
            direction: 'row',
            ratio: .25,
            child1: new MPart({
              id: leftPart.id,
              alternativeId: 'left',
              views: [{id: 'view.2'}, {id: 'view.3', navigation: {id: any(), hint: 'test-view'}}],
              activeViewId: 'view.2',
            }),
            child2: new MTreeNode({
              id: any(),
              direction: 'row',
              ratio: .75,
              child1: new MPart({
                id: MAIN_AREA,
              }),
              child2: new MPart({
                id: rightPart.id,
                alternativeId: 'right',
                views: [{id: 'view.4', navigation: {id: any()}}],
                activeViewId: 'view.4',
              }),
            }),
          }),
          activePartId: leftPart.id,
        },
        mainArea: {
          root: new MTreeNode({
            id: any(),
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: _6f09e6e2.id,
              alternativeId: _6f09e6e2.alternativeId,
              views: [{id: 'view.1', navigation: {id: any()}}],
              activeViewId: 'view.1',
            }),
            child2: new MPart({
              id: _1d94dcb6Part.id,
              alternativeId: _1d94dcb6Part.alternativeId,
              views: [{id: 'view.5', navigation: {id: any()}}],
              activeViewId: 'view.5',
            }),
          }),
          activePartId: _1d94dcb6Part.id,
        },
      },
    });
  });
});

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
