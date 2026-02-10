import {DestroyRef, Directive, inject, signal} from '@angular/core';
import {SciToolbarComponent} from '@scion/workbench';

@Directive({
  selector: '[sciToolbarState]',
  host: {
    '[class.open]': 'open()',
    '[class.empty]': 'empty()',
  },
})
export class ToolbarStateDirective {

  protected readonly open = signal(false);
  protected readonly empty = signal(true);

  constructor() {
    this.installOpenListener();
    this.installEmptyListener();
  }

  private installOpenListener(): void {
    const toolbar = inject(SciToolbarComponent);
    const ref = toolbar.toolbarMenuOpen.subscribe(open => this.open.set(open));
    inject(DestroyRef).onDestroy(() => ref.unsubscribe());
  }

  private installEmptyListener(): void {
    const toolbar = inject(SciToolbarComponent);
    const ref = toolbar.toolbarEmpty.subscribe(empty => this.empty.set(empty));
    inject(DestroyRef).onDestroy(() => ref.unsubscribe());
  }
}
