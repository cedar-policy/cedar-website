import "./monaco-setup";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { getLocaleFromPath } from "./util/intlHelpers";
import { languagePath, Locale } from "./translations/configuration";
import { flattenMessages } from "./util/flattenMessages";

async function importTranslations(
  locale: Locale,
): Promise<Record<string, string>> {
  const response = await fetch(languagePath(locale));
  const nested = await response.json();
  return flattenMessages(nested);
}

const appRoot = ReactDOM.createRoot(
  document.getElementById("app") as HTMLElement,
);
console.log("Attributions file located at /ATTRIBUTIONS.txt");

const locale = getLocaleFromPath(window.location.pathname);
importTranslations(locale)
  .then((messages: Record<string, string>) => {
    appRoot.render(
      <IntlProvider locale={locale} messages={messages}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </IntlProvider>,
    );
  })
  .catch((e) => {
    console.log(e);
    alert("Translations failed to load.");
    // try to render anyway and use Fallback strings
    appRoot.render(
      <IntlProvider locale={locale} messages={{}}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </IntlProvider>,
    );
  });
