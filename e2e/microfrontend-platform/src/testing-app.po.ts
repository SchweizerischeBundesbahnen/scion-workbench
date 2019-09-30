import { browser } from 'protractor';
import { OutletDescriptorTypes, OutletPageObjectClass, OutletPageObjectDescriptor, OutletPO } from './outlet.po';

/**
 * The central page object of the testing app to perform the initial navigation.
 */
export class TestingAppPO {

  /**
   * Navigates to the testing app with a given microfrontend setup.
   *
   * A microfrontend is displayed inside an outlet. Multiple outlets can be configured, allowing to test multiple microfrontends in a single page.
   * Outlets can be nested. Each outlet must be given a unique name and a page object class representing the microfrontend.
   * To load a microfrontend from a different origin than from 'http://localhost:4200', also specify the origin of the microfrontend.
   *
   * This method returns a {@link OutletPageObjectMap}. Call {@link OutletPageObjectMap#get} with the microfrontend's outlet name to get a
   * reference to the page object of that microfrontend. To get a reference to the containing outlet, append the outlet name with the suffix ':outlet'.
   *
   * A page object class must meet the following requirements:
   * - must provide a single-arg constructor with an argument of the type {@link SwitchToIframeFn}.
   *   Save that function in the page object and call it when to interact with the page.
   *   It switches the WebDriver execution context, causing Protractor to send future commands to that iframe.
   * - must provide a static readonly field named `pageUrl` initialized with the relative path of its microfrontend.
   *
   *
   * ## Examples:
   *
   * ### Microfrontend configuration:
   *
   * ```
   * const pagePOs = await testingAppPO.navigateTo({
   *   left: LeftPagePO,
   *   middle: {
   *     main: MainPagePO,
   *     panel: {origin: TestingAppOrigins.LOCALHOST_4201, useClass: PanelPagePO},
   *   },
   *   right: RightPagePO,
   * });
   *
   * const leftPagePO = await pagePOs.get<PublishMessagePagePO>('left');
   * const mainPagePO = await pagePOs.get<PublishMessagePagePO>('main');
   * ```
   *
   * ### Page object class:
   *
   * ```
   * export class MicrofrontendPagePO {
   *
   *   public static readonly pageUrl = 'relative/path/to/the/microfrontend';
   *
   *   constructor(private _switchToIframeFn: SwitchToIframeFn) {
   *   }
   *
   *   public async doSomething(): Promise<void> {
   *     await this._switchToIframeFn();
   *
   *     ...
   *   }
   * }
   * ```
   *
   * @param outlets describes which microfrontends to load.
   * @return {@link OutletPageObjectMap} to get the page object for an outlet.
   */
  public async navigateTo(outlets: Outlets): Promise<OutletPageObjectMap> {
    browser.resetUrl = 'about:blank';
    return this.configureTestingApp(outlets);
  }

  private async configureTestingApp(outlets: Outlets, parentOutletPO?: OutletPO): Promise<OutletPageObjectMap> {
    // For root outlets, perform the initial page navigation, for child outlets navigate to the outlets page.
    const outletNames = Object.keys(outlets);
    if (parentOutletPO) {
      await parentOutletPO.enterOutletsUrl(TestingAppOrigins.LOCALHOST_4200, outletNames);
    }
    else {
      await browser.get(`/#/testing-app/outlets;names=${outletNames.join(',')}`);
    }

    const outletPOs = outletNames.map(outletName => new OutletPO(outletName, parentOutletPO));
    const pageObjectMap = new Map<string, Object>();

    // Load the microfrontend of every outlet.
    for (const outletPO of outletPOs) {
      const outletDescriptor: string | OutletPageObjectClass | OutletPageObjectDescriptor | Outlets = outlets[outletPO.outletName];

      switch (OutletDescriptorTypes.of(outletDescriptor)) {
        case OutletDescriptorTypes.URL: {
          await outletPO.enterUrl(outletDescriptor as string);
          putIfAbsentOrElseThrow(pageObjectMap, `${outletPO.outletName}`, outletPO);
          break;
        }
        case OutletDescriptorTypes.PAGE_OBJECT_CLASS:
        case OutletDescriptorTypes.PAGE_OBJECT_DESCRIPTOR: {
          const pageObject = await outletPO.enterUrl<any>(outletDescriptor as OutletPageObjectClass | OutletPageObjectDescriptor);
          putIfAbsentOrElseThrow(pageObjectMap, `${outletPO.outletName}:outlet`, outletPO);
          putIfAbsentOrElseThrow(pageObjectMap, outletPO.outletName, pageObject);
          break;
        }
        case OutletDescriptorTypes.OUTLETS: {
          putIfAbsentOrElseThrow(pageObjectMap, outletPO.outletName, outletPO);
          const pageObjects = await this.configureTestingApp(outletDescriptor as Outlets, outletPO);
          pageObjects.outlets().forEach(outlet => putIfAbsentOrElseThrow(pageObjectMap, outlet, pageObjects.get(outlet)));
          break;
        }
      }
    }

    return new class implements OutletPageObjectMap {

      public outlets(): string[] {
        return Array.from(pageObjectMap.keys());
      }

      public get<T>(outlet: string): T {
        const pageObject = pageObjectMap.get(outlet) as T;
        if (!pageObject) {
          throw Error(`[OutletNotFoundError] No outlet found with the given name '${outlet}'.`);
        }
        return pageObject;
      }
    };
  }
}

function putIfAbsentOrElseThrow(map: Map<string, Object>, outletName: string, pageObject: Object): void {
  if (map.has(outletName)) {
    throw Error(`[OutletUniqueError] Another outlet already registered under the same name. [outlet=${outletName}]`);
  }
  map.set(outletName, pageObject);
}

/**
 * Describes which microfrontends to load.
 *
 * Add an entry to this dictionary for every microfrontend to load. The key is used as the outlet name. Outlets can be nested.
 * An outlet specifies the page object class which represents the microfrontend. If only specifying the page object class,
 * the microfrontend is loaded from the origin 'http://localhost:4200'. To load a microfrontend from a different origin, use
 * a {@link OutletPageObjectDescriptor} object to configure the microfrontend instead.
 */
export interface Outlets {
  [outletName: string]: OutletPageObjectClass | OutletPageObjectDescriptor | Outlets | string;
}

/**
 * Allows getting the page object for an outlet.
 */
export interface OutletPageObjectMap {

  /** @internal */
  outlets(): string[];

  /**
   * Returns the page object for the given outlet, or throws an error if not found.
   */
  get<T>(outlet: string): T;
}

/**
 * Origins under which the testing app is served.
 */
export enum TestingAppOrigins {
  LOCALHOST_4200 = 'http://localhost:4200',
  LOCALHOST_4201 = 'http://localhost:4201',
  LOCALHOST_4202 = 'http://localhost:4202',
  LOCALHOST_4203 = 'http://localhost:4203',
}
