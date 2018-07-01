import { Component, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { ViewPartComponent } from '../view-part/view-part.component';
import { ViewPartGridService } from '../view-part-grid/view-part-grid.service';
import { VIEW_PART_REF_INDEX, ViewPartSashBox } from '../view-part-grid/view-part-grid-serializer.service';
import { ViewPartGridUrlObserver } from '../view-part-grid/view-part-grid-url-observer.service';
import { VIEW_GRID_QUERY_PARAM } from '../workbench.constants';
import { Router } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { noop, Subject } from 'rxjs';

/**
 * Building block to render the viewpart portal grid.
 */
@Component({
  selector: 'wb-view-part-sash-box',
  templateUrl: './view-part-sash-box.component.html',
  styleUrls: ['./view-part-sash-box.component.scss']
})
export class ViewPartSashBoxComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _sash$ = new Subject<void>();

  @Input()
  public sashBox: ViewPartSashBox;

  @HostBinding('class.split-vertical')
  public get splitVertical(): boolean {
    return !this.sashBox.hsplit;
  }

  @HostBinding('class.split-horizontal')
  public get splitHorizontal(): boolean {
    return this.sashBox.hsplit;
  }

  constructor(private _host: ElementRef,
              private _viewPartGridService: ViewPartGridService,
              private _workbenchLayout: WorkbenchLayoutService,
              private _viewPartGridUrlObserver: ViewPartGridUrlObserver,
              private _router: Router) {
    this.installSashListener();
  }

  public onSashStart(): void {
    this._workbenchLayout.viewSashDrag$.next('start');
  }

  public onSash(deltaPx: number): void {
    const host = this._host.nativeElement as HTMLElement;
    const hostSizePx = (this.splitVertical ? host.clientWidth : host.clientHeight);
    this.sashBox.splitter = this.sashPositionFr + (deltaPx / hostSizePx);
    this._sash$.next();
  }

  public onSashEnd(): void {
    this._workbenchLayout.viewSashDrag$.next('end');
  }

  public get sashPositionFr(): number {
    return this.sashBox.splitter;
  }

  public sashAsViewPartPortal(which: 'sash1' | 'sash2'): WbComponentPortal<ViewPartComponent> {
    const sash = (which === 'sash1' ? this.sashBox.sash1 : this.sashBox.sash2);
    return Array.isArray(sash) ? this._viewPartGridService.resolveViewPartElseThrow(sash[VIEW_PART_REF_INDEX]).portal : null;
  }

  public sashAsSashBox(which: 'sash1' | 'sash2'): ViewPartSashBox {
    const sash = (which === 'sash1' ? this.sashBox.sash1 : this.sashBox.sash2);
    return !Array.isArray(sash) ? sash : null;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private installSashListener(): void {
    this._sash$
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(500)
      )
      .subscribe(() => {
        const serializedGrid = this._viewPartGridUrlObserver.snapshot
          .splitPosition(this.sashBox.id, this.sashBox.splitter)
          .serialize();

        this._router.navigate([], {
          queryParams: {[VIEW_GRID_QUERY_PARAM]: serializedGrid},
          queryParamsHandling: 'merge'
        }).then(noop);
      });
  }
}
