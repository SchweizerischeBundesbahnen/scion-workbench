import {Directive, effect, ElementRef, inject, input} from '@angular/core';

/**
 * Injects this directive's host element into specified item.
 */
@Directive({selector: '[appInjectElementRef]', standalone: true})
export class InjectElementRefDirective {

  public item = input.required<{element?: HTMLElement}>({alias: 'appInjectElementRef'});

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement;

    effect(() => {
      this.item().element = host;
    });
  }
}
