import {TestBed} from '@angular/core/testing';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {waitUntilWorkbenchStarted} from '../testing/testing.util';
import {MAIN_AREA} from '../layout/workbench-layout';
import {ViewDragData, ViewDragService} from './view-drag.service';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {WORKBENCH_PART_REGISTRY} from '../part/workbench-part.registry';
import {UUID} from '@scion/toolkit/uuid';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchComponent} from '../workbench.component';
import {WORKBENCH_ID} from '../workbench-id';
import {ViewId} from '../view/workbench-view.model';
import {ActivityId} from '../activity/workbench-activity.model';

describe('ViewDragService', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should allow dropping view to main grid', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addPart('part.left', {align: 'left'})
            .addView('view.101', {partId: 'part.left'}),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchLayoutService = TestBed.inject(WorkbenchLayoutService);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging view.
    simulateViewDrag({viewId: 'view.101'});

    // Should allow dropping to main grid.
    expect(viewDragService.canDrop(workbenchLayoutService.layout().grids.main)()).toBeTrue();
  });

  it('should allow dropping view to main area grid', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.left', {align: 'left'})
            .addView('view.101', {partId: 'part.left'}),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchLayoutService = TestBed.inject(WorkbenchLayoutService);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging view.
    simulateViewDrag({viewId: 'view.101'});

    // Should allow dropping to main area grid.
    expect(viewDragService.canDrop(workbenchLayoutService.layout().grids.mainArea!)()).toBeTrue();
  });

  it('should allow dropping view to different window', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.left', {align: 'left'})
            .addView('view.100', {partId: 'part.left'}),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchPartRegistry = TestBed.inject(WORKBENCH_PART_REGISTRY);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging view.
    simulateCrossWindowViewDrag({viewId: 'view.999'});

    // Should allow dropping to different window.
    expect(viewDragService.canDrop(workbenchPartRegistry.get('part.left'))()).toBeTrue();
  });

  it('should NOT allow dropping view to activity', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('part.main')
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addView('view.101', {partId: 'part.activity-1'})
            .addView('view.102', {partId: 'part.main'})
            .activatePart('part.activity-1'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchPartRegistry = TestBed.inject(WORKBENCH_PART_REGISTRY);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging view.
    simulateViewDrag({viewId: 'view.102'});

    // Should not allow dropping view in activity.
    expect(viewDragService.canDrop(workbenchPartRegistry.get('part.activity-1'))()).toBeFalse();
  });

  it('should allow dropping activity view to same activity', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addView('view.101', {partId: 'part.activity-1'})
            .activatePart('part.activity-1'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchPartRegistry = TestBed.inject(WORKBENCH_PART_REGISTRY);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging activity view.
    simulateViewDrag({viewId: 'view.101'});

    // Should allow dropping in same activity.
    expect(viewDragService.canDrop(workbenchPartRegistry.get('part.activity-1'))()).toBeTrue();
  });

  it('should NOT allow dropping activity view to another activity', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addPart('part.activity-2', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
            .addView('view.101', {partId: 'part.activity-1'})
            .addView('view.201', {partId: 'part.activity-2'})
            .activatePart('part.activity-1')
            .activatePart('part.activity-2'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchPartRegistry = TestBed.inject(WORKBENCH_PART_REGISTRY);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging activity view.
    simulateViewDrag({viewId: 'view.101'});

    // Should not allow dropping in another activity.
    expect(viewDragService.canDrop(workbenchPartRegistry.get('part.activity-2'))()).toBeFalse();
  });

  it('should NOT allow dropping activity view to part in main area', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          mainAreaInitialPartId: 'part.initial',
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addView('view.101', {partId: 'part.activity-1'})
            .activatePart('part.activity-1'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchPartRegistry = TestBed.inject(WORKBENCH_PART_REGISTRY);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging activity view.
    simulateViewDrag({viewId: 'view.101'});

    // Should not allow dropping to part in main area.
    expect(viewDragService.canDrop(workbenchPartRegistry.get('part.initial'))()).toBeFalse();
  });

  it('should NOT allow dropping activity view to same activity in different window', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addView('view.101', {partId: 'part.activity-1'})
            .activatePart('part.activity-1'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchPartRegistry = TestBed.inject(WORKBENCH_PART_REGISTRY);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging activity view of different window.
    simulateCrossWindowViewDrag({viewId: 'view.999', activityId: 'activity.1'});

    // Should not allow dropping to different window.
    expect(viewDragService.canDrop(workbenchPartRegistry.get('part.activity-1'))()).toBeFalse();
  });

  it('should NOT allow dropping activity view to different activity in different window', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addView('view.101', {partId: 'part.activity-1'})
            .activatePart('part.activity-1'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchPartRegistry = TestBed.inject(WORKBENCH_PART_REGISTRY);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging activity view of different window.
    simulateCrossWindowViewDrag({viewId: 'view.999', activityId: 'activity.999'});

    // Should not allow dropping to different window.
    expect(viewDragService.canDrop(workbenchPartRegistry.get('part.activity-1'))()).toBeFalse();
  });

  it('should NOT allow dropping activity view to main grid', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addView('view.101', {partId: 'part.activity-1'})
            .activatePart('part.activity-1'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchLayoutService = TestBed.inject(WorkbenchLayoutService);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging activity view.
    simulateViewDrag({viewId: 'view.101'});

    // Should not allow dropping to main grid.
    expect(viewDragService.canDrop(workbenchLayoutService.layout().grids.main)()).toBeFalse();
  });

  it('should NOT allow dropping activity view to main area grid', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart(MAIN_AREA)
            .addPart('part.activity-1', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
            .addView('view.101', {partId: 'part.activity-1'})
            .activatePart('part.activity-1'),
        }),
      ],
    });
    TestBed.createComponent(WorkbenchComponent);
    await waitUntilWorkbenchStarted();

    const workbenchLayoutService = TestBed.inject(WorkbenchLayoutService);
    const viewDragService = TestBed.inject(ViewDragService);

    // Simulate dragging activity view.
    simulateViewDrag({viewId: 'view.101'});

    // Should not allow dropping to main area grid.
    expect(viewDragService.canDrop(workbenchLayoutService.layout().grids.mainArea!)()).toBeFalse();
  });

  function simulateViewDrag(dragSource: {viewId: ViewId}): void {
    const layout = TestBed.inject(WorkbenchLayoutService).layout;
    const viewDragService = TestBed.inject(ViewDragService);

    spyOn(viewDragService, 'viewDragData').and.returnValue({
      viewId: dragSource.viewId,
      activityId: layout().activity({viewId: dragSource.viewId}, {orElse: null})?.id,
      partId: layout().part({viewId: dragSource.viewId}).id,
      workbenchId: TestBed.inject(WORKBENCH_ID),
    } as ViewDragData);
  }

  function simulateCrossWindowViewDrag(dragSource: {viewId: ViewId; activityId?: ActivityId}): void {
    const viewDragService = TestBed.inject(ViewDragService);

    spyOn(viewDragService, 'viewDragData').and.returnValue({
      viewId: dragSource.viewId,
      activityId: dragSource.activityId,
      workbenchId: UUID.randomUUID(),
    } as ViewDragData);
  }
});
