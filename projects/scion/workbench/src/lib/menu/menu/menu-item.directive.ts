import {computed, Directive, input, isSignal} from '@angular/core';
import {MMenuItem} from '../ɵmenu';

@Directive({
  selector: '[wbMenuItem]',
  exportAs: 'wbMenuItem',
})
export class MenuItemDirective {

  public readonly menuItem = input.required<MMenuItem>();
  public readonly checked = computed(() => {
    const checked = this.menuItem().checked?.();
    return isSignal(checked) ? checked() : checked;
  });
}
