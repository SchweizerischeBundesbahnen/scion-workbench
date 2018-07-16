/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { combineLatest, interval, merge, Subject } from 'rxjs';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { WB_REMOTE_URL_PARAM } from '../routing/routing-params.constants';
import { OverlayTemplateOutletDirective } from '../overlay-template-outlet.directive';

/**
 * Displays the content of a remote site in an iframe. WebComponents are not applicable yet, because not providing an isolated scripting context.
 *
 * This component can be used as a routing component, or as a child component, meaning that URL can be set via routing, matrix, data or input parameter.
 *
 * Usage as routing component:
 * ---
 * const routes: Routes = [
 *    {
 *      path: 'usatoday',
 *      component: RemoteSiteComponent,
 *      data: {[WB_REMOTE_URL_PARAM]: 'https://www.usatoday.com/', [WB_VIEW_TITLE_PARAM]: 'USA Today', [WB_VIEW_HEADING_PARAM]: 'usatoday.com'}
 *    }
 *  ];
 *
 * Usage as child component:
 * ---
 * <wb-remote-site [url]="'https://www.usatoday.com/'"></wb-remote-site>
 *
 *
 * ---
 * Note:
 *
 * The iframe is not rendered as a view child of this component, but added to a top-level workbench DOM element instead.
 * That way, the the iframe is not moved within the DOM when the workbench views are rearannged.
 * Otherwise, its content would be reloaded once the iframe is reparented.
 *
 * For that reason, the iframe is positioned absolutely and projected into the bounding box of this component.
 */
@Component({
  selector: 'wb-remote-site',
  templateUrl: './remote-site.component.html',
  styleUrls: ['./remote-site.component.scss']
})
export class RemoteSiteComponent implements AfterViewInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  @Input('url') // tslint:disable-line:no-input-rename
  public set remoteUrl(url: string) {
    this.url = this._sanitizer.bypassSecurityTrustResourceUrl(url);
    this.overlayOutlet && this.overlayOutlet.viewRef && this.overlayOutlet.viewRef.detectChanges();
  }

  /**
   * Emits location change of the remote site URL. Not allowed for cross-origin sites.
   */
  @Output()
  public urlChange = new EventEmitter<string>();

  @ViewChild('overlay_outlet')
  private overlayOutlet: OverlayTemplateOutletDirective;

  public url: SafeUrl;
  public pointerEvents: string;

  constructor(private _sanitizer: DomSanitizer,
              private _zone: NgZone,
              workbenchLayout: WorkbenchLayoutService,
              route: ActivatedRoute) {
    combineLatest(route.params, route.data)
      .pipe(takeUntil(this._destroy$))
      .subscribe(([params, data]) => {
        if (params[WB_REMOTE_URL_PARAM] || data[WB_REMOTE_URL_PARAM]) {
          this.remoteUrl = params[WB_REMOTE_URL_PARAM] || data[WB_REMOTE_URL_PARAM];
        }
      });

    // Suspend pointer events for the duration of a workbench layout change,
    // so that pointer events are not swallowed by the iframe.
    // Otherwise, view drag operation does not work as expected.
    merge(workbenchLayout.viewSashDrag$, workbenchLayout.viewTabDrag$, workbenchLayout.messageBoxMove$)
      .pipe(takeUntil(this._destroy$))
      .subscribe(event => this.pointerEvents = (event === 'start' ? 'none' : 'inherit'));
  }

  private installLocationChangeListener(rootNodes: any[]): void {
    // TODO Find solution without polling; MutationObserver not applicable because location is not an attribute; practicable way could be Histroy API
    this._zone.runOutsideAngular(() => {
      const iframeWindow = (rootNodes[0] as HTMLIFrameElement).contentWindow;
      interval(50)
        .pipe(
          filter(() => this.urlChange.observers.length > 0), // access location only upon first subscription to omit cross-origin failure
          map(() => iframeWindow.location.href),
          distinctUntilChanged(),
          takeUntil(this._destroy$))
        .subscribe((url: string) => {
          this._zone.run(() => this.urlChange.emit(url));
        });
    });
  }

  public ngAfterViewInit(): void {
    this.installLocationChangeListener(this.overlayOutlet.viewRef.rootNodes);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
