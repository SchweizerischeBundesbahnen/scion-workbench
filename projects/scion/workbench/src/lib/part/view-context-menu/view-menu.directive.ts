import {Directive, EventEmitter, Input, OnDestroy, Optional, Output, TemplateRef} from '@angular/core';
import {Disposable} from '../../common/disposable';
import {WorkbenchMenuItem} from '../../workbench.model';
import {WorkbenchService} from '../../workbench.service';
import {TemplatePortal} from '@angular/cdk/portal';
import {WorkbenchView} from '../../view/workbench-view.model';

/**
 * Use this directive to model a menu item added to the context menu of a view.
 *
 * The host element of this modeling directive must be a <ng-template>.
 * A menu item shares the lifecycle of the host element.
 *
 * This directive is scope aware, that is, if in the context of a view, the menu item is added to the containing view.
 * To add a menu item to every view, model it in `app.component.html` or registered it via {@link WorkbenchService#registerViewMenuItem}.
 *
 * The {@link WorkbenchView} will be available in the menu item template as default template-local variable.
 *
 * ---
 * Usage:
 *
 * <ng-template wbViewMenuItem [accelerator]="['ctrl', 'b']" (action)="..." let-view>
 *   ...
 * </ng-template>
 */
@Directive({selector: 'ng-template[wbViewMenuItem]', standalone: true})
export class WorkbenchViewMenuItemDirective implements OnDestroy {

  private _menuItemHandle: Disposable;

  /**
   * Allows the user to interact with the menu item using keys on the keyboard, e.g., ['ctrl', 'alt', 1].
   *
   * Supported modifiers are 'ctrl', 'shift', 'alt' and 'meta'.
   */
  @Input()
  public accelerator?: string[] | undefined;

  /**
   * Allows grouping menu items of the same group.
   */
  @Input()
  public group?: string | undefined;

  /**
   * Allows disabling the menu item based on a condition.
   */
  @Input()
  public disabled = false;

  /**
   * Specifies CSS class(es) to be added to the menu item, useful in end-to-end tests for locating the menu item.
   */
  @Input()
  public cssClass?: string | string[] | undefined;

  /**
   * Emits when the user performs the menu action, either by clicking the menu or via keyboard accelerator, if any.
   */
  @Output()
  public action = new EventEmitter<WorkbenchView>();

  constructor(private _template: TemplateRef<void>,
              private _workbenchService: WorkbenchService,
              @Optional() private _view: WorkbenchView) {
    if (this._view) {
      this._menuItemHandle = this._view.registerMenuItem(this.createMenuItem(this._view));
    }
    else {
      this._menuItemHandle = this._workbenchService.registerViewMenuItem((view: WorkbenchView): WorkbenchMenuItem => this.createMenuItem(view));
    }
  }

  private createMenuItem(view: WorkbenchView): WorkbenchMenuItem {
    return ({
      portal: new TemplatePortal<any>(this._template, null!, {$implicit: view}),
      accelerator: this.accelerator,
      group: this.group,
      cssClass: this.cssClass,
      isDisabled: (): boolean => this.disabled,
      onAction: (): void => this.action.emit(view),
    });
  }

  public ngOnDestroy(): void {
    this._menuItemHandle.dispose();
  }
}
