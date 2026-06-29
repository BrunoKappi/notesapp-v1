const AppUI = (function() {
    const NOTE_COLORS = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', 
        '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'
    ];

    let notesContainer, noNotesMessage, noteTemplate;

    return {
        init: function() {
            notesContainer = document.getElementById('Notes');
            noNotesMessage = document.getElementById('NoNotes');
            noteTemplate = document.getElementById('note-template');
        },
        renderNotes: function(filterText = '') {
            const notes = AppStorage.getNotes();
            notesContainer.innerHTML = '';
            
            const filteredNotes = notes.filter(note => {
                const titleMatch = (note.title || '').toLowerCase().includes(filterText.toLowerCase());
                const contentMatch = (note.content || '').toLowerCase().includes(filterText.toLowerCase());
                return titleMatch || contentMatch;
            });

            if (filteredNotes.length === 0) {
                if (filterText) {
                    noNotesMessage.innerHTML = '<i class="fa-solid fa-magnifying-glass empty-icon"></i><p>No notes found</p>';
                } else {
                    noNotesMessage.innerHTML = '<i class="fa-solid fa-folder-open empty-icon"></i><p>You don\'t have any notes yet :(</p><span>Click on the + to add a note</span>';
                }
                noNotesMessage.style.display = 'flex';
            } else {
                noNotesMessage.style.display = 'none';
                filteredNotes.forEach(note => {
                    const noteEl = this.createNoteElement(note);
                    notesContainer.appendChild(noteEl);
                });
            }
        },
        createNoteElement: function(note) {
            const clone = noteTemplate.content.cloneNode(true);
            const noteDiv = clone.querySelector('.note');
            
            noteDiv.dataset.id = note.id;
            noteDiv.style.setProperty('--note-accent-color', note.color || NOTE_COLORS[0]);
            
            if (note.collapsed) {
                noteDiv.classList.add('collapsed');
                const collapseBtn = clone.querySelector('.collapse-note-btn');
                if (collapseBtn) {
                    collapseBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Expand';
                    collapseBtn.title = 'Expand note';
                }
            }
            
            const titleInput = clone.querySelector('.note-title-input');
            titleInput.value = note.title || '';
            
            const contentInput = clone.querySelector('.note-content-input');
            contentInput.value = note.content || '';
            
            const dateSpan = clone.querySelector('.note-date');
            if (note.createdAt) {
                const date = new Date(note.createdAt);
                dateSpan.textContent = date.toLocaleDateString();
            }
            
            const colorPicker = clone.querySelector('.color-picker');
            NOTE_COLORS.forEach(color => {
                const colorOption = document.createElement('div');
                colorOption.className = 'color-option';
                colorOption.style.backgroundColor = color;
                colorOption.dataset.color = color;
                
                if (note.color === color) {
                    colorOption.classList.add('active');
                }
                
                colorPicker.appendChild(colorOption);
            });
            
            return clone;
        },
        getRandomColor: function() {
            return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
        }
    };
})();
