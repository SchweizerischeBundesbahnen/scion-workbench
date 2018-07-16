![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview](/README.md) | [Demo](https://blog.sbb.technology/scion-workbench-demo/#/(view.6:heatmap//view.5:person/79//view.4:person/39//view.3:person/15//view.2:person/38//view.1:person/66//activity:person-list)?viewgrid=eyJpZCI6MSwic2FzaDEiOlsidmlld3BhcnQuMSIsInZpZXcuMSIsInZpZXcuMiIsInZpZXcuMSJdLCJzYXNoMiI6eyJpZCI6Miwic2FzaDEiOlsidmlld3BhcnQuMiIsInZpZXcuMyIsInZpZXcuMyJdLCJzYXNoMiI6eyJpZCI6Mywic2FzaDEiOlsidmlld3BhcnQuNCIsInZpZXcuNiIsInZpZXcuNiJdLCJzYXNoMiI6WyJ2aWV3cGFydC4zIiwidmlldy40Iiwidmlldy40Iiwidmlldy41Il0sInNwbGl0dGVyIjowLjQ4NTk2MTEyMzExMDE1MTEsImhzcGxpdCI6ZmFsc2V9LCJzcGxpdHRlciI6MC41NTk0MjQzMjY4MzM3OTc1LCJoc3BsaXQiOnRydWV9LCJzcGxpdHRlciI6MC4zMjI2Mjc3MzcyMjYyNzczLCJoc3BsaXQiOmZhbHNlfQ%3D%3D) | [Getting Started](/resources/site/getting-started.md) | [How To](/resources/site/how-to.md) | [Contributing](/resources/site/contributing.md) | [Sponsoring](/resources/site/sponsors.md)
|---|---|---|---|---|---|


# How To

This section contains some guidance how to accomplish some common tasks.

***

[How to add an activity](#how-to-add-an-activity)\
[How to add an action to an activity](#how-to-add-an-action-to-an-activity)\
[How to open a view](#how-to-open-a-view)\
[How to control in which view to open a component](#how-to-control-in-which-view-to-open-a-component)\
[How to set a title of a view tab](#how-to-set-a-title-of-a-view-tab)\
[How to prevent a view from being closed](#how-to-prevent-a-view-from-being-closed)\
[How to set an icon for an activity](#how-to-set-an-icon-for-an-activity)\
[How to pop up a message box](#how-to-pop-up-a-message-box)\
[How to show a notification](#how-to-show-a-notification)\
[How to integrate a micro frontend](#how-to-integrate-a-micro-frontend)

***

## How to add an activity
Activities are modelled in `app.component.html` as content children of `<wb-workbench>` in the form of `<wb-activity>` elements. They are displayed in the activity panel to the left of the workbench frame. When activated, the component registered under the specified router link is opened. An activity can either be opened in the activity panel (which is by default), or be a link to open a view. Use `target` property to control this behavior.

Do not forget to register the route used as `routerLink` path.

The following snippet illustrates how to open the component in the activity panel.

```html
<wb-workbench>
  <wb-activity title="Persons"
               label="group"
               cssClass="material-icons"
               routerLink="persons">
  </wb-activity>
</wb-workbench>
```

The following snippet illustrates how to open the component as a view.

```html
<wb-workbench>
  <wb-activity title="Persons"
               label="group"
               cssClass="material-icons"
               routerLink="persons"
               target="view">
  </wb-activity>
</wb-workbench>
```

## How to add an action to an activity
Actions can be associated with an activity when being displayed in the activity panel. To register an action, go to the activity component template and model the action as a view child in the form of a `<ng-template>` decorated with `wbActivityAction` directive. The content of `ng-template` is then used to display the action.

The following snippet registers a Material-styled button as activity action. It is embedded in a `ng-template` decorated with `wbActivityAction` directive. When clicked, a view opens to create a new person.

```html 
<ng-template wbActivityAction>
    <button [wbRouterLink]="['person', 'new']" mat-icon-button title="Create person">
        <mat-icon>add</mat-icon>
    </button>
</ng-template>
```

## How to open a view
Views are opened via Angular routing mechanism.\
Use `wbRouterLink` directive or  `WorkbenchRouter` service for view-based navigation.

To open a component in a view, it has to be registered as a route in your routing module. Then, create a navigational element like HTML anchor element, decorate it with `wbRouterLink` directive and specify the path to the component.

```html
<a [wbRouterLink]="['persons', person.id]">Open person</a>
```

Alternatively, navigation can also be done in the component class. For that, inject `WorkbenchRouter` and use its `navigate` method.

```javascript
constructor(private wbRouter: WorkbenchRouter) {
}

public openPerson(id: string): void {
this.wbRouter.navigate(['persons', id]);
}
```

> Technically, a view is represented by its separate router outlet in the application URL, and with the outlet path specifying which component to display. That said, a view is simply a container to display any component. By changing the outlet path of a view, you can control which component to display.
>\
>\
> `WorkbenchRouter` and  `wbRouterLink` both navigate based on the provided array of commands, and is like Angular 'Router.navigate(...)', but with a workbench view as the routing target.

## How to control in which view to open a component
When navigating to a component, by default, it is first checked if it is already opened in a view. If not opened yet, depending on the 'target' strategy, the content of the current view is replaced, or a new view tab opened otherwise.

View activation is based on the routing path, meaning that if a view with a matching path is already opened, that view is activated. To never activate an already opened view, use `WbNavigationExtras` and set `tryActivateView` to `false`.

```html
<a [wbRouterLink]="['persons', person.id]" [wbRouterLinkExtras]="{tryActivateView: false}">Open person</a>
```

```javascript
wbRouter.navigate(['persons', id], {tryActivateView: false});
```

With target strategy, you control whether to replace the content of an existing view, or to open a component  in a new view tab. If using `wbRouterLink` and in the context of a view, by default, the current view content is replaced, unless CTRL keystroke is pressed. However, this behavior can be overwritten via navigation extras, by setting `target` to 'blank' or 'self', respectively.

```html
<a [wbRouterLink]="['persons', person.id]" [wbRouterLinkExtras]="{target: 'blank'}">Open person in new view</a>
```

> Use matrix parameters to associate optional data with the view outlet URL.\
Matrix parameters are like regular URL parameters, but do not affect route resolution.
Unlike query parameters, matrix parameters are not global and part of the routing path, which makes them suitable for auxiliary routes. Also, matrix parameters are removed upon destruction of the view outlet, and parameter names must not be qualified with the view identity.

## How to set a title of a view tab
Title and heading of a view tab are set by the component currently displayed in the view. For that, inject `WorkbenchView` to get a handle to interact with the current view.

```javascript
@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute,
              view: WorkbenchView,
              personService: PersonService) {
    route.paramMap
      .pipe(
        map(paramMap => paramMap.get('id')),
        distinctUntilChanged(),
        switchMap(id => personService.person$(id)),
        takeUntil(this.destroy$)
      )
      .subscribe(person => {
        view.title = `${person.firstname} ${person.lastname}`;
        view.heading = 'Person';
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
```
## How to close a view?
A view can be closed in two ways, either by the close button in the view tab, or programmatically. By default, a view is closable via view tab close button, which you can disable by injecting a handle to the view and set `closable` property to 'false'. To programmatically close a view, invoke `close` method of injected `WorkbenchView`.

```javascript
@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent {

  constructor(private view: WorkbenchView) {
    view.closable = false; // control if the view is closable from view tab
  }

  public onClose(): void {
    this.view.close();
  }
}
```

## How to prevent a view from being closed?
Closing of a view can be intercepted by implementing `WbBeforeDestroy` lifecycle hook. In `wbBeforeDestroy` method, which is invoked when the view is about to be closed, control closing by returning a truthy or falsy value directly, or via `Observable` or `Promise`.

The following snippet asks the user whether to save changes.

```javascript 
@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements WbBeforeDestroy {

  constructor(private messageBoxService: MessageBoxService) {
  }

  public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    return this.messageBoxService.open({
      content: 'Do you want to save changes?',
      severity: 'info',
      actions: ['yes', 'no', 'cancel']
    }).then(action => {
      switch (action) {
        case 'yes':
          return this.persist$().toPromise();
        case 'no':
          return true;
        case 'cancel':
          return false;
      }
    });
  }

  private persist$(): Observable<boolean> {
    return ...;
  }
}
```

## How to set an icon for an activity
The easiest way to set an icon for an activity is by using an icon font. In `<wb-activity>` element, you can specify a label and one or more CSS classes.

For Material icons, specify 'material-icons' as CSS class and the ligature as label, which renders the icon glyph by using its textual name.

```html
<wb-workbench>
  <wb-activity title="Persons"
               label="group"
               cssClass="material-icons"
               routerLink="persons">
  </wb-activity>
</wb-workbench>
```

For Font Awesome Icons, simply specify the CSS class(es) and leave 'label' empty.

```html
<wb-activity title="Persons"
              cssClass="fas fa-users"
              routerLink="person-list">
</wb-activity>
```

As a prerequisite, include the icon font in your application, e.g. in `index.html` as following:

```html
<!-- Material Icon Font -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<!-- Font Awesome Icon Font -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">
```

## How to pop up a message box
To popup a message box, inject `MessageBoxService` and invoke `open` method. Provide a `MessageBox` options object to control the appearance of the message box, like its severity, its content and the buttons shown. When being closed by the user, the `Promise` emits the action as string literal.

The content can be as simple as some text, or a component to be displayed. When specifying a component, do not forget to register it as `entryComponents` in your application module, so it is available at runtime.

A message box can be application  modal or view modal, which you can control by setting 'modality' property. By default, and if in view context, the message box is view modal.

```javascript
@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent {

  constructor(private view: WorkbenchView,
              private messageBoxService: MessageBoxService) {
  }

  public close(): void{
    this.messageBoxService.open({
      content: 'Do you want to close?',
      severity: 'info',
      actions: ['yes', 'no']
    }).then(action => {
      if (action === 'yes') {
        this.view.close();
      }
    });
  }
}
```

## How to show a notification
To show a notification, inject `NotificationService` and invoke `notify` method. Provide a `Notification` options object to control the appearance of the notification, like its severity, its content and show duration.

The content can be as simple as some text, or a component to be displayed. When specifying a component, do not forget to register it as `entryComponents` in your application module, so it is available at runtime.

```javascript
@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent {

  constructor(private notificationService: NotificationService) {
  }

  public store(): void{
    this.notificationService.notify({
      content: 'Person successfully created',
      severity: 'info',
      duration: 'medium',
    });
  }
}
```

## How to integrate a micro frontend
Integration of micro frontends is still at its early stage.

Currently, we provide a `RemoteSiteComponent` which accepts a URL to load a remote site, and a listener to get notified upon URL changes. This allows simple bidirectional communication, but implies the micro frontend to be tightly integrated into the host application. 

```html
<wb-remote-site [url]="url" (urlChange)="onUrlChange($event)"></wb-remote-site>
```
Future plans are to have a thin 'Workbench guest API', which is included in the micro frontend application to communicate with the host application. It will be a simple protocol to provide a manifest with capabilities and ways to interact with the workbench, like to open views, open message boxes or to show notifications.
