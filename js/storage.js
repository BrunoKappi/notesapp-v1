const AppStorage = (function() {
    const STORAGE_KEY = 'NotesLiteApp_v2';

    return {
        getNotes: function() {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                const defaultNotes = [
                    {
                        id: 'default_1',
                        title: 'Welcome to Bkappi Notes! 🚀',
                        content: 'This is a lightweight and premium notes application.\n\nHere you can create notes, change their colors, collapse them to save space, and search through them!',
                        color: '#3b82f6',
                        createdAt: new Date().toISOString(),
                        collapsed: false
                    },
                    {
                        id: 'default_2',
                        title: 'Organize with Colors 🎨',
                        content: 'Hover over this note, click on the three dots (...) menu, and choose a color to categorize your thoughts.',
                        color: '#22c55e',
                        createdAt: new Date().toISOString(),
                        collapsed: false
                    },
                    {
                        id: 'default_3',
                        title: 'Export to Markdown 📝',
                        content: 'You can export individual notes or all of them together as Markdown (.md) files. Find these options in the note menu or in the top navigation bar.',
                        color: '#eab308',
                        createdAt: new Date().toISOString(),
                        collapsed: true
                    }
                ];
                this.saveNotes(defaultNotes);
                return defaultNotes;
            }
            return JSON.parse(data);
        },
        saveNotes: function(notes) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        },
        generateId: function() {
            return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        addNote: function(note) {
            const notes = this.getNotes();
            notes.push(note);
            this.saveNotes(notes);
        },
        updateNote: function(id, updates) {
            const notes = this.getNotes();
            const index = notes.findIndex(n => n.id === id);
            if (index !== -1) {
                notes[index] = { ...notes[index], ...updates };
                this.saveNotes(notes);
            }
        },
        deleteNote: function(id) {
            let notes = this.getNotes();
            notes = notes.filter(n => n.id !== id);
            this.saveNotes(notes);
        },
        deleteAllNotes: function() {
            localStorage.removeItem(STORAGE_KEY);
        }
    };
})();
