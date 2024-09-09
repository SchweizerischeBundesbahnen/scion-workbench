import {Component, input, TemplateRef} from '@angular/core';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
  standalone: true,
  imports: [
    SciMaterialIconDirective,
    NgTemplateOutlet,
  ],
})
export class ProposalComponent<T> {

  public item = input.required<T>();
  public selected = input.required<boolean>();
  public template = input<TemplateRef<unknown> | undefined>();
}
