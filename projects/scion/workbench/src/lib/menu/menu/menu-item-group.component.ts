import {ApplicationRef, Component, createComponent, effect, ElementRef, EnvironmentInjector, inject, Injector, input, inputBinding, untracked} from '@angular/core';
import {MMenuGroup} from '../ɵmenu';
import {MenuComponent} from './menu.component';

/**
 * Alias for {@link MenuComponent} with the name `sci-menu-item-group` instead of `sci-menu`.
 */
@Component({
  selector: 'sci-menu-item-group',
  template: '',
})
export class MenuItemGroupComponent {

  public readonly group = input.required<MMenuGroup>();
  public readonly hasGutterColumn = input.required<boolean>();
  public readonly disabled = input<boolean>();

  constructor() {
    const elementInjector = inject(Injector);
    const environmentInjector = inject(EnvironmentInjector);
    const hostElement = inject(ElementRef).nativeElement as HTMLElement;
    const applicationRef = inject(ApplicationRef);

    // Run as effect (single-shot) to read input properties.
    effect(onCleanup => untracked(() => {
      const componentRef = createComponent(MenuComponent, {
        elementInjector,
        environmentInjector,
        hostElement,
        bindings: [
          inputBinding('subMenuItem', this.group),
          inputBinding('withGutterColumn', this.hasGutterColumn),
          inputBinding('disabled', this.disabled),
        ],
      });

      // Register the newly created refto include it into change detection cycles.
      applicationRef.attachView(componentRef.hostView);
      componentRef.changeDetectorRef.detectChanges();

      // Destroy component when host is destroyed.
      onCleanup(() => componentRef.destroy());
    }));
  }
}
