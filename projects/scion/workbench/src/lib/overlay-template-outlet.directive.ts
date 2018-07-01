import { AfterViewInit, Directive, DoCheck, ElementRef, EmbeddedViewRef, Input, KeyValueDiffer, KeyValueDiffers, OnDestroy, Optional, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InternalWorkbenchView } from './workbench.model';
import { OverlayHostRef } from './overlay-host-ref.service';

/**
 * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`}, appends it
 * to a top-level workbench DOM element and aligns its boundaries to snap with this directive's host element.
 *
 * That way, the view appears as a child of this directive's host element, which is useful for iframes which
 * may not be moved in the DOM, or for popups to always be in the front.
 */
@Directive({
  selector: '[wbOverlayTemplateOutlet]',
  exportAs: 'wbOverlayTemplateOutlet'
})
export class OverlayTemplateOutletDirective implements AfterViewInit, DoCheck, OnDestroy {

  private _destroy$ = new Subject<void>();

  private _overlayHost: ViewContainerRef;

  private _host: Element;
  private _styleDiffer: KeyValueDiffer<string, string | number>;
  private _viewRef: EmbeddedViewRef<void>;

  public style: { [key: string]: string };

  @Input('wbOverlayTemplateOutlet') // tslint:disable-line:no-input-rename
  private templateRef: TemplateRef<void>;

  /**
   * Controls whether to insert the view at position 0.
   */
  @Input('wbOverlayTemplateOutletAppendFirst') // tslint:disable-line:no-input-rename
  private appendFirst: boolean;

  constructor(private _overlayHostRef: OverlayHostRef,
              @Optional() view: InternalWorkbenchView,
              host: ElementRef,
              differs: KeyValueDiffers,
              vcr: ViewContainerRef) {
    view && view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => active ? this.onActivateView() : this.onDeactivateView());

    this._overlayHost = this._overlayHostRef.get() || vcr;
    this.style = {'position': 'fixed'};
    this._styleDiffer = differs.find(this.style).create();
    this._host = host.nativeElement as Element;
  }

  private onActivateView(): void {
    this.style = {...this.style, display: 'block'};
    this.adjustViewBounds();
  }

  private onDeactivateView(): void {
    this.style = {...this.style, display: 'none'};
    this._viewRef && this._viewRef.detectChanges();
  }

  public ngAfterViewInit(): void {
    this._viewRef = this._overlayHost.createEmbeddedView(this.templateRef, null, this.appendFirst ? 0 : null);
    this._viewRef.detectChanges();
    this.adjustViewBounds();
  }

  public ngDoCheck(): void {
    this.adjustViewBounds();
  }

  public ngOnDestroy(): void {
    this._viewRef && this._viewRef.destroy();
    this._destroy$.next();
  }

  private adjustViewBounds(): void {
    if (!this._viewRef) {
      return;
    }

    // Position the iframe within this _view's bounding box.
    const {top, left, width, height} = this._host.getBoundingClientRect();
    const style = {
      ...this.style,
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`
    };

    // Performance optimization: set new style object only if its content changed
    if (this._styleDiffer.diff(style)) {
      this.style = style;
    }
  }

  /**
   * Returns the {ViewRef} of the template.
   */
  public get viewRef(): EmbeddedViewRef<void> {
    return this._viewRef;
  }
}
