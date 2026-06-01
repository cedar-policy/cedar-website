describe('Tutorial step tests', () => {
    it('loads the first tutorial step (policy-structure)', () => {
        cy.visit('/tutorial');
        cy.get('[data-testid="next-tutorial-step"]', { timeout: 10000 }).should('exist');
        // First step should not have a previous button
        cy.get('[data-testid="previous-tutorial-step"]').should('not.exist');
    });

    it('navigates to the next step', () => {
        cy.visit('/tutorial/policy-structure');
        cy.get('[data-testid="next-tutorial-step"]', { timeout: 10000 }).click();
        cy.url().should('include', '/tutorial/forbid');
    });

    it('navigates to the sets step', () => {
        cy.visit('/tutorial/sets');
        cy.get('[data-testid="next-tutorial-step"]', { timeout: 10000 }).should('exist');
        cy.get('[data-testid="previous-tutorial-step"]').should('exist');
    });

    it('navigates to the rbac step', () => {
        cy.visit('/tutorial/rbac');
        cy.get('[data-testid="next-tutorial-step"]', { timeout: 10000 }).should('exist');
    });

    it('navigates to the abac step', () => {
        cy.visit('/tutorial/abac-pt1');
        cy.get('[data-testid="next-tutorial-step"]', { timeout: 10000 }).should('exist');
    });

    it('can navigate backward with previous button', () => {
        cy.visit('/tutorial/sets');
        cy.get('[data-testid="previous-tutorial-step"]', { timeout: 10000 }).click();
        cy.url().should('include', '/tutorial/forbid');
    });

    it('loads the schema step with editors', () => {
        cy.visit('/tutorial/schema');
        cy.get('[data-testid="schema"]', { timeout: 10000 }).should('exist');
        cy.get('[data-testid="cedar"]', { timeout: 10000 }).should('exist');
        cy.get('.monaco-editor', { timeout: 10000 }).should('have.length.at.least', 1);
    });
});
