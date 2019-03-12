import { browser, by, element } from 'protractor';

export class AppPage {
  public navigateTo(): Promise<any> {
    return browser.get('/') as Promise<any>;
  }

  public getTitleText(): Promise<any> {
    return element(by.css('wb-app-root h1')).getText() as Promise<string>;
  }
}
