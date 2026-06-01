describe('Basic page load smoke tests', () => {
    it('loads the home page', () => {
        cy.visit('/');
        cy.get('[data-testid="entrypoint"]', { timeout: 10000 }).should('exist');
        cy.get('header').should('exist');
    });

    it('loads the playground page with Monaco editors', () => {
        cy.visit('/playground');
        cy.get('[data-testid="policy-playground"]', { timeout: 10000 }).should('exist');
        cy.get('.monaco-editor', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('loads the tutorial page', () => {
        cy.visit('/tutorial');
        cy.get('[data-testid="next-tutorial-step"]', { timeout: 10000 }).should('exist');
    });
});
