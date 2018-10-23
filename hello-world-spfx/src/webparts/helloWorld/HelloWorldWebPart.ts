import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-webpart-base";

import styles from "./ExternalApiConsumerWebPart.module.scss";
import * as strings from "HelloWorldWebPartStrings";
import HelloWorld from "./components/HelloWorld";
import { IHelloWorldProps } from "./components/IHelloWorldProps";
import { AadHttpClient, HttpClientResponse } from "@microsoft/sp-http";

export interface IHelloWorldWebPartProps {
  description: string;
}

export default class HelloWorldWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {
  public render(): void {
    // const element: React.ReactElement<IHelloWorldProps > = React.createElement(
    //   HelloWorld,
    //   {
    //     description: this.properties.description
    //   }
    // );

    // ReactDom.render(element, this.domElement);

    this.domElement.innerHTML = `
      <div class="${styles.externalApiConsumer}">
        <div class="${styles.container}">
          <div class="${styles.row}">
            <div class="${styles.column}">
              <span class="${styles.title}">Welcome to SharePoint!</span>
              <p class="${styles.subTitle}">Current user claims from Azure Function:</p>
            </div>
          </div>
        </div>
      </div>
      <div class="${styles.azFuncTablecontainer}">
            <div class='azFuncClaimsTable'>
            </div>
      </div>`;

    this.context.aadHttpClientFactory
      .getClient("<App registration App ID URI>") // Azure Active Directory app registration "App ID URI"
      .then(
        (client: AadHttpClient): void => {
          client
            .get("<API URL>", AadHttpClient.configurations.v1)
            .then(
              (response: HttpClientResponse): Promise<string> => {
                return response.text();
              }
            )
            .then(
              (responseText: string): void => {
                //Display the response text
                var claimsTable: Element = this.domElement.getElementsByClassName("azFuncClaimsTable")[0];

                console.log("response: ", responseText);

                claimsTable.innerHTML = responseText;
              }
            );
        }
      );
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
