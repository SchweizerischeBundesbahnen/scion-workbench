/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {By} from '@angular/platform-browser';
import {Component, DebugElement, signal} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {of} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {ViewId} from './workbench-view.model';

describe('View Menu', () => {

  it('should display configured text (string)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: {
            close: {text: 'close-testee'},
            closeOthers: {text: 'closeOthers-testee'},
            closeAll: {text: 'closeAll-testee'},
            closeToTheRight: {text: 'closeToTheRight-testee'},
            closeToTheLeft: {text: 'closeToTheLeft-testee'},
            moveUp: {text: 'moveUp-testee'},
            moveRight: {text: 'moveRight-testee'},
            moveDown: {text: 'moveDown-testee'},
            moveLeft: {text: 'moveLeft-testee'},
            moveToNewWindow: {text: 'moveToNewWindow-testee'},
          },
        }),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});

    // Open view context menu.
    const contextMenu = await openViewContextMenu(fixture, {viewId: 'view.100'});

    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close'})).toEqual('close-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-other-tabs'})).toEqual('closeOthers-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-all-tabs'})).toEqual('closeAll-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-right-tabs'})).toEqual('closeToTheRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-left-tabs'})).toEqual('closeToTheLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-up'})).toEqual('moveUp-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-right'})).toEqual('moveRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-down'})).toEqual('moveDown-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-left'})).toEqual('moveLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-to-new-window'})).toEqual('moveToNewWindow-testee');
  });

  it('should display configured text (() => string))', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: {
            close: {text: () => 'close-testee'},
            closeOthers: {text: () => 'closeOthers-testee'},
            closeAll: {text: () => 'closeAll-testee'},
            closeToTheRight: {text: () => 'closeToTheRight-testee'},
            closeToTheLeft: {text: () => 'closeToTheLeft-testee'},
            moveUp: {text: () => 'moveUp-testee'},
            moveRight: {text: () => 'moveRight-testee'},
            moveDown: {text: () => 'moveDown-testee'},
            moveLeft: {text: () => 'moveLeft-testee'},
            moveToNewWindow: {text: () => 'moveToNewWindow-testee'},
          },
        }),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Open view context menu.
    const contextMenu = await openViewContextMenu(fixture, {viewId: 'view.100'});

    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close'})).toEqual('close-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-other-tabs'})).toEqual('closeOthers-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-all-tabs'})).toEqual('closeAll-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-right-tabs'})).toEqual('closeToTheRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-left-tabs'})).toEqual('closeToTheLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-up'})).toEqual('moveUp-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-right'})).toEqual('moveRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-down'})).toEqual('moveDown-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-left'})).toEqual('moveLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-to-new-window'})).toEqual('moveToNewWindow-testee');
  });

  it('should display configured text (() => Signal))', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: {
            close: {text: () => signal('close-testee')},
            closeOthers: {text: () => signal('closeOthers-testee')},
            closeAll: {text: () => signal('closeAll-testee')},
            closeToTheRight: {text: () => signal('closeToTheRight-testee')},
            closeToTheLeft: {text: () => signal('closeToTheLeft-testee')},
            moveUp: {text: () => signal('moveUp-testee')},
            moveRight: {text: () => signal('moveRight-testee')},
            moveDown: {text: () => signal('moveDown-testee')},
            moveLeft: {text: () => signal('moveLeft-testee')},
            moveToNewWindow: {text: () => signal('moveToNewWindow-testee')},
          },
        }),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Open view context menu.
    const contextMenu = await openViewContextMenu(fixture, {viewId: 'view.100'});

    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close'})).toEqual('close-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-other-tabs'})).toEqual('closeOthers-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-all-tabs'})).toEqual('closeAll-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-right-tabs'})).toEqual('closeToTheRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-left-tabs'})).toEqual('closeToTheLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-up'})).toEqual('moveUp-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-right'})).toEqual('moveRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-down'})).toEqual('moveDown-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-left'})).toEqual('moveLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-to-new-window'})).toEqual('moveToNewWindow-testee');
  });

  it('should display text provided as observable (() => Signal))', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          viewMenuItems: {
            close: {text: () => toSignal(of('close-testee'), {requireSync: true})},
            closeOthers: {text: () => toSignal(of('closeOthers-testee'), {requireSync: true})},
            closeAll: {text: () => toSignal(of('closeAll-testee'), {requireSync: true})},
            closeToTheRight: {text: () => toSignal(of('closeToTheRight-testee'), {requireSync: true})},
            closeToTheLeft: {text: () => toSignal(of('closeToTheLeft-testee'), {requireSync: true})},
            moveUp: {text: () => toSignal(of('moveUp-testee'), {requireSync: true})},
            moveRight: {text: () => toSignal(of('moveRight-testee'), {requireSync: true})},
            moveDown: {text: () => toSignal(of('moveDown-testee'), {requireSync: true})},
            moveLeft: {text: () => toSignal(of('moveLeft-testee'), {requireSync: true})},
            moveToNewWindow: {text: () => toSignal(of('moveToNewWindow-testee'), {requireSync: true})},
          },
        }),
        provideRouter([
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Navigate to "path/to/view".
    const workbenchRouter = TestBed.inject(WorkbenchRouter);
    await workbenchRouter.navigate(['path/to/view'], {target: 'view.100'});
    await waitUntilStable();

    // Open view context menu.
    const contextMenu = await openViewContextMenu(fixture, {viewId: 'view.100'});

    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close'})).toEqual('close-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-other-tabs'})).toEqual('closeOthers-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-all-tabs'})).toEqual('closeAll-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-right-tabs'})).toEqual('closeToTheRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-close-left-tabs'})).toEqual('closeToTheLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-up'})).toEqual('moveUp-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-right'})).toEqual('moveRight-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-down'})).toEqual('moveDown-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-left'})).toEqual('moveLeft-testee');
    expect(getMenuItemText(contextMenu, {cssClass: 'e2e-move-to-new-window'})).toEqual('moveToNewWindow-testee');
  });
});

@Component({
  selector: 'spec-view',
  template: 'SpecViewComponent',
  standalone: true,
})
class SpecViewComponent {
}

async function openViewContextMenu(fixture: ComponentFixture<unknown>, locator: {viewId: ViewId}): Promise<DebugElement> {
  const viewTabElement = fixture.debugElement.query(By.css(`wb-view-tab[data-viewid="${locator.viewId}"]`));
  viewTabElement.nativeElement.dispatchEvent(new MouseEvent('contextmenu'));
  await waitUntilStable();
  return fixture.debugElement.parent!.query(By.css(`div.cdk-overlay-pane wb-view-menu`));
}

function getMenuItemText(contextMenu: DebugElement, locator: {cssClass: string}): string {
  return contextMenu.query(By.css(`button.menu-item.${locator.cssClass} > div.text`)).nativeElement.innerText;
}
