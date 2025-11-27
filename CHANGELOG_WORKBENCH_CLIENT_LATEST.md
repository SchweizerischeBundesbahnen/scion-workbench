# [1.0.0-beta.36](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/workbench-client-1.0.0-beta.35...workbench-client-1.0.0-beta.36) (2025-11-27)


### Code Refactoring

* **workbench-client/view:** change signature of `WorkbenchView.params$ ` and `WorkbenchView.snapshot.params` from `Map<string, any>` to `Map<string, unknown>` ([2cb37ec](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/2cb37ec71396576d92356ccc4454a628feb9450c))
* **workbench-client/view:** remove deprecated API to set title and heading as Observable ([b55c635](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/b55c6357c7eb80e72692a352113686b0fe7f6aff))
* **workbench-client/view:** deprecate transient view parameters ([a43db8c](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/a43db8cfddfa31df8f0965d0d4f91878394914eb))
* **workbench-client/dialog:** remove deprecated API to set title as Observable ([407cd13](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/407cd138c08ab26cfe06b4763c38aa56fa488f20))
* **workbench-client/dialog:** remove generic from dialog handle ([7e8ee5d](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/7e8ee5d4984c455466be580dd9010bab8c78dc39))
* **workbench-client/popup:** refactor Workbench Popup API ([57c5406](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/57c5406c38f270f95a91edd32d607598e524cf40))
* **workbench-client/notification:** refactor Workbench Notification API ([55e451f](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/55e451fb0646683742092a7ae50476e180079fe5))

### BREAKING CHANGES

* **workbench-client/view:** Changed signature of `WorkbenchView.params$ ` and `WorkbenchView.snapshot.params` from `Map<string, any>` to `Map<string, unknown>`. An explicit cast may be required now.
* **workbench-client/view:** Removed deprecated API to set title and heading as Observable. To migrate, pass a translatable and provide the text using a text provider registered in `WorkbenchClient.registerTextProvider`.
* **workbench-client/popup:** Changed signature of `WorkbenchPopup.params` from `Map<string, any>` to `Map<string, unknown>`. An explicit cast may be required now.
* **workbench-client/popup:** Removed generic from popup handle as not required on type-level.
* **workbench-client/dialog:** Removed generic from dialog handle as not required on type-level.
* **workbench-client/dialog:** Removed deprecated API to set title as Observable. To migrate, pass a translatable and provide the text using a text provider registered in `WorkbenchClient.registerTextProvider`.
* **workbench-client:** SCION Workbench Client now requires `@scion/toolkit` version `2.0.0` or higher. For more information, refer to the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-toolkit/blob/master/CHANGELOG_TOOLKIT.md) of `@scion/toolkit`.
* **workbench-client:** SCION Workbench Client now requires `@scion/microfrontend-platform` version `1.6.0` or higher. For more information, refer to the [changelog](https://github.com/SchweizerischeBundesbahnen/scion-microfrontend-platform/blob/master/CHANGELOG.md) of `@scion/microfrontend-platform`.

### Deprecations

* **workbench-client/popup:** Refactored the Workbench Popup API to align with other Workbench APIs like Dialog, MessageBox, and Notification. Deprecated the old API and marked it for removal.

  To migrate, use `WorkbenchPopupOptions` instead of `WorkbenchPopupConfig`.
* **workbench-client/notification:** Refactored the Workbench Notification API to align with other Workbench APIs like Dialog, MessageBox, and Popup. Deprecated the old API and marked it for removal.

  To migrate:
  - Pass text or qualifier as the first argument to `WorkbenchNotificationService.show`.
  - Set duration in milliseconds, not seconds.
  - Use `WorkbenchNotificationOptions` instead of `WorkbenchNotificationConfig`.
* **workbench-client/view:** Transient view parameters are deprecated. API marked for removal. No replacement.

  To migrate, send large data as a retained message to a random topic and pass the topic as parameter. After receiving the data, the view should delete the retained message to free resources.

  **Example for sending large data**
  ```ts
  import {Beans} from '@scion/toolkit/bean-manager';
  import {MessageClient} from '@scion/microfrontend-platform';
  import {WorkbenchRouter} from '@scion/workbench-client';
  
  // Define topic to transfer large data.
  const dataTransferTopic = crypto.randomUUID();
  
  // Open view, passing the transfer topic as a view parameter.
  Beans.get(WorkbenchRouter).navigate({component: 'view'}, {
    params: {dataTransferTopic: dataTransferTopic},
  });
  
  // Send large data to transfer topic.
  const largeData = 'Large Data';
  Beans.get(MessageClient).publish(dataTransferTopic, largeData, {retain: true});
  ```

  **Example for receiving large data**
  ```ts
  import {Beans} from '@scion/toolkit/bean-manager';
  import {MessageClient} from '@scion/microfrontend-platform';
  import {WorkbenchView} from '@scion/workbench-client';
  
  // Read transfer topic from view parameters.
  const transferTopic = Beans.get(WorkbenchView).snapshot.params.get('dataTransferTopic') as string;
  
  // Receive large data.
  Beans.get(MessageClient).onMessage(transferTopic, msg => {
    console.log('large data', msg.body);
  
    // Delete retained message to free resources.
    Beans.get(MessageClient).publish(transferTopic, undefined, {retain: true});
  });
  ```
