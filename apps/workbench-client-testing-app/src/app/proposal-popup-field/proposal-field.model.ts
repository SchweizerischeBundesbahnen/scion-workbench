import {Directive, inject, TemplateRef} from '@angular/core';

@Directive({selector: 'ng-template[appProposalFieldContent]', standalone: true})
export class ProposalFieldContentDirective {

  public readonly template = inject(TemplateRef);
}

@Directive({selector: 'ng-template[appProposalFieldButton]', standalone: true})
export class ProposalFieldButtonDirective {

  public readonly template = inject(TemplateRef<void>);
}
