import {computed, Directive, ElementRef, inject, input} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {SciMenu, SciMenuGroup, SciMenuItem} from '../menu.model';

@Directive({
  selector: '[sciMenuItemState]',
  exportAs: 'sciMenuItemState',
})
export class MenuItemStateDirective {

  public readonly menuItem = input.required<SciMenuItem | SciMenu | SciMenuGroup>();
  public readonly host = inject(ElementRef).nativeElement as HTMLButtonElement;

  public readonly labelText = computed<string | undefined>(() => {
    const label = this.menuItem().label?.();
    if (typeof label === 'string') {
      return label;
    }
    return undefined;
  });

  public readonly labelComponent = computed<ComponentType<unknown> | undefined>(() => {
    const label = this.menuItem().label?.();
    if (typeof label === 'function') {
      return label;
    }
    return undefined;
  });
}
