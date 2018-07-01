import { Component, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { InternalWorkbenchView } from '../../workbench.model';
import { WorkbenchViewPartService } from '../workbench-view-part.service';
import { ViewportComponent } from '../../viewport/viewport.component';
import { noop } from 'rxjs';
import { WorkbenchService } from '../../workbench.service';
import { VIEW_DRAG_TYPE } from '../../workbench.constants';
import { WorkbenchLayoutService } from '../../workbench-layout.service';
import { WorkbenchViewRegistry } from '../../workbench-view-registry.service';

@Component({
  selector: 'wb-view-tab',
  templateUrl: './view-tab.component.html',
  styleUrls: ['./view-tab.component.scss']
})
export class ViewTabComponent {

  private _host: HTMLElement;
  public view: InternalWorkbenchView;

  @Input()
  public set viewRef(viewRef: string) {
    this.view = this._viewRegistry.getElseThrow(viewRef);
  }

  @Input()
  public renderingHint: 'tab-item' | 'list-item' = 'tab-item';

  constructor(host: ElementRef<HTMLElement>,
              private _workbench: WorkbenchService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _workbenchLayout: WorkbenchLayoutService,
              private _viewport: ViewportComponent,
              private _viewPartService: WorkbenchViewPartService) {
    this._host = host.nativeElement;
  }

  @HostBinding('class.active')
  public get active(): boolean {
    return this._viewPartService.isViewActive(this.view.viewRef);
  }

  @HostBinding('class.hidden')
  public get hidden(): boolean {
    return this._viewPartService.isViewTabHidden(this.view.viewRef);
  }

  @HostBinding('class.dirty')
  public get dirty(): boolean {
    return this.view.dirty;
  }

  @HostBinding('class.tab-item')
  public get renderAsTabItem(): boolean {
    return this.renderingHint === 'tab-item';
  }

  @HostBinding('class.list-item')
  public get renderAsListItem(): boolean {
    return this.renderingHint === 'list-item';
  }

  @HostListener('click')
  public onClick(): void {
    this._viewPartService.activateView(this.viewRef).then(noop);
  }

  @HostListener('dblclick', ['$event'])
  public onDoubleClick(event: MouseEvent): void {
    this._workbenchLayout.toggleMaximized();
    event.stopPropagation();
  }

  @HostBinding('attr.draggable')
  public get draggable(): boolean {
    return true;
  }

  @HostListener('dragstart', ['$event'])
  public onDragStart(event: DragEvent): void {
    this._workbenchLayout.viewTabDrag$.next('start');

    // Make this view the active view to act as drag source
    this._viewPartService.activateView(this.viewRef).then(noop);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(VIEW_DRAG_TYPE, this.viewRef);
  }

  /**
   * At the end of a drag operation, the 'dragend' event fires at the element where the drag operation started.
   * This event fires whether the drag completed or was canceled.
   *
   * However, the event is not dispatched if the source node is moved or removed during the drag.
   */
  @HostListener('dragend')
  public onDragEnd(): void {
    this._workbenchLayout.viewTabDrag$.next('end');
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent): void {
    if (!event.dataTransfer.types.includes(VIEW_DRAG_TYPE)) {
      return;
    }

    event.preventDefault(); // allow drop
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    if (this._workbench.activeViewPartService === this._viewPartService) {
      event.stopPropagation();
    }

    // Swap view tabs if within the same tabbar
    const dragSourceViewRef = this._viewPartService.activeViewRef;
    if (this._workbench.activeViewPartService === this._viewPartService && dragSourceViewRef !== this.viewRef) {
      this._viewPartService.swapViewTabs(dragSourceViewRef, this.viewRef).then(noop);
    }
  }

  public onClose(event: Event): void {
    event.stopPropagation(); // prevent tab activation
    this._viewPartService.destroyView(this.viewRef).then(noop);
  }

  /**
   * Returns 'true' if this viewtab is fully scrolled into the viewport.
   */
  public isVisibleInViewport(): boolean {
    return this._viewport.isElementInView(this._host, 'full');
  }

  /**
   * Scrolls this viewtab into the viewport if not fully visible in the viewport.
   */
  public scrollIntoViewport(): void {
    if (!this.isVisibleInViewport()) {
      return this._viewport.scrollIntoView(this._host);
    }
  }

  public get viewRef(): string {
    return this.view.viewRef;
  }
}
