import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Beans, ClientConfig, Intent, MessageClient, TopicMessage } from '@scion/microfrontend-platform';
import { SciParamsEnterComponent } from '@scion/app/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  private _symbolicAppName: string;

  public form: FormGroup;
  public intents$: Observable<Intent[]>;

  constructor(fb: FormBuilder) {
    this._symbolicAppName = Beans.get(ClientConfig).symbolicName;
    this.form = fb.group({
      [TYPE]: new FormControl('', Validators.required),
      [QUALIFIER]: fb.array([]),
    });

    this.intents$ = Beans.get(MessageClient).request$(Topics.Intents, this._symbolicAppName)
      .pipe(map((message: TopicMessage<Intent[]>) => message.payload));
  }

  public onIntentRegister(): void {
    const command: IntentRegisterCommand = {
      symbolicAppName: this._symbolicAppName,
      intent: {
        type: this.form.get(TYPE).value,
        qualifier: SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray),
      },
    };
    Beans.get(MessageClient).publish$(Topics.RegisterIntent, command).subscribe();
  }

  public onIntentUnregister(intent: Intent): void {
    const command: IntentUnregisterCommand = {
      symbolicAppName: this._symbolicAppName,
      intentId: intent.metadata.id,
    };
    Beans.get(MessageClient).publish$(Topics.UnregisterIntent, command).subscribe();
  }
}
