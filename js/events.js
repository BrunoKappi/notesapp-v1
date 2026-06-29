const AppEvents = (function() {
    // Helper to trigger file download
    function downloadFile(filename, text) {
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function sanitizeFilename(name) {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    return {
        setupEventListeners: function() {
            const addNoteBtn = document.getElementById('addNoteBtn');
            const deleteAllBtn = document.getElementById('deleteAllBtn');
            const exportAllBtn = document.getElementById('exportAllBtn');
            const themeToggleBtn = document.getElementById('themeToggleBtn');
            const searchInput = document.getElementById('searchInput');
            const notesContainer = document.getElementById('Notes');

            // Theme Toggle Initialization
            const savedTheme = localStorage.getItem('theme') || 'dark';
            if (savedTheme === 'light') {
                document.body.classList.add('light-theme');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }

            themeToggleBtn.addEventListener('click', () => {
                const isLight = document.body.classList.toggle('light-theme');
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
                themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            });

            // Add Note
            addNoteBtn.addEventListener('click', () => {
                const newNote = {
                    id: AppStorage.generateId(),
                    title: '',
                    content: '',
                    color: AppUI.getRandomColor(),
                    createdAt: new Date().toISOString()
                };
                
                AppStorage.addNote(newNote);
                AppUI.renderNotes(searchInput.value);
            });

            // Delete All
            deleteAllBtn.addEventListener('click', () => {
                const confirmDelete = confirm('Are you sure you want to delete all notes?');
                if (confirmDelete) {
                    AppStorage.deleteAllNotes();
                    AppUI.renderNotes();
                }
            });

            // Export All Notes
            exportAllBtn.addEventListener('click', () => {
                const notes = AppStorage.getNotes();
                if (notes.length === 0) {
                    alert('No notes to export!');
                    return;
                }
                
                let markdownContent = `# Bkappi Notes Export\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n---\n\n`;
                notes.forEach(note => {
                    const title = note.title || 'Untitled';
                    const content = note.content || '';
                    const date = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date';
                    markdownContent += `## ${title}\n*Created on: ${date}*\n\n${content}\n\n---\n\n`;
                });
                
                downloadFile('bkappi_notes_all.md', markdownContent);
            });

            // Search
            searchInput.addEventListener('input', (e) => {
                AppUI.renderNotes(e.target.value);
            });

            // Input changes (autosave)
            notesContainer.addEventListener('input', (e) => {
                const noteEl = e.target.closest('.note');
                if (!noteEl) return;
                
                const noteId = noteEl.dataset.id;
                
                if (e.target.classList.contains('note-title-input')) {
                    AppStorage.updateNote(noteId, { title: e.target.value });
                }
                
                if (e.target.classList.contains('note-content-input')) {
                    AppStorage.updateNote(noteId, { content: e.target.value });
                }
            });

            // Clicks on Note Actions
            notesContainer.addEventListener('click', (e) => {
                const noteEl = e.target.closest('.note');
                if (!noteEl) return;
                
                const noteId = noteEl.dataset.id;

                // Toggle Note Dropdown Menu
                if (e.target.closest('.note-menu-btn')) {
                    const container = e.target.closest('.note-menu-container');
                    document.querySelectorAll('.note-menu-container').forEach(c => {
                        if (c !== container) c.classList.remove('active');
                    });
                    container.classList.toggle('active');
                    return;
                }
                
                // Collapse Note
                if (e.target.closest('.collapse-note-btn')) {
                    const notes = AppStorage.getNotes();
                    const note = notes.find(n => n.id === noteId);
                    if (note) {
                        const isCollapsed = !note.collapsed;
                        AppStorage.updateNote(noteId, { collapsed: isCollapsed });
                        
                        // Toggle UI class without re-rendering everything
                        noteEl.classList.toggle('collapsed', isCollapsed);
                        
                        // Update button text and icon
                        const collapseBtn = e.target.closest('.collapse-note-btn');
                        if (isCollapsed) {
                            collapseBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Expand';
                            collapseBtn.title = 'Expand note';
                        } else {
                            collapseBtn.innerHTML = '<i class="fa-solid fa-compress"></i> Collapse';
                            collapseBtn.title = 'Collapse note';
                        }
                    }
                    
                    // Close dropdown menu
                    const container = e.target.closest('.note-menu-container');
                    if (container) container.classList.remove('active');
                    return;
                }

                // Delete Note
                if (e.target.closest('.delete-note-btn')) {
                    noteEl.style.transform = 'scale(0.8)';
                    noteEl.style.opacity = '0';
                    
                    setTimeout(() => {
                        AppStorage.deleteNote(noteId);
                        AppUI.renderNotes(searchInput.value);
                    }, 300);
                }
                
                // Export Single Note
                if (e.target.closest('.export-note-btn')) {
                    const notes = AppStorage.getNotes();
                    const note = notes.find(n => n.id === noteId);
                    if (note) {
                        const title = note.title || 'Untitled';
                        const content = note.content || '';
                        const date = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date';
                        const md = `# ${title}\n*Created on: ${date}*\n\n${content}`;
                        downloadFile(`${sanitizeFilename(title)}.md`, md);
                    }
                }
                
                // Color Picker
                if (e.target.classList.contains('color-option')) {
                    const newColor = e.target.dataset.color;
                    AppStorage.updateNote(noteId, { color: newColor });
                    
                    noteEl.style.setProperty('--note-accent-color', newColor);
                    
                    const allOptions = noteEl.querySelectorAll('.color-option');
                    allOptions.forEach(opt => opt.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });

            // Drag and Drop reordering
            notesContainer.addEventListener('dragstart', (e) => {
                const noteEl = e.target.closest('.note');
                if (!noteEl) return;
                noteEl.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            notesContainer.addEventListener('dragend', (e) => {
                const noteEl = e.target.closest('.note');
                if (noteEl) {
                    noteEl.classList.remove('dragging');
                }
                saveCurrentOrder(notesContainer);
            });

            notesContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = notesContainer.querySelector('.dragging');
                if (!dragging) return;
                
                const closest = getDragAfterElement(notesContainer, e.clientX, e.clientY);
                if (closest.element) {
                    if (closest.insertBefore) {
                        notesContainer.insertBefore(dragging, closest.element);
                    } else {
                        notesContainer.insertBefore(dragging, closest.element.nextSibling);
                    }
                } else {
                    notesContainer.appendChild(dragging);
                }
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.note-menu-container')) {
                    document.querySelectorAll('.note-menu-container').forEach(c => {
                        c.classList.remove('active');
                    });
                }
            });
        }
    };

    // Helper functions for drag and drop reordering
    function getDragAfterElement(container, x, y) {
        const draggableElements = [...container.querySelectorAll('.note:not(.dragging)')];
        let closest = { distance: Infinity, element: null, insertBefore: true };
        
        draggableElements.forEach(child => {
            const box = child.getBoundingClientRect();
            const centerX = box.left + box.width / 2;
            const centerY = box.top + box.height / 2;
            const distance = Math.hypot(x - centerX, y - centerY);
            
            if (distance < closest.distance) {
                const insertBefore = x < centerX;
                closest = { distance, element: child, insertBefore };
            }
        });
        
        return closest;
    }

    function saveCurrentOrder(container) {
        const noteElements = [...container.querySelectorAll('.note')];
        const idsInOrder = noteElements.map(el => el.dataset.id);
        
        const notes = AppStorage.getNotes();
        const sortedNotes = [];
        idsInOrder.forEach(id => {
            const note = notes.find(n => n.id === id);
            if (note) sortedNotes.push(note);
        });
        
        const visibleIds = new Set(idsInOrder);
        const finalNotes = [];
        notes.forEach(note => {
            if (visibleIds.has(note.id)) {
                const nextVisible = sortedNotes.shift();
                if (nextVisible) finalNotes.push(nextVisible);
            } else {
                finalNotes.push(note);
            }
        });
        
        AppStorage.saveNotes(finalNotes);
    }
})();
