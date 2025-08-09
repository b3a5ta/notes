// Personal Notes App - Main JavaScript File

class NotesApp {
    constructor() {
        // Initialize data structures
        this.notes = [];
        this.currentNote = null;
        this.filteredTags = new Set();
        this.searchQuery = '';
        this.allTags = new Set();
        
        // Initialize settings
        this.settings = {
            darkMode: false,
            autoSave: true,
            autoSaveDelay: 2000,
            showPreview: true
        };
        
        // GitHub configuration
        this.githubConfig = {
            token: '',
            username: '',
            repository: '',
            filePath: 'notes-data.xlsx',
            isConfigured: false
        };
        
        // Auto-save timer
        this.autoSaveTimer = null;
        
        // Initialize the app
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadGitHubConfig();
        this.setupEventListeners();
        this.loadSampleData();
        this.applyTheme();
        this.showWelcomeModal();
        this.renderNotesList();
        this.renderTagFilters();
    }
    
    // Settings and Configuration
    loadSettings() {
        const savedSettings = localStorage.getItem('notesAppSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('notesAppSettings', JSON.stringify(this.settings));
    }
    
    loadGitHubConfig() {
        const savedConfig = localStorage.getItem('notesAppGitHubConfig');
        if (savedConfig) {
            this.githubConfig = { ...this.githubConfig, ...JSON.parse(savedConfig) };
        }
    }
    
    saveGitHubConfig() {
        localStorage.setItem('notesAppGitHubConfig', JSON.stringify(this.githubConfig));
    }
    
    // Sample Data
    loadSampleData() {
        const sampleNotes = [
            {
                id: "1",
                title: "Getting Started with the Notes App",
                content: "# Welcome to Your Personal Notes App\n\nThis is a modern notes application with the following features:\n\n## Key Features\n- **Markdown Support**: Write notes in markdown with live preview\n- **Tagging System**: Organize notes with tags\n- **Search**: Find notes quickly\n- **Dark Mode**: Toggle between light and dark themes\n- **Excel Storage**: Notes are saved in Excel format\n- **GitHub Sync**: Backup your notes to GitHub\n\n## Getting Started\n1. Create a new note using the \"New Note\" button\n2. Write your content in markdown\n3. Add tags to organize your notes\n4. Use the search bar to find specific notes\n\n*Happy note-taking!*",
                tags: ["getting-started", "tutorial", "features"],
                createdAt: new Date("2025-08-09T14:00:00.000Z"),
                updatedAt: new Date("2025-08-09T14:00:00.000Z")
            },
            {
                id: "2", 
                title: "Markdown Syntax Guide",
                content: "# Markdown Quick Reference\n\n## Headers\n```markdown\n# H1 Header\n## H2 Header\n### H3 Header\n```\n\n## Text Formatting\n- **Bold text**\n- *Italic text*\n- `Inline code`\n\n## Lists\n### Unordered List\n- Item 1\n- Item 2\n- Item 3\n\n### Ordered List\n1. First item\n2. Second item\n3. Third item\n\n## Links and Images\n[Link text](https://example.com)\n![Alt text](image-url)\n\n## Code Blocks\n```javascript\nfunction hello() {\n  console.log('Hello World!');\n}\n```\n\n> This is a blockquote\n\n---\n\n*Use these syntax elements to format your notes beautifully!*",
                tags: ["markdown", "reference", "syntax", "tutorial"],
                createdAt: new Date("2025-08-09T14:05:00.000Z"), 
                updatedAt: new Date("2025-08-09T14:05:00.000Z")
            },
            {
                id: "3",
                title: "Project Ideas",
                content: "# Project Ideas for Development\n\n## Web Applications\n- [ ] Personal dashboard\n- [ ] Task management system  \n- [ ] Weather app with location services\n- [ ] Recipe organizer\n\n## Mobile Apps\n- [ ] Habit tracker\n- [ ] Expense tracker\n- [ ] Fitness app\n\n## Desktop Applications\n- [ ] File organizer\n- [ ] Password manager\n- [ ] Screenshot tool\n\n## Learning Goals\n1. Master React hooks\n2. Learn Node.js backends\n3. Understand database design\n4. Practice responsive design\n\n**Priority**: Focus on web applications first, then expand to mobile development.",
                tags: ["projects", "ideas", "development", "todo"],
                createdAt: new Date("2025-08-09T14:10:00.000Z"),
                updatedAt: new Date("2025-08-09T14:15:00.000Z")
            }
        ];
        
        this.notes = sampleNotes;
        this.updateAllTags();
    }
    
    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('dark-mode-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // New note
        document.getElementById('new-note-btn').addEventListener('click', () => {
            this.createNewNote();
        });
        
        // Save note
        document.getElementById('save-note').addEventListener('click', () => {
            this.saveCurrentNote();
        });
        
        // Delete note
        document.getElementById('delete-note').addEventListener('click', () => {
            this.showDeleteConfirmation();
        });
        
        // Search
        document.getElementById('global-search').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderNotesList();
        });
        
        // Note content changes
        document.getElementById('note-content').addEventListener('input', () => {
            this.updatePreview();
            this.scheduleAutoSave();
        });
        
        document.getElementById('note-title').addEventListener('input', () => {
            this.scheduleAutoSave();
        });
        
        // Tags input
        const tagsInput = document.getElementById('note-tags');
        tagsInput.addEventListener('input', (e) => {
            this.handleTagInput(e);
        });
        
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(e.target.value.trim());
                e.target.value = '';
                this.hideSuggestions();
            }
        });
        
        // Preview toggle
        document.getElementById('toggle-preview').addEventListener('click', () => {
            this.togglePreview();
        });
        
        document.getElementById('close-preview').addEventListener('click', () => {
            this.togglePreview();
        });
        
        // GitHub settings
        document.getElementById('github-settings-btn').addEventListener('click', () => {
            this.showGitHubModal();
        });
        
        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportToExcel();
        });
        
        // Clear filters
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Modal handlers
        this.setupModalListeners();
    }
    
    setupModalListeners() {
        // GitHub modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideGitHubModal();
        });
        
        document.getElementById('modal-backdrop').addEventListener('click', () => {
            this.hideGitHubModal();
        });
        
        document.getElementById('save-github-settings').addEventListener('click', () => {
            this.saveGitHubSettings();
        });
        
        document.getElementById('test-connection').addEventListener('click', () => {
            this.testGitHubConnection();
        });
        
        // Delete confirmation modal
        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.hideDeleteModal();
        });
        
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.deleteCurrentNote();
        });
        
        // Welcome modal
        document.getElementById('close-welcome').addEventListener('click', () => {
            this.hideWelcomeModal();
        });
    }
    
    // Theme Management
    toggleTheme() {
        this.settings.darkMode = !this.settings.darkMode;
        this.applyTheme();
        this.saveSettings();
    }
    
    applyTheme() {
        const root = document.documentElement;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (this.settings.darkMode) {
            root.setAttribute('data-color-scheme', 'dark');
            themeIcon.textContent = '☀️';
        } else {
            root.setAttribute('data-color-scheme', 'light');
            themeIcon.textContent = '🌙';
        }
    }
    
    // Notes Management
    createNewNote() {
        const newNote = {
            id: Date.now().toString(),
            title: '',
            content: '',
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.currentNote = newNote;
        this.clearEditor();
        document.getElementById('delete-note').style.display = 'none';
        document.getElementById('note-title').focus();
        
        // Update active state
        this.updateActiveNote();
    }
    
    saveCurrentNote() {
        if (!this.currentNote) return;
        
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value;
        
        if (!title && !content) {
            this.showToast('Note title or content is required', 'error');
            return;
        }
        
        this.currentNote.title = title || 'Untitled Note';
        this.currentNote.content = content;
        this.currentNote.updatedAt = new Date();
        
        // Add or update note in the collection
        const existingIndex = this.notes.findIndex(note => note.id === this.currentNote.id);
        if (existingIndex >= 0) {
            this.notes[existingIndex] = this.currentNote;
        } else {
            this.notes.unshift(this.currentNote);
        }
        
        this.updateAllTags();
        this.renderNotesList();
        this.renderTagFilters();
        this.updateSyncStatus();
        this.showToast('Note saved successfully', 'success');
        
        document.getElementById('delete-note').style.display = 'inline-flex';
    }
    
    deleteCurrentNote() {
        if (!this.currentNote) return;
        
        this.notes = this.notes.filter(note => note.id !== this.currentNote.id);
        this.currentNote = null;
        this.clearEditor();
        
        this.updateAllTags();
        this.renderNotesList();
        this.renderTagFilters();
        this.hideDeleteModal();
        this.updateSyncStatus();
        this.showToast('Note deleted successfully', 'success');
        
        document.getElementById('delete-note').style.display = 'none';
    }
    
    loadNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.currentNote = note;
        
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        
        this.renderCurrentTags();
        this.updatePreview();
        this.updateActiveNote();
        
        document.getElementById('delete-note').style.display = 'inline-flex';
    }
    
    clearEditor() {
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        document.getElementById('note-tags').value = '';
        
        this.renderCurrentTags();
        this.updatePreview();
        this.updateActiveNote();
    }
    
    updateActiveNote() {
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => item.classList.remove('active'));
        
        if (this.currentNote && this.currentNote.id) {
            const activeItem = document.querySelector(`[data-note-id="${this.currentNote.id}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }
    
    scheduleAutoSave() {
        if (!this.settings.autoSave) return;
        
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            if (this.currentNote) {
                this.saveCurrentNote();
            }
        }, this.settings.autoSaveDelay);
    }
    
    // Search and Filtering
    getFilteredNotes() {
        return this.notes.filter(note => {
            // Search filter
            const matchesSearch = this.searchQuery === '' || 
                note.title.toLowerCase().includes(this.searchQuery) ||
                note.content.toLowerCase().includes(this.searchQuery);
            
            // Tag filter
            const matchesTags = this.filteredTags.size === 0 ||
                note.tags.some(tag => this.filteredTags.has(tag));
            
            return matchesSearch && matchesTags;
        });
    }
    
    clearFilters() {
        this.filteredTags.clear();
        this.searchQuery = '';
        document.getElementById('global-search').value = '';
        
        const checkboxes = document.querySelectorAll('.tag-filter input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        
        this.renderNotesList();
    }
    
    // Tag Management
    updateAllTags() {
        this.allTags.clear();
        this.notes.forEach(note => {
            note.tags.forEach(tag => this.allTags.add(tag));
        });
    }
    
    addTag(tagName) {
        if (!tagName || !this.currentNote) return;
        
        const tag = tagName.toLowerCase().trim();
        if (!this.currentNote.tags.includes(tag)) {
            this.currentNote.tags.push(tag);
            this.renderCurrentTags();
            this.scheduleAutoSave();
        }
    }
    
    removeTag(tagName) {
        if (!this.currentNote) return;
        
        this.currentNote.tags = this.currentNote.tags.filter(tag => tag !== tagName);
        this.renderCurrentTags();
        this.scheduleAutoSave();
    }
    
    handleTagInput(e) {
        const value = e.target.value;
        if (value.includes(',')) {
            const tags = value.split(',');
            const lastTag = tags.pop().trim();
            
            tags.forEach(tag => {
                if (tag.trim()) {
                    this.addTag(tag.trim());
                }
            });
            
            e.target.value = lastTag;
        }
        
        this.showTagSuggestions(value);
    }
    
    showTagSuggestions(input) {
        const suggestions = document.getElementById('tag-suggestions');
        
        if (!input.trim()) {
            this.hideSuggestions();
            return;
        }
        
        const matchingTags = Array.from(this.allTags)
            .filter(tag => tag.includes(input.toLowerCase()) && 
                          !this.currentNote.tags.includes(tag))
            .slice(0, 5);
        
        if (matchingTags.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        suggestions.innerHTML = matchingTags.map(tag => 
            `<div class="tag-suggestion" onclick="app.selectTagSuggestion('${tag}')">${tag}</div>`
        ).join('');
        
        suggestions.classList.remove('hidden');
    }
    
    selectTagSuggestion(tag) {
        this.addTag(tag);
        document.getElementById('note-tags').value = '';
        this.hideSuggestions();
    }
    
    hideSuggestions() {
        document.getElementById('tag-suggestions').classList.add('hidden');
    }
    
    toggleTagFilter(tag) {
        if (this.filteredTags.has(tag)) {
            this.filteredTags.delete(tag);
        } else {
            this.filteredTags.add(tag);
        }
        this.renderNotesList();
    }
    
    // Rendering
    renderNotesList() {
        const notesList = document.getElementById('notes-list');
        const filteredNotes = this.getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <p>No notes found. Create your first note!</p>
                </div>
            `;
            return;
        }
        
        notesList.innerHTML = filteredNotes.map(note => `
            <div class="note-item" data-note-id="${note.id}" onclick="app.loadNote('${note.id}')">
                <h4 class="note-title">${this.escapeHtml(note.title || 'Untitled Note')}</h4>
                <p class="note-preview">${this.escapeHtml(this.getPreviewText(note.content))}</p>
                <div class="note-meta">
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                    <span class="note-date">${this.formatDate(note.updatedAt)}</span>
                </div>
            </div>
        `).join('');
        
        this.updateActiveNote();
    }
    
    renderTagFilters() {
        const tagFilters = document.getElementById('tag-filters');
        const tagCounts = {};
        
        this.notes.forEach(note => {
            note.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
        
        tagFilters.innerHTML = sortedTags.map(([tag, count]) => `
            <label class="tag-filter">
                <input type="checkbox" ${this.filteredTags.has(tag) ? 'checked' : ''} 
                       onchange="app.toggleTagFilter('${tag}')">
                <span class="tag-filter-label">${this.escapeHtml(tag)}</span>
                <span class="tag-filter-count">${count}</span>
            </label>
        `).join('');
    }
    
    renderCurrentTags() {
        const currentTags = document.getElementById('current-tags');
        
        if (!this.currentNote || this.currentNote.tags.length === 0) {
            currentTags.innerHTML = '';
            return;
        }
        
        currentTags.innerHTML = this.currentNote.tags.map(tag => `
            <span class="current-tag">
                ${this.escapeHtml(tag)}
                <button class="remove-tag" onclick="app.removeTag('${tag}')" title="Remove tag">×</button>
            </span>
        `).join('');
    }
    
    // Preview Management
    updatePreview() {
        const content = document.getElementById('note-content').value;
        const previewContent = document.getElementById('preview-content');
        
        if (!content.trim()) {
            previewContent.innerHTML = '<div class="empty-state"><p>Start writing to see preview...</p></div>';
            return;
        }
        
        try {
            const html = marked.parse(content);
            previewContent.innerHTML = html;
            
            // Highlight code blocks
            previewContent.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        } catch (error) {
            previewContent.innerHTML = '<div class="empty-state"><p>Error rendering markdown</p></div>';
        }
    }
    
    togglePreview() {
        const previewPanel = document.getElementById('preview-panel');
        const toggleBtn = document.getElementById('toggle-preview');
        
        if (window.innerWidth <= 1024) {
            previewPanel.classList.toggle('show');
            const isShown = previewPanel.classList.contains('show');
            toggleBtn.textContent = isShown ? '✕ Close' : '👁️ Preview';
        }
    }
    
    // Excel Export/Import
    exportToExcel() {
        try {
            const wb = XLSX.utils.book_new();
            
            const data = this.notes.map(note => ({
                ID: note.id,
                Title: note.title,
                Content: note.content,
                Tags: note.tags.join(', '),
                'Created At': note.createdAt.toISOString(),
                'Updated At': note.updatedAt.toISOString()
            }));
            
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Notes');
            
            XLSX.writeFile(wb, 'personal-notes.xlsx');
            this.showToast('Notes exported to Excel successfully', 'success');
        } catch (error) {
            this.showToast('Failed to export to Excel', 'error');
            console.error('Export error:', error);
        }
    }
    
    // GitHub Integration
    showGitHubModal() {
        const modal = document.getElementById('github-modal');
        
        // Populate form with current settings
        document.getElementById('github-username').value = this.githubConfig.username;
        document.getElementById('github-repo').value = this.githubConfig.repository;
        document.getElementById('github-token').value = this.githubConfig.token;
        document.getElementById('github-filepath').value = this.githubConfig.filePath;
        
        modal.classList.add('show');
    }
    
    hideGitHubModal() {
        document.getElementById('github-modal').classList.remove('show');
    }
    
    saveGitHubSettings() {
        this.githubConfig.username = document.getElementById('github-username').value.trim();
        this.githubConfig.repository = document.getElementById('github-repo').value.trim();
        this.githubConfig.token = document.getElementById('github-token').value.trim();
        this.githubConfig.filePath = document.getElementById('github-filepath').value.trim();
        
        this.githubConfig.isConfigured = !!(
            this.githubConfig.username && 
            this.githubConfig.repository && 
            this.githubConfig.token
        );
        
        this.saveGitHubConfig();
        this.hideGitHubModal();
        this.updateSyncStatus();
        
        this.showToast('GitHub settings saved', 'success');
    }
    
    async testGitHubConnection() {
        if (!this.githubConfig.username || !this.githubConfig.token) {
            this.showToast('Please fill in username and token', 'error');
            return;
        }
        
        const testBtn = document.getElementById('test-connection');
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;
        
        try {
            const response = await fetch(`https://api.github.com/user`, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                this.showToast('GitHub connection successful', 'success');
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            this.showToast('GitHub connection failed', 'error');
            console.error('GitHub test error:', error);
        } finally {
            testBtn.textContent = 'Test Connection';
            testBtn.disabled = false;
        }
    }
    
    updateSyncStatus() {
        const indicator = document.querySelector('.sync-indicator');
        const text = document.querySelector('.sync-text');
        
        if (this.githubConfig.isConfigured) {
            indicator.className = 'sync-indicator synced';
            text.textContent = 'Ready to sync';
        } else {
            indicator.className = 'sync-indicator pending';
            text.textContent = 'Not configured';
        }
    }
    
    // Modal Management
    showDeleteConfirmation() {
        if (!this.currentNote) return;
        
        document.getElementById('delete-note-title').textContent = 
            this.currentNote.title || 'Untitled Note';
        document.getElementById('delete-modal').classList.add('show');
    }
    
    hideDeleteModal() {
        document.getElementById('delete-modal').classList.remove('show');
    }
    
    showWelcomeModal() {
        document.getElementById('welcome-modal').classList.add('show');
    }
    
    hideWelcomeModal() {
        document.getElementById('welcome-modal').classList.remove('show');
    }
    
    // Utility Functions
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const messageEl = document.getElementById('toast-message');
        
        messageEl.textContent = message;
        toast.className = `toast toast--${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    getPreviewText(content) {
        return content
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .slice(0, 150) + (content.length > 150 ? '...' : '');
    }
    
    formatDate(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return new Date(date).toLocaleDateString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const app = new NotesApp();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                app.saveCurrentNote();
                break;
            case 'n':
                e.preventDefault();
                app.createNewNote();
                break;
            case '/':
                e.preventDefault();
                document.getElementById('global-search').focus();
                break;
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            openModal.classList.remove('show');
        }
    }
});

// Handle window resize for responsive preview
window.addEventListener('resize', () => {
    const previewPanel = document.getElementById('preview-panel');
    if (window.innerWidth > 1024 && previewPanel.classList.contains('show')) {
        previewPanel.classList.remove('show');
    }
});