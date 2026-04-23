import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NoteService from '../services/NoteService';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const NoteList = ({ notes, loading, onNoteDeleted }) => {
  const [deletingNotes, setDeletingNotes] = useState(new Set());
  const [copiedNoteId, setCopiedNoteId] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const { currentUser } = useAuth();

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;

    setDeletingNotes((prev) => new Set(prev).add(noteId));
    try {
      await NoteService.deleteNote(noteId, currentUser.credentials);
      if (onNoteDeleted) onNoteDeleted(noteId);
    } catch {
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeletingNotes((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  };

  const handleCopy = (noteId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedNoteId(noteId);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const toggleExpand = (noteId) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  if (loading) {
    return (
      <div className="sn-card">
        <div className="sn-spinner">
          <div className="spin" />
          <span>Loading your notes…</span>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="sn-card">
        <div className="sn-empty-state">
          <span className="sn-empty-icon">📭</span>
          <p className="sn-empty-title">No notes yet</p>
          <p className="sn-empty-desc">Create your first secure note above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sn-card">
      <div className="sn-card-header">
        <span className="sn-card-header-icon">📋</span>
        Your Notes
        <span className="sn-note-count">{notes.length}</span>
      </div>
      <div className="sn-card-body" style={{ padding: '1rem' }}>
        <div className="sn-notes-list">
          {notes.map((note, idx) => (
            <div className="sn-note-item" key={note.id || idx}>
              <div className="sn-note-header">
                <span className="sn-note-id">#{note.id}</span>
              </div>
              <div className="sn-note-content" onClick={() => toggleExpand(note.id)}>
                <p>{note.content.length > 200 && expandedNoteId !== note.id 
                  ? note.content.substring(0, 200) + '...'
                  : note.content}</p>
              </div>
              {note.content.length > 200 && (
                <button 
                  className="sn-expand-btn"
                  onClick={() => toggleExpand(note.id)}
                >
                  {expandedNoteId === note.id ? 'Show less' : 'Show more'}
                </button>
              )}
              <div className="sn-note-footer">
                <div className="sn-note-meta">
                  <span className="sn-note-id">#{note.id}</span>
                  {note.createdAt && (
                    <span className="sn-note-date">🕒 {formatDate(note.createdAt)}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="sn-export-btn"
                    onClick={() => handleCopy(note.id, note.content)}
                  >
                    {copiedNoteId === note.id ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    className="sn-delete-btn"
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingNotes.has(note.id)}
                  >
                    {deletingNotes.has(note.id) ? (
                      <><span className="spin" style={{ width: 12, height: 12, borderWidth: 2 }} /> Deleting…</>
                    ) : (
                      <>🗑️</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteList;