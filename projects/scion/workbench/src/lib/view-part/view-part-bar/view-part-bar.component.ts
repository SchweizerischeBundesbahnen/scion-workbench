import { Component, HostListener, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { WorkbenchViewPartService } from '../workbench-view-part.service';
import { ViewTabComponent } from '../view-tab/view-tab.component';
import { WorkbenchService } from '../../workbench.service';
import { VIEW_DRAG_TYPE } from '../../workbench.constants';
import { WorkbenchLayoutService } from '../../workbench-layout.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'wb-view-part-bar',
  templateUrl: './view-part-bar.component.html',
  styleUrls: ['./view-part-bar.component.scss']
})
export class ViewPartBarComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  @ViewChildren(ViewTabComponent)
  private _viewTabs: QueryList<ViewTabComponent>;

  constructor(private _workbench: WorkbenchService,
              private _workbenchLayout: WorkbenchLayoutService,
              public viewPartService: WorkbenchViewPartService) {
    this._workbenchLayout.afterGridChange$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.scrollActiveViewTabIntoViewport());
  }

  @HostListener('dblclick')
  public onDoubleClick(): void {
    this._workbenchLayout.toggleMaximized(false);
    event.stopPropagation();
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent): void {
    if (!event.dataTransfer.types.includes(VIEW_DRAG_TYPE)) {
      return;
    }

    if (this._workbench.activeViewPartService !== this.viewPartService) {
      event.preventDefault(); // allow drop
    }
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    event.stopPropagation();

    const sourceViewRef = this._workbench.activeViewPartService.activeViewRef;
    this.viewPartService.moveViewToThisViewPart(sourceViewRef).then();
  }

  public onViewportChange(): void {
    if (!this._viewTabs) {
      return;
    }

    // Compute tabs which are not visible in the viewtabs viewport.
    this.viewPartService.setHiddenViewTabs(this._viewTabs
      .filter(viewTab => !viewTab.isVisibleInViewport())
      .map(viewTab => viewTab.viewRef));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private scrollActiveViewTabIntoViewport(): void {
    this._viewTabs.length && this._viewTabs.find(viewTab => viewTab.active).scrollIntoViewport();
  }
}
