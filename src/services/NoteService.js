import CryptoJS from 'crypto-js';

const API_BASE_URL = 'http://localhost:8080';
const DEMO_NOTES_KEY = (u) => `sn_notes_${u}`;
const DEMO_SETTINGS_KEY = 'sn_settings';

const ENCRYPTION_KEY = 'PrivateSpace_Key_v1';

function getDemoNotes(u) {
  try { return JSON.parse(localStorage.getItem(DEMO_NOTES_KEY(u)) || '[]'); } catch { return []; }
}
function saveDemoNotes(u, notes) {
  localStorage.setItem(DEMO_NOTES_KEY(u), JSON.stringify(notes));
}
function getUsernameFromCredentials(c) {
  try { return atob(c).split(':')[0]; } catch { return 'demo'; }
}

function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

function decryptData(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

class NoteService {
  async getNotes(credentials) {
    try {
      const r = await fetch(`${API_BASE_URL}/notes`, {
        method: 'GET',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
      });
      if (r.ok) return await r.json();
      throw new Error('Failed to fetch notes');
    } catch (e) {
      console.warn('Backend unavailable — using local notes:', e.message);
      return getDemoNotes(getUsernameFromCredentials(credentials));
    }
  }

  async createNote(content, credentials, options = {}) {
    const { tags = [], isMarkdown = false } = options;
    try {
      const r = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tags, isMarkdown }),
      });
      if (r.ok) return await r.json();
      throw new Error('Failed to create note');
    } catch (e) {
      console.warn('Backend unavailable — saving note locally:', e.message);
      const u = getUsernameFromCredentials(credentials);
      const notes = getDemoNotes(u);
      const newNote = { 
        id: Date.now(), 
        content, 
        createdAt: new Date().toISOString(),
        tags,
        isMarkdown,
        isFavorite: false,
        isPinned: false
      };
      notes.unshift(newNote);
      saveDemoNotes(u, notes);
      return newNote;
    }
  }

  async updateNote(noteId, updatedNote, credentials) {
    const { content, tags, isFavorite, isPinned, isMarkdown } = updatedNote;
    try {
      const r = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tags, isFavorite, isPinned, isMarkdown }),
      });
      if (r.ok) return await r.json();
      throw new Error('Failed to update note');
    } catch (e) {
      console.warn('Backend unavailable — updating note locally:', e.message);
      const u = getUsernameFromCredentials(credentials);
      const notes = getDemoNotes(u);
      const idx = notes.findIndex(n => n.id === noteId);
      if (idx !== -1) { 
        notes[idx] = { ...notes[idx], ...updatedNote }; 
        saveDemoNotes(u, notes); 
        return notes[idx]; 
      }
      throw new Error('Note not found locally');
    }
  }

  async deleteNote(noteId, credentials) {
    try {
      const r = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
      });
      if (r.ok) return await r.json();
      throw new Error('Failed to delete note');
    } catch (e) {
      console.warn('Backend unavailable — deleting note locally:', e.message);
      const u = getUsernameFromCredentials(credentials);
      const notes = getDemoNotes(u);
      saveDemoNotes(u, notes.filter(n => n.id !== noteId));
      return { message: 'Deleted locally' };
    }
  }

  encryptNote(note) {
    return encryptData(note);
  }

  decryptNote(encryptedNote) {
    return decryptData(encryptedNote);
  }
}

export default new NoteService();