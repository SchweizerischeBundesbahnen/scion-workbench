import { AfterViewInit, Component, HostBinding, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { FullScreenModeService } from './full-screen-mode.service';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { InternalWorkbenchView } from '../workbench.model';

@Component({
  selector: 'wb-full-screen-mode',
  templateUrl: './full-screen-mode.component.html',
  styleUrls: ['./full-screen-mode.component.scss']
})
export class FullScreenModeComponent implements AfterViewInit {

  @ViewChild('fullScreenContent', {read: ViewContainerRef})
  private _viewContainerRef: ViewContainerRef;

  public viewTabsReduced = false;

  @HostBinding('class.full-screen-mode')
  public get fullScreenMode(): boolean {
    return this._fullScreenMode.active;
  }

  constructor(private _fullScreenMode: FullScreenModeService,
              private _worbenchViewRegistry: WorkbenchViewRegistry) {
  }

  @HostListener('keydown.escape')
  public onEscape(): void {
    this.leaveFullScreenMode();
  }

  public ngAfterViewInit(): void {
    this._fullScreenMode.setViewContainerRef(this._viewContainerRef);
  }

  public changeView(view: InternalWorkbenchView): void {
    this._fullScreenMode.updateView(view);
  }

  public get views(): InternalWorkbenchView[] {
    return this._worbenchViewRegistry.all;
  }

  public isActive(view: InternalWorkbenchView): boolean {
    return this._fullScreenMode.isViewActive(view.viewRef);
  }

  public leaveFullScreenMode(): void {
    this._fullScreenMode.leave();
  }

  public toggleReduced(): void {
    this.viewTabsReduced = !this.viewTabsReduced;
  }
}
