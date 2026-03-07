import {ApplicationRef, ChangeDetectionStrategy, Component, computed, createComponent, effect, ElementRef, EnvironmentInjector, inject, Injector, input, inputBinding, untracked} from '@angular/core';
import {MenuComponent} from './menu.component';
import {SciMenuGroupContribution} from '../menu-contribution.model';

/**
 * Alias for {@link MenuComponent} with the name `sci-menu-group` instead of `sci-menu`.
 */
@Component({
  selector: 'sci-menu-group',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemGroupComponent {

  public readonly group = input.required<SciMenuGroupContribution>();
  public readonly glyphArea = input.required<boolean>();
  public readonly disabled = input<boolean>();

  constructor() {
    const elementInjector = inject(Injector);
    const environmentInjector = inject(EnvironmentInjector);
    const hostElement = inject(ElementRef).nativeElement as HTMLElement;
    const applicationRef = inject(ApplicationRef);

    // Run as effect (single-shot) to read input properties.
    effect(onCleanup => untracked(() => {
      const collapsible = this.group().collapsible;
      const collapsed = collapsible ? collapsible.collapsed : false;
      const componentRef = createComponent(MenuComponent, {
        elementInjector,
        environmentInjector,
        hostElement,
        bindings: [
          inputBinding('menuItems', computed(() => this.group().children)),
          inputBinding('disabled', this.disabled),
          inputBinding('group', computed(() => ({
              label: this.group().label?.(),
              collapsible: !!collapsible,
              collapsed,
            })),
          ),
          inputBinding('glyphArea', this.glyphArea),
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
