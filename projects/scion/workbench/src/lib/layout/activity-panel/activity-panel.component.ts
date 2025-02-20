import {Component, input} from '@angular/core';
import {SciSashDirective} from '@scion/components/sashbox';
import {ActivityPanelComponent} from '../../activity/activity-panel/activity-panel.component';
import {MActivityLayout} from '../../activity/workbench-activity.model';

@Component({
  selector: 'wb-activity-panel-1',
  imports: [
    SciSashDirective,
    ActivityPanelComponent,
  ],
  templateUrl: './activity-panel.component.html',
  styleUrl: './activity-panel.component.scss',
})
export class ActivityPanel1Component {

  public area = input.required<'left' | 'right' | 'bottom'>();
  public layout = input.required<MActivityLayout>();

}
