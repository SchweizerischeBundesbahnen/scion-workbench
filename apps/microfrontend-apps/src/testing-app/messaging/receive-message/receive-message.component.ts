import { Component, OnDestroy } from '@angular/core';
import { Beans, IntentMessage, MessageClient, Qualifier, TopicMessage } from '@scion/microfrontend-platform';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, finalize, startWith, takeUntil } from 'rxjs/operators';
import { SciParamsEnterComponent } from '@scion/ɵtoolkit/widgets';

export const MESSAGING_MODEL = 'messaging-model';
export const DESTINATION = 'destination';
export const TOPIC = 'topic';
export const TYPE = 'type';
export const QUALIFIER = 'qualifier';

enum MessagingModel {
  Topic = 'Topic', Intent = 'Intent',
}

@Component({
  selector: 'app-receive-message',
  templateUrl: './receive-message.component.html',
  styleUrls: ['./receive-message.component.scss'],
})
export class ReceiveMessageComponent implements OnDestroy {

  public MESSAGING_MODEL = MESSAGING_MODEL;
  public DESTINATION = DESTINATION;
  public TOPIC = TOPIC;
  public TYPE = TYPE;
  public QUALIFIER = QUALIFIER;

  private _destroy$ = new Subject<void>();
  private _messageClient: MessageClient;
  private _subscription: Subscription;

  public form: FormGroup;
  public messages: (TopicMessage | IntentMessage)[] = [];
  public MessagingModel = MessagingModel;

  constructor(private _formBuilder: FormBuilder) {
    this._messageClient = Beans.get(MessageClient);

    this.form = this._formBuilder.group({
      [MESSAGING_MODEL]: new FormControl(MessagingModel.Topic, Validators.required),
      [DESTINATION]: this.createTopicDestinationFormGroup(),
    });

    this.form.get(MESSAGING_MODEL).valueChanges
      .pipe(
        startWith(this.form.get(MESSAGING_MODEL).value as MessagingModel),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe((model: string) => {
        this.onMessagingModelChange(MessagingModel[model]);
      });
  }

  private onMessagingModelChange(model: MessagingModel): void {
    if (model === MessagingModel.Topic) {
      this.form.setControl(DESTINATION, this.createTopicDestinationFormGroup());
    }
    else {
      this.form.setControl(DESTINATION, this.createIntentDestinationFormGroup());
    }
  }

  public onSubscribe(): void {
    this.isTopicModel() ? this.subscribeTopic() : this.subscribeIntent();
    this.form.disable();
  }

  private subscribeTopic(): void {
    this._subscription = this._messageClient.observe$(this.form.get(DESTINATION).get(TOPIC).value)
      .pipe(finalize(() => this.form.enable()))
      .subscribe(message => this.messages.push(message));
  }

  private subscribeIntent(): void {
    const type: string = this.form.get(DESTINATION).get(TYPE).value;
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(DESTINATION).get(QUALIFIER) as FormArray);

    this._subscription = this._messageClient.handleIntent$({type, qualifier})
      .pipe(finalize(() => this.form.enable()))
      .subscribe(message => this.messages.push(message));
  }

  public onUnsubscribe(): void {
    this.unsubscribe();
  }

  public onClear(): void {
    this.messages.length = 0;
  }

  public onReply(replyTo: string): void {
    this._messageClient.publish$(replyTo, 'this is a reply').subscribe();
  }

  public get isSubscribed(): boolean {
    return this._subscription && !this._subscription.closed;
  }

  public isTopicModel(): boolean {
    return this.form.get(MESSAGING_MODEL).value === MessagingModel.Topic;
  }

  private createIntentDestinationFormGroup(): FormGroup {
    return this._formBuilder.group({
      [TYPE]: this._formBuilder.control(''),
      [QUALIFIER]: this._formBuilder.array([]),
    });
  }

  private createTopicDestinationFormGroup(): FormGroup {
    return this._formBuilder.group({
      [TOPIC]: new FormControl('', Validators.required),
    });
  }

  private unsubscribe(): void {
    this._subscription && this._subscription.unsubscribe();
    this._subscription = null;
    this.messages.length = 0;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this.unsubscribe();
  }
}
