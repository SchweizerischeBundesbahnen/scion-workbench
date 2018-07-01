import { Directive, HostBinding, HostListener, Input, OnChanges, Optional, SimpleChanges } from '@angular/core';
import { WorkbenchView } from '../workbench.model';
import { WbNavigationExtras, WorkbenchRouter } from './workbench-router.service';
import { noop } from 'rxjs';
import { LocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { WorkbenchService } from '../workbench.service';

/**
 * Like 'RouterLink' but with functionality to target a view outlet.
 */
@Directive({selector: ':not(a)[wbRouterLink]'})
export class WbRouterLinkDirective {

  protected _commands: any[] = [];
  protected _extras: WbNavigationExtras = {};

  @Input()
  public set wbRouterLink(commands: any[] | string) {
    this._commands = (commands ? (Array.isArray(commands) ? commands : commands.split('/').filter(Boolean)) : []);
  }

  @Input('wbRouterLinkExtras') // tslint:disable-line:no-input-rename
  public set extras(extras: WbNavigationExtras) {
    this._extras = extras || {};
  }

  constructor(private _workbenchRouter: WorkbenchRouter,
              private _workbench: WorkbenchService,
              @Optional() private _view: WorkbenchView) {
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey'])
  public onClick(button: number, ctrlKey: boolean): boolean {
    if (button !== 0) { // not main button pressed
      return true;
    }

    const extras = this.createNavigationExtras(ctrlKey);
    this._workbenchRouter.navigate(this._commands, extras).then(noop);
    return false;
  }

  protected createNavigationExtras(ctrlKey: boolean = false): WbNavigationExtras {
    const currentViewRef = this._view && this._view.viewRef;
    const currentViewPartRef = currentViewRef && this._workbench.resolveContainingViewPartServiceElseThrow(this._view.viewRef).viewPartRef;

    return {
      ...this._extras,
      target: this._extras.target || (this._view && !ctrlKey ? 'self' : 'blank'),
      selfViewRef: this._extras.selfViewRef || currentViewRef,
      blankViewPartRef: this._extras.blankViewPartRef || currentViewPartRef,
    };
  }
}

@Directive({selector: 'a[wbRouterLink]'})
export class WbRouterLinkWithHrefDirective extends WbRouterLinkDirective implements OnChanges {

  @HostBinding('href')
  public href: string;

  constructor(private _router: Router,
              private _locationStrategy: LocationStrategy,
              workbenchRouter: WorkbenchRouter,
              workbench: WorkbenchService,
              @Optional() view: WorkbenchView) {
    super(workbenchRouter, workbench, view);
  }

  private updateTargetUrlAndHref(): void {
    this.href = this._locationStrategy.prepareExternalUrl(this._router.serializeUrl(this._router.createUrlTree(this._commands, this.createNavigationExtras())));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.updateTargetUrlAndHref();
  }
}
