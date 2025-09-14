const API_BASE = '/notes';
let currentUser = null;

// Login functionality
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Create Basic Auth header
        const credentials = btoa(username + ':' + password);

        // Test authentication by trying to fetch notes
        const response = await fetch(API_BASE, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + credentials,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            currentUser = { username, credentials };
            showNotesInterface();
            loadNotes();
        } else {
            showError('Invalid username or password');
        }
    } catch (error) {
        showError('Login failed. Please try again.');
    }
});

// Add note functionality
document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const content = document.getElementById('note-content').value;

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + currentUser.credentials,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            document.getElementById('note-content').value = '';
            loadNotes();
            showSuccess('Note saved successfully!');
        } else {
            showError('Failed to save note');
        }
    } catch (error) {
        showError('Error saving note');
    }
});

// Load notes
async function loadNotes() {
    try {
        const response = await fetch(API_BASE, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + currentUser.credentials,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const notes = await response.json();
            displayNotes(notes);
        }
    } catch (error) {
        console.error('Error loading notes:', error);
    }
}

// Display notes
function displayNotes(notes) {
    const notesList = document.getElementById('notes-list');

    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-sticky-note fa-3x mb-3"></i>
                <h5>No notes yet</h5>
                <p>Create your first secure note above!</p>
            </div>
        `;
        return;
    }

    notesList.innerHTML = notes.map(note => `
        <div class="note-item fade-in">
            <div class="note-content">${escapeHtml(note.content)}</div>
            <div class="note-date">
                <i class="fas fa-clock"></i>
                Note ID: ${note.id}
            </div>
        </div>
    `).join('');
}

// UI functions
function showNotesInterface() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('notes-container').style.display = 'block';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('username').textContent = currentUser.username;
}

function logout() {
    currentUser = null;
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('notes-container').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    document.querySelector('#notes-container .container').insertBefore(successDiv, document.querySelector('#notes-container .row'));

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
