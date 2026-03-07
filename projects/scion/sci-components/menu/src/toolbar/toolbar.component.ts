import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, output, Signal, untracked, ViewContainerRef} from '@angular/core';
import {SciToolGroupComponent} from './toolbar-group.component';
import {SciMenuContextProvider} from '../menu-context-provider';
import {coerceSignal} from '../common/common';
import {coerceArray, coerceElement} from '@angular/cdk/coercion';
import {installMenuAccelerators} from '../menu-accelerators';
import {SciMenuService} from '../menu.service';

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

  public readonly name = input.required({transform: coerceNameArray});
  public readonly context = input<Map<string, unknown>>();
  public readonly acceleratorTarget = input<Element | ElementRef<Element>>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly toolbarMenuOpen = output<boolean>();
  public readonly toolbarEmpty = output<boolean>();

  private readonly menuService = inject(SciMenuService);

  protected readonly mergedContext = this.computeContext();
  protected readonly menuItems = computed(() => this.menuService.menuContributions(this.name(), this.mergedContext())());

  constructor() {
    this.installAccelerators();
  }

  protected onToolbarEmptyChange(empty: boolean): void {
    this.toolbarEmpty.emit(empty);
  }

  protected onMenuOpen(open: boolean): void {
    this.toolbarMenuOpen.emit(open);
  }

  protected computeContext(): Signal<Map<string, unknown>> {
    const environmentMenuContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());
    return computed(() => new Map([...environmentMenuContext?.() ?? new Map(), ...this.context() ?? new Map()]));
  }

  private installAccelerators(): void {
    const injector = inject(Injector);

    effect(onCleanup => {
      const name = this.name();
      const target = coerceElement(this.acceleratorTarget());
      const context = this.mergedContext();

      untracked(() => {
        const ref = installMenuAccelerators(name, {target, context, injector});
        onCleanup(() => ref.dispose());
      });
    });
  }
}

function coerceNameArray(name: `toolbar:${string}` | `toolbar:${string}`[]): `toolbar:${string}`[] {
  return coerceArray(name);
}
