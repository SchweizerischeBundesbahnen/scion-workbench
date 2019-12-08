import { Component, OnDestroy } from '@angular/core';
import { Beans, MessageClient, Qualifier, TopicMessage } from '@scion/microfrontend-platform';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { noop, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, finalize, startWith, takeUntil } from 'rxjs/operators';
import { SciParamsEnterComponent } from '@scion/ɵtoolkit/widgets';

export const MESSAGING_MODEL = 'messaging-model';
export const DESTINATION = 'destination';
export const TOPIC = 'topic';
export const TYPE = 'type';
export const QUALIFIER = 'qualifier';
export const MESSAGE = 'message';
export const REQUEST_REPLY = 'request-reply';
export const RETAIN = 'retain';

enum MessagingModel {
  Topic = 'Topic', Intent = 'Intent',
}

@Component({
  selector: 'app-publish-message',
  templateUrl: './publish-message.component.html',
  styleUrls: ['./publish-message.component.scss'],
})
export class PublishMessageComponent implements OnDestroy {

  public MESSAGING_MODEL = MESSAGING_MODEL;
  public DESTINATION = DESTINATION;
  public TOPIC = TOPIC;
  public TYPE = TYPE;
  public QUALIFIER = QUALIFIER;
  public MESSAGE = MESSAGE;
  public REQUEST_REPLY = REQUEST_REPLY;
  public RETAIN = RETAIN;

  private _destroy$ = new Subject<void>();
  private _messageClient: MessageClient;
  private _subscription: Subscription;

  public form: FormGroup;
  public replies: TopicMessage[] = [];
  public MessagingModel = MessagingModel;
  public publishError: string;

  constructor(private _formBuilder: FormBuilder) {
    this._messageClient = Beans.get(MessageClient);

    this.form = this._formBuilder.group({
      [MESSAGING_MODEL]: new FormControl(MessagingModel.Topic, Validators.required),
      [DESTINATION]: this.createTopicDestinationFormGroup(),
      [MESSAGE]: new FormControl(''),
      [REQUEST_REPLY]: new FormControl(false),
      [RETAIN]: new FormControl(false),
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

  public onPublish(): void {
    this.isTopicMessaging() ? this.publishMessageToTopic() : this.issueIntent();
  }

  public isTopicMessaging(): boolean {
    return this.form.get(MESSAGING_MODEL).value === MessagingModel.Topic;
  }

  public isRequestReply(): boolean {
    return this.form.get(REQUEST_REPLY).value;
  }

  public onClear(): void {
    this.replies.length = 0;
  }

  public onCancelPublish(): void {
    this.unsubscribe();
  }

  public get isSubscribed(): boolean {
    return this._subscription && !this._subscription.closed;
  }

  private unsubscribe(): void {
    this._subscription && this._subscription.unsubscribe();
    this._subscription = null;
    this.replies.length = 0;
  }

  private createIntentDestinationFormGroup(): FormGroup {
    return this._formBuilder.group({
      [TYPE]: this._formBuilder.control('', Validators.required),
      [QUALIFIER]: this._formBuilder.array([]),
    });
  }

  private createTopicDestinationFormGroup(): FormGroup {
    return this._formBuilder.group({
      [TOPIC]: new FormControl('', Validators.required),
    });
  }

  private publishMessageToTopic(): void {
    const topic = this.form.get(DESTINATION).get(TOPIC).value;
    const message = this.form.get(MESSAGE).value === '' ? undefined : this.form.get(MESSAGE).value;
    const requestReply = this.form.get(REQUEST_REPLY).value;

    this.form.disable();
    this.publishError = null;

    if (requestReply) {
      this._subscription = this._messageClient.request$(topic, message)
        .pipe(finalize(() => this.form.enable()))
        .subscribe(
          reply => this.replies.push(reply),
          error => this.publishError = error,
        );
    }
    else {
      this._subscription = this._messageClient.publish$(topic, message, {retain: this.form.get(RETAIN).value})
        .pipe(finalize(() => this.form.enable()))
        .subscribe(
          noop,
          error => this.publishError = error,
        );
    }
  }

  private issueIntent(): void {
    const type: string = this.form.get(DESTINATION).get(TYPE).value;
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(DESTINATION).get(QUALIFIER) as FormArray);

    const message = this.form.get(MESSAGE).value === '' ? undefined : this.form.get(MESSAGE).value;
    const requestReply = this.form.get(REQUEST_REPLY).value;
    this.form.disable();
    this.publishError = null;

    if (requestReply) {
      this._subscription = this._messageClient.requestByIntent$({type, qualifier}, message)
        .pipe(finalize(() => this.form.enable()))
        .subscribe(
          reply => this.replies.push(reply),
          error => this.publishError = error,
        );
    }
    else {
      this._subscription = this._messageClient.issueIntent$({type, qualifier}, message)
        .pipe(finalize(() => this.form.enable()))
        .subscribe(
          noop,
          error => this.publishError = error,
        );
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this.unsubscribe();
  }
}
