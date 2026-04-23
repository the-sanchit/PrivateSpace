import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NoteService from '../services/NoteService';

const MAX_CHARS = 5000;

const NoteForm = ({ onNoteCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const textareaRef = useRef(null);

  const { currentUser } = useAuth();

  const insertFormatting = (before, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => insertFormatting('**', '**');
  const handleItalic = () => insertFormatting('*', '*');
  const handleCode = () => insertFormatting('`', '`');
  const handleCodeBlock = () => insertFormatting('\n```\n', '\n```\n');
  const handleLink = () => insertFormatting('[', '](url)');
  const handleList = () => insertFormatting('\n- ', '');
  const handleNumberedList = () => insertFormatting('\n1. ', '');
  const handleHeading = () => insertFormatting('\n## ', '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter some content for your note');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const newNote = await NoteService.createNote(content.trim(), currentUser.credentials);
      setContent('');
      setSuccess('Note saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      if (onNoteCreated) onNoteCreated(newNote);
    } catch {
      setError('Failed to save note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="sn-card">
      <div className="sn-card-header">
        <span className="sn-card-header-icon">📝</span>
        Add New Note
        <button 
          className="sn-markdown-toggle" 
          onClick={() => setIsMarkdown(!isMarkdown)}
          title={isMarkdown ? 'Switch to Plain Text' : 'Switch to Markdown'}
        >
          {isMarkdown ? '📄 Plain' : '📝 Markdown'}
        </button>
      </div>
      <div className="sn-card-body">
        {success && <div className="sn-alert sn-alert-success">{success}</div>}
        {error && <div className="sn-alert sn-alert-danger">{error}</div>}

        <div className="sn-toolbar">
          <button type="button" className="sn-toolbar-btn" onClick={handleBold} title="Bold (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button type="button" className="sn-toolbar-btn" onClick={handleItalic} title="Italic (Ctrl+I)">
            <em>I</em>
          </button>
          <button type="button" className="sn-toolbar-btn" onClick={handleHeading} title="Heading">
            H
          </button>
          <span className="sn-toolbar-divider">|</span>
          <button type="button" className="sn-toolbar-btn" onClick={handleList} title="Bullet List">
            •
          </button>
          <button type="button" className="sn-toolbar-btn" onClick={handleNumberedList} title="Numbered List">
            1.
          </button>
          <span className="sn-toolbar-divider">|</span>
          <button type="button" className="sn-toolbar-btn" onClick={handleCode} title="Inline Code">
            {'</>'}
          </button>
          <button type="button" className="sn-toolbar-btn" onClick={handleCodeBlock} title="Code Block">
            {'{ }'}
          </button>
          <button type="button" className="sn-toolbar-btn" onClick={handleLink} title="Link">
            🔗
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="sn-textarea"
            placeholder={isMarkdown 
              ? "Write your note in Markdown...\n\n# Heading\n**bold** *italic*\n- list item\n```code```"
              : "Write your secure note here... (Ctrl+Enter to save)"
            }
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            required
          />

          <div className="sn-form-footer">
            <span className="sn-char-count">
              {content.length}/{MAX_CHARS} characters
            </span>
            <button
              type="submit"
              className="sn-save-btn"
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <><span className="spin" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
              ) : (
                <>💾 Save Note</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;