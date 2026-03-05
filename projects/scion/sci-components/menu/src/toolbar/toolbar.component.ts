import {ChangeDetectionStrategy, Component, computed, inject, input, output, Signal, ViewContainerRef} from '@angular/core';
import {SciToolGroupComponent} from './toolbar-group.component';
import {SciMenuContextProvider} from '../menu-context-provider';
import {coerceSignal} from '../common/common';
import {coerceArray} from '@angular/cdk/coercion';

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
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly toolbarMenuOpen = output<boolean>();
  public readonly toolbarEmpty = output<boolean>();

  protected readonly mergedContext = this.computeContext();

  protected onToolbarEmptyChange(empty: boolean): void {
    this.toolbarEmpty.emit(empty);
  }

  protected onMenuOpen(open: boolean): void {
    this.toolbarMenuOpen.emit(open);
  }

  protected computeContext(): Signal<Map<string, unknown>> {
    const environmentMenuContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext());
    return computed(() => new Map([...environmentMenuContext?.() ?? new Map(), ...this.context() ?? new Map()]));
  }
}

function coerceNameArray(name: `toolbar:${string}` | `toolbar:${string}`[]): `toolbar:${string}`[] {
  return coerceArray(name);
}
