/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { SciViewportComponent } from '../../ui/viewport/viewport.component';
import { WorkbenchViewPartService } from '../workbench-view-part.service';
import { ViewTabComponent } from '../view-tab/view-tab.component';
import { DomUtil } from '../../dom.util';
import { WorkbenchViewRegistry } from '../../workbench-view-registry.service';

@Component({
  selector: 'wb-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.scss']
})
export class ViewListComponent implements AfterViewInit {

  private static MAX_VIEWLIST_VIEWPORT_HEIGHT = 500;

  private _host: HTMLElement;
  private _filter: RegExp;

  @ViewChildren(ViewTabComponent)
  private _viewTabs: QueryList<ViewTabComponent>;

  public viewportHeight: number;

  constructor(host: ElementRef<HTMLElement>,
              private _viewRegistry: WorkbenchViewRegistry,
              private _viewPartService: WorkbenchViewPartService) {
    this._host = host.nativeElement;
  }

  @HostListener('keydown.escape')
  public onEscape(): void {
    this._viewPartService.toggleViewList(false);
  }

  @HostListener('document:mousedown', ['$event'])
  public onDocumentMouseDown(event: MouseEvent): void {
    if (!DomUtil.isChildOf(event.target as HTMLElement, this._host)) {
      this._viewPartService.toggleViewList(false);
    }
  }

  public onFilter(regex: RegExp): void {
    this._filter = regex;
  }

  public get filteredViewsRefs(): string[] {
    if (!this._filter) {
      return this._viewPartService.viewRefs;
    }
    return this._viewPartService.viewRefs
      .filter(viewRef => {
        const view = this._viewRegistry.getElseThrow(viewRef);
        return this._filter.test(view.title + view.heading);
      });
  }

  public onViewportChange(viewport: SciViewportComponent): void {
    const viewlistHeight = viewport.scrollHeight;
    this.viewportHeight = Math.min(viewlistHeight, ViewListComponent.MAX_VIEWLIST_VIEWPORT_HEIGHT);
  }

  public ngAfterViewInit(): void {
    this._viewTabs.find(viewTab => viewTab.active).scrollIntoViewport();
  }
}
