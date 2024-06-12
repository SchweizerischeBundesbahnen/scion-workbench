<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Getting Started

We will create a simple TODO app to introduce you to the SCION Workbench. This short tutorial helps to install the SCION Workbench and explains how to arrange and open views.

The application lists TODOs on the left side. When the user clicks a TODO, a new view opens displaying the TODO. Different TODOs open a different view. To open a TODO multiple times, the Ctrl key can be pressed. The user can size and arrange views by drag and drop.

***
- After you complete this guide, the application will look like this: https://scion-workbench-getting-started.vercel.app.
- The source code of the application can be found <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/apps/workbench-getting-started-app/src">here</a>.
***

<details>
    <summary><strong>Create New Angular Application</strong></summary>
    <br>

Run the following command to create a new Angular application.

```console
ng new workbench-getting-started --routing=false --style=scss --ssr=false --skip-tests
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
    <summary><strong>Register SCION Workbench Providers</strong></summary>
    <br>

Open `app.config.ts` and register SCION Workbench providers. Added lines are marked with `[+]`.

```ts
    import {ApplicationConfig} from '@angular/core';
[+] import {provideWorkbench} from '@scion/workbench';
[+] import {provideRouter} from '@angular/router';
[+] import {provideAnimations} from '@angular/platform-browser/animations';
    
    export const appConfig: ApplicationConfig = {
      providers: [
[+]     provideWorkbench(),
[+]     provideRouter([]), // required by the SCION Workbench
[+]     provideAnimations(), // required by the SCION Workbench
      ],
    };
```
</details>

<details>
    <summary><strong>Insert SCION Workbench Component</strong></summary>
    <br>

Open `app.component.html` and change it as follows:

```html 
<wb-workbench/>
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

Also, download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/scion-workbench-icons/fonts/fonts.zip">GitHub</a>, unzip the font files, and place the extracted files in the `/public/fonts` folder.

</details>

<details>
    <summary><strong>Create Welcome Component</strong></summary>
    <br>


In this step, we will create a component that displays a welcome message when no view is open in the main area.

1. Create a new component using the Angular CLI.

    ```console
    ng generate component welcome --skip-tests
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

4. Register a route in `app.config.ts` for the component.

   In this step, we bind the component to the empty path route to display it when the application is opened.

    ```ts
        import {ApplicationConfig} from '@angular/core';
        import {provideWorkbench} from '@scion/workbench';
        import {provideRouter} from '@angular/router';
        import {provideAnimations} from '@angular/platform-browser/animations';
    
        export const appConfig: ApplicationConfig = {
          providers: [
            provideWorkbench(),
            provideRouter([
    [+]       {path: '', loadComponent: () => import('./welcome/welcome.component')},
            ]),
            provideAnimations(),
          ],
       };
    ```

   Run `ng serve` and open a browser to http://localhost:4200. You should see the welcome message.

</details>

<details>
    <summary><strong>Create Todos Component</strong></summary>
    <br>

In this step, we will create the TODO list and place it to the left of the main area. We will use the `TodoService` to get some sample TODOs. You can download the `todo.service.ts` file from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/apps/workbench-getting-started-app/src/app/todo.service.ts">here</a>.

1. Create a new component using the Angular CLI.
    ```console
    ng generate component todos --skip-tests
    ```
2. Open `todos.component.ts` and change it as follows.

    ```ts
        import {Component} from '@angular/core';
    [+] import {WorkbenchRouterLinkDirective, WorkbenchView} from '@scion/workbench';
    [+] import {TodoService} from '../todo.service';
    
        @Component({
          selector: 'app-todos',
          templateUrl: './todos.component.html',
          standalone: true,
          imports: [
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

   We also change the component to be exported by default, making it easier to register the route for the component.

3. Open `todos.component.html` and change it as follows:

    ```html
    <ol>
      @for (todo of todoService.todos; track todo.id) {
        <li>
          <a [wbRouterLink]="['/todos', todo.id]" [wbRouterLinkExtras]="{target: 'auto'}">{{todo.task}}</a>
        </li>
      }
    </ol>
    ```

   For each TODO, we create a link. When the user clicks on a link, a new view with the TODO will open. In a next step we will create the TODO component and register it under the route `/todos/:id`.

   > Note that we are using the `wbRouterLink` and not the `routerLink` directive. The `wbRouterLink` directive is the Workbench equivalent of the Angular Router link to navigate views. By default, `wbRouterLink` navigates the current view. In this example, however, we want to open the `todo` component in a new view or, if already open, activate it. Therefore, we set the target to `auto`.
4. Register a route in `app.config.ts` for the component.

    ```ts
        import {ApplicationConfig} from '@angular/core';
        import {provideWorkbench} from '@scion/workbench';
        import {provideRouter} from '@angular/router';
        import {provideAnimations} from '@angular/platform-browser/animations';
    
        export const appConfig: ApplicationConfig = {
          providers: [
            provideWorkbench(),
            provideRouter([
              {path: '', loadComponent: () => import('./welcome/welcome.component')},
    [+]       {path: 'todos', loadComponent: () => import('./todos/todos.component')}, 
            ]),
            provideAnimations(),
          ],
       };
    ```

5. Add the TODO list to the workbench layout.

   Open `app.config.ts` and configure the workbench with the initial layout.

   ```ts
       import {ApplicationConfig} from '@angular/core';
       import {provideWorkbench} from '@scion/workbench';
       import {provideRouter} from '@angular/router';
       import {provideAnimations} from '@angular/platform-browser/animations';
   [+] import {MAIN_AREA, WorkbenchLayoutFactory} from '@scion/workbench';
   
       export const appConfig: ApplicationConfig = {
         providers: [
           provideWorkbench({
   [+]       layout: (factory: WorkbenchLayoutFactory) => factory
   [+]         .addPart(MAIN_AREA)
   [+]         .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
   [+]         .addView('todos', {partId: 'left'})
   [+]         .navigateView('todos', ['todos'])
           }),
           provideRouter([
             {path: '', loadComponent: () => import('./welcome/welcome.component')},
             {path: 'todos', loadComponent: () => import('./todos/todos.component')}, 
           ]),
           provideAnimations(),
         ],
      };
   ```

   In the above code snippet, we create a layout with two parts, the main area and a part left to it. We align the `left` part to the left of the main area. We want it to take up 25% of the available space. Next, we add the `todos` view to the left part. Finally, we navigate the `todos` view to the `todos` component.

   For detailed explanations on defining the workbench layout, refer to [Defining the initial workbench layout][link-how-to-define-initial-workbench-layout].

   Open a browser to http://localhost:4200. You should see the TODO list left to the main area.
</details>

<details>
    <summary><strong>Create Todo Component</strong></summary>
    <br>

In this step, we will create a component to open a TODO in a view.

1. Create a new component using the Angular CLI.
    ```console
    ng generate component todo --skip-tests
    ```
2. Open `todo.component.ts` and change it as follows.

    ```ts
    [+] import {Component, Inject, LOCALE_ID} from '@angular/core';
    [+] import {WorkbenchView} from '@scion/workbench';
    [+] import {Todo, TodoService} from '../todo.service';
    [+] import {ActivatedRoute} from '@angular/router';
    [+] import {map, Observable, tap} from 'rxjs';
    [+] import {AsyncPipe, DatePipe, formatDate} from '@angular/common';

        @Component({
          selector: 'app-todo',
          templateUrl: './todo.component.html',
          styleUrls: ['./todo.component.scss'],
          standalone: true,
          imports: [
    [+]     AsyncPipe, DatePipe,
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

   As with the TODO list component, we change the component to be exported by default, making it easier to register the route for the component.

   In the constructor, we inject the `ActivatedRoute` to read the id of the TODO that we want to display in the view. We also inject the `TodoService` to look up the TODO. As a side effect, after looking up the TODO, we set the title and heading of the view.

   In the next step, we will subscribe to the observable in the template.

3. Open `todo.component.html` and change it as follows.

    ```html
    @if (todo$ | async; as todo) {
      <span>Task:</span>{{todo.task}}
      <span>Due Date:</span>{{todo.dueDate | date:'short'}}
      <span>Notes:</span>{{todo.notes}}
    }
    ```
    Using Angular's `async` pipe, we subscribe to the `todo$` observable and assign its emitted value to the template variable `todo`. Then, we render the TODO.

4. Open `todo.component.scss` and add the following styles.

   Next, we add some CSS to get a tabular presentation of the TODO.

    ```css
    :host {
      padding: 1em;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: .5em 2em;
      place-content: start;
    }
    ```

5. Register a route in `app.config.ts` for the component.

   Finally, we need to register a route for the component. We can then navigate to this component in a view using the `WorkbenchRouter` or `wbRouterLink`.

   ```ts
       import {ApplicationConfig} from '@angular/core';
       import {provideWorkbench} from '@scion/workbench';
       import {provideRouter} from '@angular/router';
       import {provideAnimations} from '@angular/platform-browser/animations';
       import {MAIN_AREA, WorkbenchLayoutFactory} from '@scion/workbench';
   
       export const appConfig: ApplicationConfig = {
         providers: [
           provideWorkbench({
             layout: (factory: WorkbenchLayoutFactory) => factory
               .addPart(MAIN_AREA)
               .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
               .addView('todos', {partId: 'left'})
               .navigateView('todos', ['todos'])
           }),
         provideRouter([
           {path: '', loadComponent: () => import('./welcome/welcome.component')},
           {path: 'todos', loadComponent: () => import('./todos/todos.component')},
   [+]     {path: 'todos/:id', loadComponent: () => import('./todo/todo.component')},  
         ]),
         provideAnimations(),
        ],
       };
   ```

   Below the code from the previous step how we open the TODO view using the `wbRouterLink` directive.
   ```html
   <ol>
     @for (todo of todoService.todos; track todo.id) {
       <li>
         <a [wbRouterLink]="['/todos', todo.id]" [wbRouterLinkExtras]="{target: 'auto'}">{{todo.task}}</a>
       </li>
     }
   </ol>
   ```

   Open a browser to http://localhost:4200. You should see the TODO list left to the main area. When you click on a TODO, a new view opens displaying the TODO. Different TODOs open a different view. To open a TODO multiple times, also press the Ctrl key.

</details>

<details>
    <summary><strong>Further Steps</strong></summary>
    <br>

This short guide has introduced you to the basics of SCION Workbench. For more advanced topics, please refer to our [How-To][link-how-to] guides.

</details>

[link-how-to-define-initial-workbench-layout]: /docs/site/howto/how-to-define-initial-layout.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md

[link-how-to]: /docs/site/howto/how-to.md
