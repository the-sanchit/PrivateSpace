import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NoteService from '../services/NoteService';
import NoteForm from './NoteForm';
import NoteList from './NoteList';
import { jsPDF } from 'jspdf';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    loadNotes();
  }, [currentUser]);

  const loadNotes = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userNotes = await NoteService.getNotes(currentUser.credentials);
      setNotes(userNotes || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = (newNote) => {
    setNotes(prevNotes => [...prevNotes, newNote]);
  };

  const handleNoteDeleted = (deletedNoteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== deletedNoteId));
  };

  const handleSearch = () => {
    setSearchPerformed(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchPerformed(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(20);
    doc.text('PrivateSpace - Notes Export', 20, yPos);
    yPos += 15;
    
    filteredNotes.forEach((note, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Note #${index + 1}`, 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(note.content, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 10;
    });
    
    doc.save('privatespace-notes.pdf');
  };

  const filteredNotes = notes.filter(note => 
    searchPerformed && searchQuery
      ? note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const lastSavedDate = notes.length > 0
    ? new Date(Math.max(...notes.map(n => new Date(n.createdAt || Date.now()).getTime())))
    : null;

  return (
    <div className="sn-dashboard">
      {/* Header */}
      <div className="sn-dash-header">
        <div>
          <h2 className="sn-dash-greeting">
            {getGreeting()}, {currentUser?.username} 👋
          </h2>
          <p className="sn-dash-sub">Your private, encrypted note space</p>
        </div>
        <div className="sn-dash-actions">
          <div className="sn-search-container">
            <input 
              type="text" 
              className="sn-input sn-search-input" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button 
                className="sn-search-clear" 
                onClick={handleClearSearch}
                title="Clear search"
              >
                ✕
              </button>
            )}
            <button 
              className="sn-search-btn" 
              onClick={handleSearch}
              disabled={!searchQuery.trim() && !searchPerformed}
            >
              Search
            </button>
          </div>
          <button className="sn-export-btn" onClick={exportToPDF} title="Export to PDF">
            ⬇ PDF
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="sn-stats-row">
        <div className="sn-stat-card">
          <span className="sn-stat-value">{loading ? '—' : notes.length}</span>
          <span className="sn-stat-label">Total Notes</span>
        </div>
        <div className="sn-stat-card">
          <span className="sn-stat-value">
            {lastSavedDate
              ? lastSavedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : '—'}
          </span>
          <span className="sn-stat-label">Last Saved</span>
        </div>
        <div className="sn-stat-card">
          <span className="sn-stat-value">🔐</span>
          <span className="sn-stat-label">Encrypted</span>
        </div>
      </div>

      {/* Note Form + List */}
      <NoteForm onNoteCreated={handleNoteCreated} />
      <NoteList
        notes={filteredNotes}
        loading={loading}
        onNoteDeleted={handleNoteDeleted}
      />
    </div>
  );
};

export default Dashboard;