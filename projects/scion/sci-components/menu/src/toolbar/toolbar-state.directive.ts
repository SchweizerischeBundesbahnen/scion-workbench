import {DestroyRef, Directive, inject, signal} from '@angular/core';
import {SciToolGroupComponent} from './toolbar-group.component';

@Directive({
  selector: '[sciToolbarState]',
  host: {
    '[class.open]': 'open()',
  },
})
export class ToolbarStateDirective {

  protected readonly open = signal(false);

  constructor() {
    this.installOpenListener();
  }

  private installOpenListener(): void {
    const toolbar = inject(SciToolGroupComponent);
    const ref = toolbar.menuOpen.subscribe(open => this.open.set(open));
    inject(DestroyRef).onDestroy(() => ref.unsubscribe());
  }
}
