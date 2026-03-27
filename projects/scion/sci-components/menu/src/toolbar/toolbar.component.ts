import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, Signal, untracked, ViewContainerRef} from '@angular/core';
import {SciToolGroupComponent} from './toolbar-group.component';
import {SciMenuContextProvider} from '../menu-context-provider';
import {coerceSignal} from '../common/common';
import {coerceElement} from '@angular/cdk/coercion';
import {installMenuAccelerators} from '../menu-accelerators';
import {ɵSciMenuService} from '../ɵmenu.service';

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
  public readonly acceleratorTarget = input<Element | ElementRef<Element>>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _context = this.computeContext();

  protected readonly menuItems = this._menuService.menuItems(this.name, this._context);

  constructor() {
    this.installAccelerators();
  }

  protected computeContext(): Signal<Map<string, unknown>> {
    const environmentContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());
    return computed(() => new Map([...environmentContext?.() ?? new Map(), ...this.context() ?? new Map()]));
  }

  private installAccelerators(): void {
    const injector = inject(Injector);

    effect(onCleanup => {
      const name = this.name();
      const target = coerceElement(this.acceleratorTarget());
      const context = this._context();

      untracked(() => {
        const ref = installMenuAccelerators(name, {target, context, injector});
        onCleanup(() => ref.dispose());
      });
    });
  }
}
