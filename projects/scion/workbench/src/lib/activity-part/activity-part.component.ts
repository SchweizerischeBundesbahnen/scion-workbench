/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style, transition, trigger } from '@angular/animations';
import { WorkbenchActivityPartService } from './workbench-activity-part.service';
import { WorkbenchLayoutService } from '../layout/workbench-layout.service';
import { noop, Observable, Subject } from 'rxjs';
import { ACTIVITY_OUTLET_NAME, ROUTER_OUTLET_NAME } from '../workbench.constants';
import { Activity } from './activity';

/**
 * Specifies the minimal panel width. If smaller, it is expanded to this value
 */
const PANEL_MIN_WIDTH = 200;
/**
 * Specifies the initial panel width if starting the application.
 */
const PANEL_INITIAL_WIDTH = 500;

@Component({
  selector: 'wb-activity-part',
  templateUrl: './activity-part.component.html',
  styleUrls: ['./activity-part.component.scss'],
  animations: [
    trigger(
      'panel-enter-or-leave', [
        transition(':enter', [
          style({width: '0'}),
          animate('75ms ease-out', style({width: '*'})),
        ]),
        transition(':leave', [
          style({width: '*'}),
          animate('75ms ease-out', style({width: 0})),
        ]),
      ],
    ),
  ],
  viewProviders: [
    {provide: ROUTER_OUTLET_NAME, useValue: ACTIVITY_OUTLET_NAME},
  ],
})
export class ActivityPartComponent {

  private _panelWidth = PANEL_INITIAL_WIDTH;
  private _panelWidth$ = new Subject<number>();

  @ViewChild('viewport')
  public viewport: ElementRef;

  @ViewChild('panel', {read: ElementRef})
  private _panelElementRef: ElementRef;

  constructor(public host: ElementRef<HTMLElement>,
              public activityPartService: WorkbenchActivityPartService,
              private _workbenchLayout: WorkbenchLayoutService,
              private _animationBuilder: AnimationBuilder,
              private _cd: ChangeDetectorRef) {
  }

  public get activities(): Activity[] {
    return this.activityPartService.activities.filter(it => it.visible);
  }

  public get activeActivity(): Activity {
    const activeActivity = this.activityPartService.activeActivity;
    return activeActivity && activeActivity.visible ? activeActivity : null;
  }

  public set panelWidth(panelWidth: number) {
    this._panelWidth = panelWidth;
    this._panelWidth$.next(panelWidth);
  }

  public get panelWidth(): number {
    return this._panelWidth;
  }

  public get panelWidth$(): Observable<number> {
    return this._panelWidth$;
  }

  public onActivate(activity: Activity): false {
    this.activityPartService.activateActivity(activity).then(noop);
    return false; // prevent UA to follow 'href'
  }

  public onSashStart(): void {
    this._workbenchLayout.notifyDragStarting();
  }

  public onSash(deltaX: number): void {
    this.panelWidth += deltaX;
  }

  public onSashEnd(): void {
    this._workbenchLayout.notifyDragEnding();
    this.ensureMinimalPanelWidth();
  }

  public onSashReset(): void {
    this.panelWidth = PANEL_INITIAL_WIDTH;
  }

  public onPanelAnimationDone(): void {
    this._cd.detectChanges();
  }

  private ensureMinimalPanelWidth(): void {
    if (this.panelWidth >= PANEL_MIN_WIDTH) {
      return;
    }

    const animation = this._animationBuilder.build([
      style({width: '*'}),
      animate('75ms ease-out', style({width: `${PANEL_MIN_WIDTH}px`})),
    ]).create(this._panelElementRef.nativeElement);
    animation.onDone(() => this.panelWidth = PANEL_MIN_WIDTH);
    ActivityPartComponent.once(animation);
  }

  /**
   * Plays the animation and destroys it upon completion.
   */
  private static once(animation: AnimationPlayer): void {
    animation.onDone(() => animation.destroy());
    animation.play();
  }
}
