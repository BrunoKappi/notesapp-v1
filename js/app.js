document.addEventListener('DOMContentLoaded', () => {
    console.log("Notes App Lite Refactored - Initialized");
    
    // Initialize UI references
    AppUI.init();
    
    // Set up event listeners
    AppEvents.setupEventListeners();
    
    // Initial Render
    AppUI.renderNotes();
});
