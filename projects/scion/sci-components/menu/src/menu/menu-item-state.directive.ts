import {computed, Directive, ElementRef, inject, input, Signal} from '@angular/core';
import {MMenuItem, MSubMenuItem} from '../ɵmenu';
import {ComponentType} from '@angular/cdk/portal';
import {dimension, SciDimension} from '@scion/components/dimension';

@Directive({
  selector: '[sciMenuItemState]',
  exportAs: 'sciMenuItemState',
})
export class MenuItemStateDirective {

  public readonly menuItem = input.required<MMenuItem | MSubMenuItem>();
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

  public readonly bounds: Signal<SciDimension> = dimension(inject(ElementRef));
}
