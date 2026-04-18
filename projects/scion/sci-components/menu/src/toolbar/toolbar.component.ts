import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, Signal, untracked, ViewContainerRef} from '@angular/core';
import {SciToolGroupComponent} from './toolbar-group.component';
import {SciMenuContextProvider} from '../menu-context-provider';
import {installMenuAccelerators} from '../menu-accelerators';
import {ɵSciMenuService} from '../ɵmenu.service';
import {coerceSignal, MaybeArray} from '@scion/sci-components/common';
import {Objects} from '@scion/toolkit/util';

/**
 * TODO [menu]: Explain how to size the toolbar. (height can be set; icon size by setting a CSS variable)
 */
@Component({
  selector: 'sci-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciToolGroupComponent,
  ],
})
export class SciToolbarComponent {

  public readonly name = input.required<`toolbar:${string}`>();
  public readonly context = input<Map<string, unknown>>();
  public readonly acceleratorTarget = input<MaybeArray<Element | ElementRef<Element>> | undefined>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _context = this.computeContext();

  protected readonly menuItems = this._menuService.menuItems(this.name, this._context);

  constructor() {
    this.installAccelerators();
  }

  private computeContext(): Signal<Map<string, unknown>> {
    const environmentContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideMenuContext());
    return computed(() => new Map([...environmentContext?.() ?? new Map(), ...this.context() ?? new Map()]), {equal: Objects.isEqual});
  }

  private installAccelerators(): void {
    const injector = inject(Injector);

    // TODO [menu] Do we have to use a root effect? Was the case in previous implementation
    // // Use root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    // rootEffect(onCleanup => {

    effect(onCleanup => {
      const name = this.name();
      const target = this.acceleratorTarget();
      const context = this._context();

      untracked(() => {
        const ref = installMenuAccelerators(name, {target, context, injector});
        onCleanup(() => ref.dispose());
      });
    });
  }
}
