import {ApplicationRef, Component, createComponent, effect, ElementRef, EnvironmentInjector, inject, Injector, input, inputBinding, untracked} from '@angular/core';
import {MMenuGroup} from '../ɵmenu';
import {MenuComponent} from './menu.component';

/**
 * Creates a group.
 */
@Component({
  selector: 'wb-group',
  template: '',
})
export class GroupComponent {

  public readonly group = input.required<MMenuGroup>();
  public readonly hasGutterColumn = input.required<boolean>();

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
