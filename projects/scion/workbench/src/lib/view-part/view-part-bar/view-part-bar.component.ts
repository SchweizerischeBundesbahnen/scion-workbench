/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, HostListener, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { WorkbenchViewPartService } from '../workbench-view-part.service';
import { ViewTabComponent } from '../view-tab/view-tab.component';
import { InternalWorkbenchService } from '../../workbench.service';
import { VIEW_DRAG_TYPE } from '../../workbench.constants';
import { WorkbenchLayoutService } from '../../workbench-layout.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'wb-view-part-bar',
  templateUrl: './view-part-bar.component.html',
  styleUrls: ['./view-part-bar.component.scss'],
})
export class ViewPartBarComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  @ViewChildren(ViewTabComponent)
  private _viewTabs: QueryList<ViewTabComponent>;

  @ViewChild('viewport_client', {static: true})
  private _viewportClient: ElementRef<HTMLElement>;

  public viewTabsWidthPx: number;

  constructor(private _workbench: InternalWorkbenchService,
              private _workbenchLayout: WorkbenchLayoutService,
              public viewPartService: WorkbenchViewPartService) {
    this._workbenchLayout.afterGridChange$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.scrollActiveViewTabIntoViewport());
  }

  @HostListener('dblclick', ['$event'])
  public onDoubleClick(event: MouseEvent): void {
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
    this.layout();
  }

  public onViewportClientChange(): void {
    this.layout();
  }

  public onScroll(): void {
    this.layout();
  }

  private layout(): void {
    this.viewTabsWidthPx = this._viewportClient.nativeElement.clientWidth;

    // Compute tabs which are not visible in the viewtabs viewport.
    this._viewTabs && this.viewPartService.setHiddenViewTabs(this._viewTabs
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
