import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../App.jsx';
import NotesList from '../components/NotesList.jsx';
import Editor from '../components/Editor.jsx';
import Preview from '../components/Preview.jsx';

const getAxios = (token) => axios.create({
  headers: { Authorization: `Bearer ${token}` }
});

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [view, setView] = useState('split');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const api = getAxios(token);

  const fetchNotes = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get('/api/notes', { params });
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  }, [search, token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const selectNote = async (id) => {
    if (dirty && currentNote) {
      await saveCurrentNote();
    }
    try {
      const { data } = await api.get(`/api/notes/${id}`);
      setCurrentNote(data);
      setSelectedNoteId(id);
      setTitle(data.title || '');
      setContent(data.content || '');
      setTags(data.tags || '');
      setDirty(false);
    } catch (err) {
      console.error('Failed to load note:', err);
    }
  };

  const saveCurrentNote = useCallback(async () => {
    if (!currentNote) return;
    setSaving(true);
    try {
      await api.put(`/api/notes/${currentNote.id}`, { title, content, tags });
      setDirty(false);
      await fetchNotes();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [currentNote, title, content, tags, token, fetchNotes]);

  const createNote = async () => {
    if (dirty && currentNote) await saveCurrentNote();
    try {
      const { data } = await api.post('/api/notes', {
        title: 'Untitled',
        content: '',
        tags: ''
      });
      await fetchNotes();
      await selectNote(data.id);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/api/notes/${id}`);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setCurrentNote(null);
        setTitle('');
        setContent('');
        setTags('');
        setDirty(false);
      }
      await fetchNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleContentChange = (val) => {
    setContent(val);
    setDirty(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setDirty(true);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
    setDirty(true);
  };

  // Auto-save every 3 seconds when dirty
  useEffect(() => {
    if (!dirty || !currentNote) return;
    const timer = setTimeout(() => {
      saveCurrentNote();
    }, 3000);
    return () => clearTimeout(timer);
  }, [dirty, content, title, tags, saveCurrentNote]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-700 text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">📝 Markdown Notes</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="bg-indigo-600 text-white placeholder-indigo-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 ml-4 w-48"
          />
        </div>
        <div className="flex items-center gap-4">
          {currentNote && (
            <div className="flex gap-1 bg-indigo-600 rounded-lg p-1">
              {['editor', 'split', 'preview'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                    view === v ? 'bg-white text-indigo-700' : 'text-indigo-200 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          <span className="text-indigo-200 text-sm">Hi, {user?.username}</span>
          <button
            onClick={logout}
            className="text-indigo-200 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <NotesList
            notes={notes}
            selectedId={selectedNoteId}
            onSelect={selectNote}
            onNew={createNote}
            onDelete={deleteNote}
          />
        </aside>

        {/* Editor Area */}
        {currentNote ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Note toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Note title"
                className="flex-1 text-lg font-semibold text-gray-900 focus:outline-none"
              />
              <input
                type="text"
                value={tags}
                onChange={handleTagsChange}
                placeholder="tags (comma-separated)"
                className="text-sm text-gray-500 focus:outline-none border border-gray-200 rounded px-2 py-1 w-48"
              />
              <button
                onClick={saveCurrentNote}
                disabled={saving || !dirty}
                className={`text-sm px-3 py-1 rounded font-medium transition-colors ${
                  dirty
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-400 cursor-default'
                }`}
              >
                {saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
              </button>
            </div>

            {/* Editor / Preview */}
            <div className="flex-1 overflow-hidden flex">
              {(view === 'editor' || view === 'split') && (
                <div className={`${view === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'} overflow-auto`}>
                  <Editor value={content} onChange={handleContentChange} />
                </div>
              )}
              {(view === 'preview' || view === 'split') && (
                <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} overflow-auto bg-white`}>
                  <Preview content={content} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-5xl mb-4">📄</p>
              <p className="text-xl font-medium">Select a note or create a new one</p>
              <button
                onClick={createNote}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
