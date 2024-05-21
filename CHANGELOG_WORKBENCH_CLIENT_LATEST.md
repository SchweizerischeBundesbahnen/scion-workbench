# [1.0.0-beta.23](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.22...workbench-client-1.0.0-beta.23) (2024-05-21)


### Features

* **workbench-client/message-box:** enable microfrontend display in a message box ([3e9d88d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/3e9d88d79665cbce03acfcf2bbd0e0bbda8d5c78)), closes [#488](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/488)


### BREAKING CHANGES

* **workbench-client/message-box:** The signature of the `WorkbenchMessageBoxService.open` method has changed.
  
  To migrate:
  - To display a text message, pass the message as the first argument, not via the `content` property in the options.
  - To display a custom message box, pass the qualifier as the first argument and options, if any, as the second argument.
  
  **Example migration to display a text message**
  ```ts
  // Before Migration
  inject(WorkbenchMessageBoxService).open({
    content: 'Do you want to continue?',
    actions: {yes: 'Yes', no: 'No'},
  });
  
  // After Migration
  inject(WorkbenchMessageBoxService).open('Do you want to continue?', {
    actions: {yes: 'Yes', no: 'No'},
  });
  ```
  
  **Example migration to open a custom message box capability**
  ```ts
  // Before Migration
  inject(WorkbenchMessageBoxService).open({
      title: 'Unsaved Changes',
      params: {changes: ['change 1', 'change 2']},
      actions: {yes: 'Yes', no: 'No'},
    },
    {confirmation: 'unsaved-changes'},
  );
  
  // After Migration
  inject(WorkbenchMessageBoxService).open({confirmation: 'unsaved-changes'}, {
    title: 'Unsaved Changes',
    params: {changes: ['change 1', 'change 2']},
    actions: {yes: 'Yes', no: 'No'},
  });
  ```



