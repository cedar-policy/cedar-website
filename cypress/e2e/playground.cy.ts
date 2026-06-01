describe('Playground feature tests', () => {
    beforeEach(() => {
        cy.visit('/playground');
        cy.get('[data-testid="policy-playground"]', { timeout: 10000 }).should('exist');
    });

    it('loads with Monaco editors visible', () => {
        cy.get('.monaco-editor', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('evaluates authorization and shows a result', () => {
    // The playground loads with sample data pre-filled (PhotoFlash app)
    // Click the evaluate button to run authorization
        cy.get('[data-testid="evaluate-button"]', { timeout: 10000 }).click();

        // Verify a decision result appears (either success or failure)
        cy.get('[data-testid="is-success"], [data-testid="is-failure"]', { timeout: 10000 }).should('exist');
    });

    it('shows error when schema is invalid JSON', () => {
    // Switch to Schema & Policies tab
        cy.contains('[role="tab"]', 'Schema', { timeout: 10000 }).click();

        // Find the schema editor and introduce invalid JSON
        cy.get('.monaco-editor', { timeout: 10000 }).should('have.length.at.least', 1);
        cy.get('.monaco-editor textarea').first().type('{selectAll}{backspace}', { force: true }).type('not valid json{{{', { force: true, parseSpecialCharSequences: false });

        // Switch back to auth query tab and evaluate
        cy.contains('[role="tab"]', 'Authorization', { timeout: 10000 }).click({ force: true });
        cy.get('[data-testid="evaluate-button"]').click({ force: true });

        // Should show an error result
        cy.get('[data-testid="is-failure"]', { timeout: 10000 }).should('exist');
    });

    it('can switch sample applications', () => {
    // The sample app selector should be present
        cy.get('[data-testid="access-selector"]', { timeout: 10000 }).should('exist');
    });
});
