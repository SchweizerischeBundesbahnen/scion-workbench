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
import {styleFixture, waitUntilWorkbenchStarted} from '../../testing/testing.util';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {WorkbenchService} from '../../workbench.service';
import {PartId, ViewId} from '../../workbench.identifiers';
import {toSignal} from '@angular/core/rxjs-interop';
import {asyncScheduler, of} from 'rxjs';
import {observeOn} from 'rxjs/operators';

describe('View List', () => {

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

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const viewListMenuLeftPart = openViewListMenu({partId: 'part.left'});
    expect(getViewListItems(viewListMenuLeftPart)).toEqual(['view.101', 'view.102']);

    const viewListMenuRightPart = openViewListMenu({partId: 'part.right'});
    expect(getViewListItems(viewListMenuRightPart)).toEqual(['view.103', 'view.104']);
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

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchService = TestBed.inject(WorkbenchService);
    workbenchService.getView('view.101')!.title = 'view.101';
    workbenchService.getView('view.102')!.title = 'view.102';

    const viewListMenu = openViewListMenu({partId: 'part.main'});
    expect(getViewListItems(viewListMenu, {filter: 'view.'})).toEqual(['view.101', 'view.102']);
    expect(getViewListItems(viewListMenu, {filter: 'view.101'})).toEqual(['view.101']);
    expect(getViewListItems(viewListMenu, {filter: 'view.102'})).toEqual(['view.102']);
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

    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    const workbenchService = TestBed.inject(WorkbenchService);
    workbenchService.getView('view.101')!.title = '%view.101';
    workbenchService.getView('view.102')!.title = '%view.102';

    const viewListMenu = openViewListMenu({partId: 'part.main'});
    expect(getViewListItems(viewListMenu, {filter: 'view.'})).toEqual(['view.101', 'view.102']);
    expect(getViewListItems(viewListMenu, {filter: 'view.101'})).toEqual([]);
    expect(getViewListItems(viewListMenu, {filter: 'view.102'})).toEqual([]);
    expect(getViewListItems(viewListMenu, {filter: 'view.a'})).toEqual(['view.101']);
    expect(getViewListItems(viewListMenu, {filter: 'view.b'})).toEqual(['view.102']);
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

    const viewListMenu = openViewListMenu({partId: 'part.main'});
    await fixture.whenStable();
    expect(getViewListItems(viewListMenu, {filter: 'view.'})).toEqual(['view.101', 'view.102']);
    expect(getViewListItems(viewListMenu, {filter: 'view.101'})).toEqual([]);
    expect(getViewListItems(viewListMenu, {filter: 'view.102'})).toEqual([]);
    expect(getViewListItems(viewListMenu, {filter: 'view.a'})).toEqual(['view.101']);
    expect(getViewListItems(viewListMenu, {filter: 'view.b'})).toEqual(['view.102']);
  });
});

function openViewListMenu(locator: {partId: PartId}): HTMLElement {
  const viewListButton = document.querySelector<HTMLElement>(`wb-part[data-partid="${locator.partId}"] wb-part-bar wb-view-list-button`)!;
  viewListButton.click();
  return document.querySelector<HTMLElement>(`div.cdk-overlay-pane wb-view-list[data-partid="${locator.partId}"]`)!;
}

function getViewListItems(viewListMenu: HTMLElement, options?: {filter?: string}): ViewId[] {
  if (options?.filter) {
    const inputElement = viewListMenu.querySelector<HTMLInputElement>('wb-filter-field input')!;
    inputElement.value = options.filter;
    inputElement.dispatchEvent(new Event('input'));
  }

  const listItemElements = Array.from(viewListMenu.querySelectorAll<HTMLElement>('wb-view-list-item'));
  return Array.from(listItemElements).map(listItemElement => listItemElement.getAttribute('data-viewid') as ViewId);
}
