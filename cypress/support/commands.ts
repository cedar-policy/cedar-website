declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            clickAButton(text: string): Chainable<JQuery<HTMLElement>>;
        }
    }
}

Cypress.Commands.add('clickAButton', (text: string) => {
    cy.contains('button', text, { timeout: 10000 }).click();
});
