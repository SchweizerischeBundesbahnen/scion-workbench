import { Component, HostBinding, HostListener, OnDestroy } from '@angular/core';
import { WorkbenchViewPartService } from './workbench-view-part.service';
import { merge, noop, Subject } from 'rxjs';
import { DropEvent, Region } from '../view-part-grid/drop-zone.directive';
import { WorkbenchService } from '../workbench.service';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { takeUntil } from 'rxjs/operators';
import { VIEW_DRAG_TYPE } from '../workbench.constants';
import { Dimension } from '../wb-dimension.directive';

@Component({
  selector: 'wb-view-part',
  templateUrl: './view-part.component.html',
  styleUrls: ['./view-part.component.scss'],
  providers: [
    WorkbenchViewPartService
  ]
})
export class ViewPartComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _portalDimension: Dimension;

  @HostBinding('attr.tabindex')
  public tabIndex = -1;

  @HostBinding('class.suspend-pointer-events')
  public suspendPointerEvents = false;

  @HostBinding('attr.id')
  public get id(): string {
    return this.viewPartService.viewPartRef; // specs
  }

  constructor(private _workbench: WorkbenchService,
              private _workbenchLayout: WorkbenchLayoutService,
              public viewPartService: WorkbenchViewPartService) {
    // Suspend pointer events for the duration of a workbench layout change,
    // so that pointer events are not swallowed by the view content.
    // Otherwise, view drag operation does not work as expected.
    merge(this._workbenchLayout.viewSashDrag$, this._workbenchLayout.viewTabDrag$)
      .pipe(takeUntil(this._destroy$))
      .subscribe(event => this.suspendPointerEvents = (event === 'start'));
  }

  @HostListener('keydown.control.k', ['$event'])
  public onCloseView(event: KeyboardEvent): void {
    this.viewPartService.destroyActiveView().then(noop);
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('keydown.control.shift.k', ['$event'])
  public onCloseViews(event: KeyboardEvent): void {
    this.viewPartService.remove().then(noop);
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('keydown.control.alt.end', ['$event'])
  public onSplitVertically(event: KeyboardEvent): void {
    if (this.viewPartService.viewCount() === 0) {
      return;
    }

    this.moveViewToNewViewPart(this.viewPartService.activeViewRef, 'east').then(noop);
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('focusin')
  public onFocusIn(): void {
    this.viewPartService.activate();
  }

  public filterDropZoneEvent(event: DragEvent): boolean {
    return event.dataTransfer.types.includes(VIEW_DRAG_TYPE);
  }

  /**
   * Method invoked to move a view into this view part.
   */
  public onDrop(event: DropEvent): void {
    const sourceViewRef = this._workbench.activeViewPartService.activeViewRef;
    const sourceViewPartService = this._workbench.activeViewPartService;

    if (sourceViewPartService === this.viewPartService && event.region !== 'center' && this.viewPartService.viewCount() > 1) {
      this.moveViewToNewViewPart(sourceViewRef, event.region).then(noop);
    }
    else if (sourceViewPartService !== this.viewPartService) {
      (event.region === 'center') ? this.moveViewToThisViewPart(sourceViewRef).then(noop) : this.moveViewToNewViewPart(sourceViewRef, event.region).then(noop);
    }
  }

  public moveViewToThisViewPart(sourceViewRef: string): Promise<boolean> {
    return this.viewPartService.moveViewToThisViewPart(sourceViewRef);
  }

  public moveViewToNewViewPart(viewRef: string, region: Region): Promise<boolean> {
    return region !== 'center' ? this.viewPartService.moveViewToNewViewPart(viewRef, region) : Promise.resolve(false);
  }

  public onPortalDimensionChange(dimension: Dimension): void {
    this._portalDimension = dimension;
  }

  public get viewportWidth(): number {
    return this._portalDimension.clientWidth;
  }

  public get viewportHeight(): number {
    return this._portalDimension.clientHeight;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
