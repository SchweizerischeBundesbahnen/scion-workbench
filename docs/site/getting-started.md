<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Getting Started

We will create a simple todo list app to introduce you to the SCION Workbench. This short tutorial helps to install the SCION Workbench and explains how to arrange and open views.

The application lists todos on the left side. When the user clicks a todo, a new view opens displaying the todo. Different todos open a different view. To open a todo multiple times, the Ctrl key can be pressed. The user can size and arrange views by drag and drop.

***
- After you complete this guide, the application will look like this: https://scion-workbench-getting-started.vercel.app.
- The source code of the application can be found <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/apps/workbench-getting-started-app/src">here</a>.
***

<details>
    <summary><strong>Create New Angular Application</strong></summary>
    <br>

Run the following command to create a new Angular application.

```console
ng new workbench-getting-started --routing=false --style=scss --skip-tests
```

</details>

<details>
    <summary><strong>Install SCION Workbench from NPM</strong></summary>
    <br>

Run the following command to install the SCION Workbench and required dependencies.

```console
npm install @scion/workbench @scion/workbench-client @scion/toolkit @scion/components @scion/microfrontend-platform @angular/cdk
```

</details>

<details>
    <summary><strong>Import SCION Workbench Module</strong></summary>
    <br>

Open `app.module.ts` and import the `WorkbenchModule` and `BrowserAnimationsModule`. Added lines are marked with `[+]`.

```ts
    import {NgModule} from '@angular/core';
    import {AppComponent} from './app.component';
[+] import {WorkbenchModule} from '@scion/workbench';
[+] import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
[+] import {RouterModule} from '@angular/router';
    import {BrowserModule} from '@angular/platform-browser';

    @NgModule({
      declarations: [AppComponent],
      imports: [
[+]     WorkbenchModule.forRoot(),
[+]     RouterModule.forRoot([]),
        BrowserModule,
[+]     BrowserAnimationsModule,
      ],
      bootstrap: [AppComponent],
    })
    export class AppModule {
    }
```
</details>

<details>
    <summary><strong>Insert SCION Workbench Component</strong></summary>
    <br>

Open `app.component.html` and change it as follows:

```html 
<wb-workbench></wb-workbench>
```

The workbench itself does not position nor lay out the `<wb-workbench>` component. Depending on your requirements, you may want the workbench to fill the entire page viewport or only parts of it, for example, if you have a header, footer, or navigation panel.

For a quick start, position the workbench absolutely and align it with the page viewport. Open `app.component.scss` and change it as follows:
```scss
  wb-workbench {
    position: absolute;
    inset: 0;
  }
```
</details>

<details>
    <summary><strong>Add SCION Workbench Styles</strong></summary>
    <br>

The workbench requires some styles to be imported into `styles.scss`, as follows:

```scss
@use '@scion/workbench';
``` 

Also, download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/scion-workbench-icons/fonts/fonts.zip">GitHub</a>, unzip the font files, and place the extracted files in the `assets/fonts` folder.

</details>

<details>
    <summary><strong>Create Welcome Component</strong></summary>
    <br>


In this step, we will create a component that displays a welcome message when no view is open in the main area.

1. Create a new standalone component using the Angluar CLI.
 
    ```console
    ng generate component welcome --standalone --skip-tests
    ```

2. Open `welcome.component.ts` component and export it by default.

    ```ts
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-welcome',
          templateUrl: './welcome.component.html',
          styleUrls: ['./welcome.component.scss'],
          standalone: true,
        })
    [+] export default class WelcomeComponent {
        }
    ```

3. Open `welcome.component.html` and change it as follows:
 
    ```html
    What needs to be done today?
    ```

4. Register a route in `app.module.ts` for the component.

   In this step, we bind the component to the empty path route to display it when the application is opened.
 
    ```ts
        import {NgModule} from '@angular/core';
        import {AppComponent} from './app.component';
        import {WorkbenchModule} from '@scion/workbench';
        import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
        import {RouterModule} from '@angular/router';
        import {BrowserModule} from '@angular/platform-browser';
    
        @NgModule({
          declarations: [AppComponent],
          imports: [
            WorkbenchModule.forRoot(),
            RouterModule.forRoot([
    [+]       {path: '', loadComponent: () => import('./welcome/welcome.component')},   
            ]),
            BrowserModule,
            BrowserAnimationsModule,
          ],
          bootstrap: [AppComponent],
        })
        export class AppModule {
        }
    ```

    Run `ng serve` and open a browser to http://localhost:4200. You should see the welcome message.

</details>

<details>
    <summary><strong>Create Todos Component</strong></summary>
    <br>

In this step, we will create a component to display the todos. We will use the `TodoService` to get some sample todos. You can download the `todo.service.ts` file from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/apps/workbench-getting-started-app/src/app/todo.service.ts">here</a>.

1. Create a new standalone component using the Angluar CLI.
    ```console
    ng generate component todos --standalone --skip-tests
    ```
2. Open `todos.component.ts` and change it as follows.

    ```ts
        import {Component} from '@angular/core';
    [+] import {WorkbenchRouterLinkDirective, WorkbenchView} from '@scion/workbench';
    [+] import {TodoService} from '../todo.service';
    [+] import {NgFor} from '@angular/common';
    
        @Component({
          selector: 'app-todos',
          templateUrl: './todos.component.html',
          standalone: true,
          imports: [
    [+]     NgFor,
    [+]     WorkbenchRouterLinkDirective,
          ],
        })
    [+] export default class TodosComponent {
    
    [+]   constructor(view: WorkbenchView, public todoService: TodoService) {
    [+]     view.title = 'Todos';
    [+]     view.heading = 'What to do today?';
    [+]     view.closable = false;
    [+]   }
        }
    ```

    In the constructor, we inject the view handle `WorkbenchView`. Using this handle, we can interact with the view, for example, set the title or make the view non-closable. We also inject a reference to the `TodoService` to iterate over the todos in the template.

    > Do not forget to export the component by default to simplify route registration.

3. Open `todos.component.html` and change it as follows:

    ```html
    <ol>
      <li *ngFor="let todo of todoService.todos">
        <a [wbRouterLink]="['/todos', todo.id]">{{todo.task}}</a>
      </li>
    </ol>
    ```

   For each todo, we create a link. When the user clicks on a link, a new view with the respective todo will open. In a next step we will create the todo component and register it under the route `/todos/:id`. Note that we are using the `wbRouterLink` and not the `routerLink` directive. The `wbRouterLink` directive is the Workbench equivalent of the Angular Router link, which enables us to target views.

4. Register a route in `app.module.ts` for the component.

    ```ts
        import {NgModule} from '@angular/core';
        import {AppComponent} from './app.component';
        import {WorkbenchModule} from '@scion/workbench';
        import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
        import {RouterModule} from '@angular/router';
        import {BrowserModule} from '@angular/platform-browser';
    
        @NgModule({
          declarations: [AppComponent],
          imports: [
            WorkbenchModule.forRoot(),
            RouterModule.forRoot([
              {path: '', loadComponent: () => import('./welcome/welcome.component')},
    [+]       {path: '', outlet: 'todos', loadComponent: () => import('./todos/todos.component')},      
            ]),
            BrowserModule,
            BrowserAnimationsModule,
          ],
          bootstrap: [AppComponent],
        })
        export class AppModule {
        }
    ```

    We create an empty path <a href="https://angular.io/guide/router-tutorial-toh#secondary-routes">secondary route</a>. The route object for a secondary route has an outlet property. Its value refers to the view in the workbench layout. In our example, we name the outlet `todos`. In the next step, we will add a view named `todos` to the workbench layout.
   
</details>

<details>
    <summary><strong>Display Todos on the Left Side</strong></summary>
    <br>

In this step, we will define a simple workbench layout that displays the todos component as a view on the left to the main area.

Open `app.module.ts` and pass `WorkbenchModule.forRoot()` a configuration object with the initial workbench layout. 

```ts
    import {NgModule} from '@angular/core';
    import {AppComponent} from './app.component';
[+] import {MAIN_AREA, WorkbenchLayoutFactory, WorkbenchModule} from '@scion/workbench';
    import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
    import {RouterModule} from '@angular/router';
    import {BrowserModule} from '@angular/platform-browser';

    @NgModule({
      declarations: [AppComponent],
      imports: [
        WorkbenchModule.forRoot({
[+]       layout: (factory: WorkbenchLayoutFactory) => factory
[+]         .addPart(MAIN_AREA)
[+]         .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
[+]         .addView('todos', {partId: 'left', activateView: true}),
        }),
        RouterModule.forRoot([
          {path: '', loadComponent: () => import('./welcome/welcome.component')},
          {path: '', outlet: 'todos', loadComponent: () => import('./todos/todos.component')},      
        ]),
        BrowserModule,
        BrowserAnimationsModule,
      ],
      bootstrap: [AppComponent],
    })
    export class AppModule {
    }
```

We define the initial arrangement of views by specifying a layout function. The function is passed a factory to create the layout.

> The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is displayed in views.
> The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views. The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable area for user interaction.

In this example, we create a layout with two parts, the main area and a part left to it. We name the left part `left` and align it to the left of the main area. We want it to take up 25% of the available space. Next, we add the todos view to the part. We name the view `todos`, the same name we used in the previous step where we created the secondary route for the view. This is how we link a view to a route.

Open a browser to http://localhost:4200. You should see the todo list left to the main area. However, when you click on a todo, you will get an error because we have not registered the route yet.
</details>

<details>
    <summary><strong>Create Todo Component</strong></summary>
    <br>

In this step, we will create a component to open a todo in a view.

1. Create a new standalone component using the Angluar CLI.
    ```console
    ng generate component todo --standalone --skip-tests
    ```
2. Open `todo.component.ts` and change it as follows.

    ```ts
    [+] import {Component, Inject, LOCALE_ID} from '@angular/core';
    [+] import {WorkbenchView} from '@scion/workbench';
    [+] import {Todo, TodoService} from '../todo.service';
    [+] import {ActivatedRoute} from '@angular/router';
    [+] import {map, Observable, tap} from 'rxjs';
    [+] import {AsyncPipe, DatePipe, formatDate, NgIf} from '@angular/common';

        @Component({
          selector: 'app-todo',
          templateUrl: './todo.component.html',
          styleUrls: ['./todo.component.scss'],
          standalone: true,
          imports: [
    [+]     AsyncPipe, NgIf, DatePipe,
          ],
        })
    [+] export default class TodoComponent {
        
    [+]   public todo$: Observable<Todo>;
        
    [+]   constructor(route: ActivatedRoute, todoService: TodoService, view: WorkbenchView, @Inject(LOCALE_ID) locale: string) {
    [+]     this.todo$ = route.params
    [+]       .pipe(
    [+]         map(params => params['id']),
    [+]         map(id => todoService.getTodo(id)),
    [+]         tap(todo => {
    [+]           view.title = todo.task;
    [+]           view.heading = `Due by ${formatDate(todo.dueDate, 'short', locale)}`;
    [+]         }),
    [+]       );
    [+]   }
        }
    ```

    As with the todo list component, we change the component to be exported by default, making it easier to register the route for the component.

   In the constructor, we inject the `ActivatedRoute` to read the id of the todo that we want to display in the view. We also inject the `TodoService` to look up the todo. As a side effect, after looking up the todo, we set the title and heading of the view.

    In the next step, we will subscribe to the observable in the template.

3. Open `todo.component.html` and change it as follows.

    ```html
    <ng-container *ngIf="todo$ | async as todo">
      <span>Task:</span>{{todo.task}}
      <span>Due Date:</span>{{todo.dueDate | date:'short'}}
      <span>Notes:</span>{{todo.notes}}
    </ng-container>
    ```
    Using Angular's `async` pipe, we subscribe to the `todo$` observable and assign its emitted value to the template variable `todo`. Then, we render the todo.   

4. Open `todo.component.scss` and add the following content.

   Next, we add some CSS to get a tabular presentation of the todo.

    ```css
    :host {
      padding: 1em;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: .5em 2em;
      place-content: start;
    }
    ```

5. Register a route in `app.module.ts` for the component.

   Finally, we need to register a route for the component. Unlike the todo list component, we do not create a secondary route, but a primary route with a path, in our example `todos/:id`. We can then navigate to this component in a view using the `WorkbenchRouter` or `wbRouterLink`.

    ```ts
        import {NgModule} from '@angular/core';
        import {AppComponent} from './app.component';
        import {WorkbenchModule} from '@scion/workbench';
        import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
        import {RouterModule} from '@angular/router';
        import {BrowserModule} from '@angular/platform-browser';
    
        @NgModule({
          declarations: [AppComponent],
          imports: [
            WorkbenchModule.forRoot({
              layout: (factory: WorkbenchLayoutFactory) => factory
                .addPart(MAIN_AREA)
                .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
                .addView('todos', {partId: 'left', activateView: true}),
            }),
            RouterModule.forRoot([
              {path: '', loadComponent: () => import('./welcome/welcome.component')},
              {path: '', outlet: 'todos', loadComponent: () => import('./todos/todos.component')},    
    [+]       {path: 'todos/:id', loadComponent: () => import('./todo/todo.component')},  
            ]),
            BrowserModule,
            BrowserAnimationsModule,
          ],
          bootstrap: [AppComponent],
        })
        export class AppModule {
        }
    ```

   Below the code from the previous step how we open the todo view using the `wbRouterLink` directive.
    ```html
    <ol>
      <li *ngFor="let todo of todoService.todos">
        <a [wbRouterLink]="['/todos', todo.id]">{{todo.task}}</a>
      </li>
    </ol>
    ```

    Open a browser to http://localhost:4200. You should see the todo list left to the main area. When you click on a todo, a new view opens displaying the todo. Different todos open a different view. To open a todo multiple times, also press the Ctrl key.

</details>

<details>
    <summary><strong>Further Steps</strong></summary>
    <br>

This short guide has introduced you to the basics of SCION Workbench. For more advanced topics, please refer to our [How-To][link-how-to] guides.
    
</details>

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md

[link-how-to]: /docs/site/howto/how-to.md
