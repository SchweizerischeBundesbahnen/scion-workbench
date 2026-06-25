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
import {styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {WorkbenchService} from '../../workbench.service';
import {PartId} from '../../workbench.identifiers';
import {toSignal} from '@angular/core/rxjs-interop';
import {asyncScheduler, of} from 'rxjs';
import {observeOn} from 'rxjs/operators';
import {MenuPO} from '../../testing/jasmine/matcher/menu.po';
import {toEqualMenuCustomMatcher} from '../../testing/jasmine/matcher/to-equal-menu.matcher';

describe('View List', () => {

  beforeEach(() => {
    jasmine.addAsyncMatchers(toEqualMenuCustomMatcher);
  });

  it('should list views', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.left')
            .addPart('part.right', {align: 'right'})
            .addView('view.101', {partId: 'part.left'})
            .addView('view.102', {partId: 'part.left'})
            .addView('view.103', {partId: 'part.right'})
            .addView('view.104', {partId: 'part.right'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const menu = new MenuPO(fixture);

    await openViewListMenu({partId: 'part.left'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            attributes: {
              'data-viewid': 'view.101',
            },
          },
          {
            type: 'menu-item',
            attributes: {
              'data-viewid': 'view.102',
            },
          },
        ],
      },
    ]);

    await openViewListMenu({partId: 'part.right'});
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            attributes: {
              'data-viewid': 'view.103',
            },
          },
          {
            type: 'menu-item',
            attributes: {
              'data-viewid': 'view.104',
            },
          },
        ],
      },
    ]);
  });

  it('should filter views', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.101', {partId: 'part.main'})
            .addView('view.102', {partId: 'part.main'}),
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchService = TestBed.inject(WorkbenchService);
    workbenchService.getView('view.101')!.title = 'view.101';
    workbenchService.getView('view.102')!.title = 'view.102';

    const menu = new MenuPO(fixture);
    await openViewListMenu({partId: 'part.main'});

    menu.filterMenuItems('view.');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.101',
            attributes: {
              'data-viewid': 'view.101',
            },
          },
          {
            type: 'menu-item',
            label: 'view.102',
            attributes: {
              'data-viewid': 'view.102',
            },
          },
        ],
      },
    ]);

    menu.filterMenuItems('view.101');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.101',
            attributes: {
              'data-viewid': 'view.101',
            },
          },
        ],
      },
    ]);

    menu.filterMenuItems('view.102');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.102',
            attributes: {
              'data-viewid': 'view.102',
            },
          },
        ],
      },
    ]);
  });

  it('should filter views by translated titles', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.101', {partId: 'part.main'})
            .addView('view.102', {partId: 'part.main'}),
          textProvider: key => {
            switch (key) {
              case 'view.101':
                return 'view.a';
              case 'view.102':
                return 'view.b';
              default:
                return undefined;
            }
          },
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchService = TestBed.inject(WorkbenchService);
    workbenchService.getView('view.101')!.title = '%view.101';
    workbenchService.getView('view.102')!.title = '%view.102';

    const menu = new MenuPO(fixture);
    await openViewListMenu({partId: 'part.main'});

    menu.filterMenuItems('view.');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.a',
            attributes: {
              'data-viewid': 'view.101',
            },
          },
          {
            type: 'menu-item',
            label: 'view.b',
            attributes: {
              'data-viewid': 'view.102',
            },
          },
        ],
      },
    ]);

    menu.filterMenuItems('view.101');
    await expectAsync(menu).toEqualMenu([]);

    menu.filterMenuItems('view.102');
    await expectAsync(menu).toEqualMenu([]);

    menu.filterMenuItems('view.a');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.a',
            attributes: {
              'data-viewid': 'view.101',
            },
          },
        ],
      },
    ]);

    menu.filterMenuItems('view.b');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.b',
            attributes: {
              'data-viewid': 'view.102',
            },
          },
        ],
      },
    ]);
  });

  it('should filter views by translated titles (async text provider)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addView('view.101', {partId: 'part.main'})
            .addView('view.102', {partId: 'part.main'}),
          textProvider: key => {
            switch (key) {
              case 'view.101':
                return toSignal(of('view.a').pipe(observeOn(asyncScheduler)), {initialValue: key});
              case 'view.102':
                return toSignal(of('view.b').pipe(observeOn(asyncScheduler)), {initialValue: key});
              default:
                return undefined;
            }
          },
        }),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchService = TestBed.inject(WorkbenchService);
    workbenchService.getView('view.101')!.title = '%view.101';
    workbenchService.getView('view.102')!.title = '%view.102';

    const menu = new MenuPO(fixture);
    await openViewListMenu({partId: 'part.main'});

    menu.filterMenuItems('view.');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.a',
            attributes: {
              'data-viewid': 'view.101',
            },
          },
          {
            type: 'menu-item',
            label: 'view.b',
            attributes: {
              'data-viewid': 'view.102',
            },
          },
        ],
      },
    ]);

    menu.filterMenuItems('view.101');
    await expectAsync(menu).toEqualMenu([]);

    menu.filterMenuItems('view.102');
    await expectAsync(menu).toEqualMenu([]);

    menu.filterMenuItems('view.a');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.a',
            attributes: {
              'data-viewid': 'view.101',
            },
          },
        ],
      },
    ]);

    menu.filterMenuItems('view.b');
    await expectAsync(menu).toEqualMenu([
      {
        type: 'group',
        children: [
          {
            type: 'menu-item',
            label: 'view.b',
            attributes: {
              'data-viewid': 'view.102',
            },
          },
        ],
      },
    ]);
  });
});

async function openViewListMenu(locator: {partId: PartId}): Promise<void> {
  const viewListButton = document.querySelector<HTMLElement>(`wb-part[data-partid="${locator.partId}"] wb-part-bar button.e2e-view-list`)!;
  viewListButton.click();
  await waitUntilStable();
}
