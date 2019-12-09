import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Beans, Intent, mapToBody, MessageClient } from '@scion/microfrontend-platform';
import { SciParamsEnterComponent } from '@scion/app/common';
import { Observable } from 'rxjs';
import { IntentRegisterCommand, IntentUnregisterCommand, Topics } from '../../microfrontend-api';

const TYPE = 'type';
const QUALIFIER = 'qualifier';

@Component({
  selector: 'app-manage-intents',
  templateUrl: './manage-intents.component.html',
  styleUrls: ['./manage-intents.component.scss'],
})
export class ManageIntentsComponent {

  public readonly TYPE = TYPE;
  public readonly QUALIFIER = QUALIFIER;

  public form: FormGroup;
  public intents$: Observable<Intent[]>;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      [TYPE]: new FormControl('', Validators.required),
      [QUALIFIER]: fb.array([]),
    });

    this.intents$ = Beans.get(MessageClient).request$<Intent[]>(Topics.Intents).pipe(mapToBody());
  }

  public onIntentRegister(): void {
    const command: IntentRegisterCommand = {
      intent: {
        type: this.form.get(TYPE).value,
        qualifier: SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray),
      },
    };
    Beans.get(MessageClient).publish$(Topics.RegisterIntent, command).subscribe();
  }

  public onIntentUnregister(intent: Intent): void {
    const command: IntentUnregisterCommand = {intentId: intent.metadata.id};
    Beans.get(MessageClient).publish$(Topics.UnregisterIntent, command).subscribe();
  }
}
