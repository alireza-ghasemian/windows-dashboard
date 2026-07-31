import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Search, Tag, FileText, ChevronDown, Check, X, Pin, Lock, Unlock, Download, Upload } from 'lucide-react';
import { Note, Language } from '../types';
import { digitsToPersian } from '../utils/dateUtils';

interface NotesProps {
  language: Language;
}

const POPULAR_TAGS = ["Personal", "Ideas", "Finance", "Study", "Work"];

export default function Notes({ language }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('productivity_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to defaults
      }
    }
    return [
      { id: 'n-1', title: 'خلاصه‌ی هزینه‌های سالیانه', content: 'تا جای ممکن از پیشنهادهای اتوکامپلیت استفاده شود تا در گزارش نهایی تفکیک دقیقی داشته باشیم.', tags: ['Finance'], updatedAt: new Date().toISOString() },
      { id: 'n-2', title: 'ایده‌ی برنامه‌ی ورزشی', content: 'روزهای زوج تمرکز روی تمرین‌های قدرتی و روزهای فرد دویدن در پارک.', tags: ['Ideas', 'Personal'], updatedAt: new Date().toISOString() }
    ];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error' | 'loading'>('loading');

  // 1. Initial Load from Express Server (JSON File backup if exists)
  useEffect(() => {
    async function loadFromJSON() {
      try {
        const response = await fetch('/api/notes');
        const result = await response.json();
        
        if (result && result.exists && result.data) {
          const {
            notes: serverNotes,
            dragLocked: serverDragLocked,
            availableTags: serverAvailableTags,
          } = result.data;
          
          if (serverNotes) setNotes(serverNotes);
          if (serverDragLocked !== undefined) setDragLocked(serverDragLocked);
          if (serverAvailableTags) setAvailableTags(serverAvailableTags);
          
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error("Failed to load notes from JSON file:", error);
        setSyncStatus('error');
      } finally {
        setIsInitialLoaded(true);
      }
    }
    loadFromJSON();
  }, []);

  // Note editor form
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [draggedNoteIndex, setDraggedNoteIndex] = useState<number | null>(null);
  const [dragLocked, setDragLocked] = useState<boolean>(() => localStorage.getItem('notes_drag_locked') !== 'false');

  // Draggable viewing popup state
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteModalPos, setNoteModalPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Custom Confirmation Dialog State
  const [confirmPopup, setConfirmPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Dynamic available tags
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('productivity_note_tags');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return POPULAR_TAGS;
      }
    }
    return POPULAR_TAGS;
  });
  const [newTagInput, setNewTagInput] = useState("");

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (availableTags.includes(trimmed)) return;
    const updated = [...availableTags, trimmed];
    setAvailableTags(updated);
    localStorage.setItem('productivity_note_tags', JSON.stringify(updated));
    setNewTagInput("");
  };

  useEffect(() => {
    localStorage.setItem('productivity_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('notes_drag_locked', dragLocked ? 'true' : 'false');
  }, [dragLocked]);

  // 2. Debounced save to local server file when states change
  useEffect(() => {
    if (!isInitialLoaded) return;

    setSyncStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notes,
            dragLocked,
            availableTags,
          }),
        });
        
        if (response.ok) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch (error) {
        console.error("Failed to save notes data to JSON file:", error);
        setSyncStatus('error');
      }
    }, 800); // 800ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [notes, dragLocked, availableTags, isInitialLoaded]);

  // Window drag listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setNoteModalPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setNoteModalPos({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - noteModalPos.x,
      y: e.clientY - noteModalPos.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - noteModalPos.x,
        y: e.touches[0].clientY - noteModalPos.y
      });
    }
  };

  const handleCreateOrEditNote = () => {
    if (!noteTitle.trim()) {
      setValidationError(language === 'fa' ? "لطفاً عنوان یادداشت را وارد کنید." : "Please enter a title for the note.");
      return;
    }
    if (!noteContent.trim()) {
      setValidationError(language === 'fa' ? "لطفاً متن یادداشت را وارد کنید." : "Please write some content for the note.");
      return;
    }

    setValidationError(null);

    if (editId) {
      setNotes(prev => prev.map(n => {
        if (n.id === editId) {
          return {
            ...n,
            title: noteTitle.trim(),
            content: noteContent.trim(),
            tags: noteTags,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      }));
    } else {
      const item: Note = {
        id: `n-${Date.now()}`,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        tags: noteTags,
        updatedAt: new Date().toISOString()
      };
      setNotes(prev => [item, ...prev]);
    }

    // Reset Form
    setIsEditing(false);
    setEditId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteTags([]);
  };

  const handleEditClick = (note: Note) => {
    setEditId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags || []);
    setValidationError(null);
    setIsEditing(true);
  };

  const handleDeleteNoteClick = (note: Note) => {
    setConfirmPopup({
      isOpen: true,
      title: trans.deleteConfirmTitle,
      message: trans.deleteConfirmMsg.replace('{title}', note.title),
      onConfirm: () => {
        setNotes(prev => prev.filter(n => n.id !== note.id));
        setConfirmPopup(null);
      }
    });
  };

  const toggleFormTag = (tag: string) => {
    if (noteTags.includes(tag)) {
      setNoteTags(prev => prev.filter(t => t !== tag));
    } else {
      setNoteTags(prev => [...prev, tag]);
    }
  };

  // Filter notes keeping user order
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeTagFilter ? n.tags.includes(activeTagFilter) : true;
    return matchesSearch && matchesTag;
  });

  const togglePinNote = (id: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
      const pinned = updated.filter(n => n.pinned);
      const unpinned = updated.filter(n => !n.pinned);
      return [...pinned, ...unpinned];
    });
  };

  const handleNoteDragStart = (index: number) => {
    setDraggedNoteIndex(index);
  };

  const handleNoteDrop = (targetIndex: number) => {
    if (draggedNoteIndex === null || draggedNoteIndex === targetIndex) return;

    setNotes(prev => {
      // Create a list of currently displayed (and thus filtered) notes
      const displayedNotes = [...filteredNotes];
      const draggedItem = displayedNotes[draggedNoteIndex];
      
      // Remove from old position and insert at new position in the displayed list
      displayedNotes.splice(draggedNoteIndex, 1);
      displayedNotes.splice(targetIndex, 0, draggedItem);

      // Now map back to the original notes state to preserve items not in filtered list
      const nonDisplayed = prev.filter(n => !displayedNotes.some(dn => dn.id === n.id));
      return [...displayedNotes, ...nonDisplayed];
    });

    setDraggedNoteIndex(null);
  };

  const t = {
    fa: {
      title: "یادداشت‌های شخصی",
      addNote: "یادداشت جدید",
      save: "ذخیره یادداشت",
      cancel: "انصراف",
      searchPlaceholder: "جستجو در عنوان و متن...",
      noNotes: "هنوز یادداشتی ثبت نکرده‌اید.",
      tagsLabel: "برچسب‌ها:",
      titlePlaceholder: "عنوان یادداشت...",
      contentPlaceholder: "متن خود را اینجا بنویسید...",
      edit: "ویرایش یادداشت",
      deleteConfirmTitle: "تایید حذف یادداشت",
      deleteConfirmMsg: "آیا مطمئن هستید که می‌خواهید یادداشت «{title}» را حذف کنید؟ این عمل غیرقابل بازگشت است.",
      yes: "بله، حذف شود",
      no: "خیر، انصراف",
      noteDetails: "نمایش جزئیات یادداشت",
      close: "بستن",
      dragToMove: "برای جابه‌جایی بکشید"
    },
    en: {
      title: "My Personal Notes",
      addNote: "New Note",
      save: "Save Note",
      cancel: "Cancel",
      searchPlaceholder: "Search title and contents...",
      noNotes: "No notes added yet.",
      tagsLabel: "Tags:",
      titlePlaceholder: "Note title...",
      contentPlaceholder: "Write down your thoughts...",
      edit: "Edit Note",
      deleteConfirmTitle: "Confirm Delete",
      deleteConfirmMsg: "Are you sure you want to delete the note '{title}'? This action cannot be undone.",
      yes: "Yes, delete",
      no: "No, cancel",
      noteDetails: "Note Details",
      close: "Close",
      dragToMove: "Drag to move"
    },
    de: {
      title: "Persönliche Notizen",
      addNote: "Neue Notiz",
      save: "Speichern",
      cancel: "Abbrechen",
      searchPlaceholder: "Suchen...",
      noNotes: "Keine Notizen erfasst.",
      tagsLabel: "Tags:",
      titlePlaceholder: "Notiztitel...",
      contentPlaceholder: "Schreiben Sie hier...",
      edit: "Notiz bearbeiten",
      deleteConfirmTitle: "Löschen bestätigen",
      deleteConfirmMsg: "Sind Sie sicher, dass Sie die Notiz '{title}' löschen möchten? Dies kann nicht rückgängig gemacht werden.",
      yes: "Ja, löschen",
      no: "Nein, abbrechen",
      noteDetails: "Notiz-Details",
      close: "Schließen",
      dragToMove: "Ziehen zum Bewegen"
    }
  };

  const trans = t[language];

  const getSyncBadge = () => {
    const isRtl = language === 'fa';
    switch (syncStatus) {
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[9px]">{isRtl ? 'بارگذاری...' : 'Loading...'}</span>
          </span>
        );
      case 'saving':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" />
            <span className="text-[9px]">{isRtl ? 'ذخیره‌سازی...' : 'Saving...'}</span>
          </span>
        );
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium font-vazir shrink-0" title={isRtl ? 'ذخیره شده در notes_data.json' : 'Saved to notes_data.json'}>
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-[9px]">{isRtl ? 'همگام با فایل' : 'Synced with JSON'}</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium font-vazir shrink-0">
            <span className="w-1 h-1 rounded-full bg-rose-400" />
            <span className="text-[9px]">{isRtl ? 'خطا' : 'Sync error'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportNotesJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          notes,
          dragLocked,
          availableTags
        }, null, 2)
      );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `notes_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Failed to export notes JSON:", error);
    }
  };

  const handleImportNotesJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.notes)) {
          setNotes(parsed.notes);
          if (parsed.dragLocked !== undefined) setDragLocked(parsed.dragLocked);
          if (Array.isArray(parsed.availableTags)) setAvailableTags(parsed.availableTags);
          
          setConfirmPopup({
            isOpen: true,
            title: language === 'fa' ? "بازیابی موفق" : "Restore Successful",
            message: language === 'fa' ? "یادداشت‌ها با موفقیت از فایل JSON بازیابی و همگام‌سازی شدند!" : "Notes have been successfully restored from JSON file!",
            onConfirm: () => setConfirmPopup(null)
          });
        } else {
          setConfirmPopup({
            isOpen: true,
            title: language === 'fa' ? "خطا در بازیابی" : "Restore Error",
            message: language === 'fa' ? "ساختار فایل پشتیبان نامعتبر است." : "Invalid backup file structure.",
            onConfirm: () => setConfirmPopup(null)
          });
        }
      } catch (err) {
        setConfirmPopup({
          isOpen: true,
          title: language === 'fa' ? "خطا در خواندن فایل" : "File Read Error",
          message: language === 'fa' ? "خواندن فایل با خطا مواجه شد." : "An error occurred while parsing the file.",
          onConfirm: () => setConfirmPopup(null)
        });
      }
    };
    fileReader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 px-4" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4 gap-4 glass-panel">
        <h1 className="text-xl font-black text-cyan-400 flex flex-wrap items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
          <span>{trans.title}</span>
          {getSyncBadge()}
        </h1>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* JSON Export/Import */}
          <button
            onClick={handleExportNotesJSON}
            className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'fa' ? "دانلود پشتیبان JSON" : "Download JSON Backup"}
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>{language === 'fa' ? 'خروجی JSON' : 'Export JSON'}</span>
          </button>

          <label className="h-9 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] sm:text-xs text-cyan-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-300" />
            <span>{language === 'fa' ? 'وارد کردن JSON' : 'Import JSON'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportNotesJSON}
              className="hidden"
            />
          </label>

          {!isEditing && (
            <button 
              onClick={() => {
                setEditId(null);
                setNoteTitle("");
                setNoteContent("");
                setNoteTags([]);
                setValidationError(null);
                setIsEditing(true);
              }}
              className="h-9 px-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{trans.addNote}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Modal/Form */}
      {isEditing ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 glass-panel">
          <h2 className="text-sm font-bold text-cyan-400">
            {editId ? trans.edit : trans.addNote}
          </h2>

          {/* Note Title Input with prominent label */}
          <div className="space-y-1">
            <label className="text-xs text-indigo-200/70 font-bold">
              {language === 'fa' ? 'عنوان یادداشت' : 'Note Title'}
            </label>
            <input 
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder={trans.titlePlaceholder}
              className="w-full h-11 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl px-3 text-xs text-white outline-none font-bold"
            />
          </div>

          {/* Note Content Textarea with prominent label */}
          <div className="space-y-1">
            <label className="text-xs text-indigo-200/70 font-bold">
              {language === 'fa' ? 'متن یادداشت' : 'Note Content'}
            </label>
            <textarea 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder={trans.contentPlaceholder}
              className="w-full h-40 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>

          {/* Tags Checkbox Panel with Custom Tag Add Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold">{trans.tagsLabel}</span>
              <div className="flex items-center gap-1.5 max-w-[180px]">
                <input 
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder={language === 'fa' ? 'برچسب جدید...' : 'New tag...'}
                  className="w-full h-7 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-lg px-2 text-[10px] text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddNewTag}
                  className="h-7 px-2 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/20 rounded-lg text-[10px] font-bold transition-all flex-shrink-0"
                >
                  {language === 'fa' ? 'افزودن' : 'Add'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const checked = noteTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleFormTag(tag)}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${checked ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow' : 'bg-black/30 border-white/10 text-slate-400'}`}
                  >
                    {checked && <Check className="w-3 h-3" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {validationError && (
            <div className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 animate-pulse">
              ⚠️ {validationError}
            </div>
          )}

          <div className="flex gap-2.5 pt-2 border-t border-white/5">
            <button 
              onClick={handleCreateOrEditNote}
              className="flex-1 h-11 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white font-black rounded-xl text-xs transition-all shadow"
            >
              {trans.save}
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-5 h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition-all"
            >
              {trans.cancel}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Search and Filter Tags bar */}
          <div className="bg-[#0e092a]/40 border border-white/10 rounded-2xl p-4 glass-panel space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyan-400/70 absolute right-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={trans.searchPlaceholder}
                  className="w-full h-10 bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl pr-9 px-3 text-xs text-white outline-none"
                />
              </div>
              <button
                onClick={() => setDragLocked(!dragLocked)}
                className={`px-3 h-10 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${dragLocked ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20'}`}
                title={dragLocked ? (language === 'fa' ? 'غیرفعال کردن قفل حرکت' : 'Unlock Dragging') : (language === 'fa' ? 'فعال کردن قفل حرکت' : 'Lock Dragging')}
              >
                {dragLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {dragLocked 
                    ? (language === 'fa' ? 'قفل حرکت' : 'Dragging Locked') 
                    : (language === 'fa' ? 'حرکت آزاد' : 'Dragging Allowed')}
                </span>
              </button>
            </div>

            {/* Interactive tag filters */}
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => setActiveTagFilter(null)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-black border transition-all ${!activeTagFilter ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-none text-white' : 'bg-black/30 border-white/10 text-slate-400'}`}
              >
                {language === 'fa' ? 'همه' : 'All'}
              </button>
              {availableTags.map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setActiveTagFilter(tag)}
                  className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-all ${activeTagFilter === tag ? 'bg-gradient-to-r from-cyan-400 to-blue-600 border-none text-white' : 'bg-black/30 border-white/10 text-slate-400'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes display grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-10 bg-white/5 border border-white/10 rounded-2xl glass-panel">
                {trans.noNotes}
              </div>
            ) : (
              filteredNotes.map((note, index) => (
                <div 
                  key={note.id}
                  draggable={!dragLocked}
                  onDragStart={(e) => {
                    if (dragLocked) {
                      e.preventDefault();
                      return;
                    }
                    const target = e.target as HTMLElement;
                    if (target.closest('button') || target.closest('input')) {
                      e.preventDefault();
                      return;
                    }
                    handleNoteDragStart(index);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!dragLocked) {
                      handleNoteDrop(index);
                    }
                  }}
                  onClick={() => {
                    setSelectedNote(note);
                    setNoteModalPos({ x: 0, y: 0 }); // Reset positions on open
                  }}
                  className={`bg-[#0e092b]/40 border ${note.pinned ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-[#0d1637]/40' : 'border-white/10'} hover:border-cyan-400/30 rounded-2xl p-5 glass-panel-hover space-y-3 relative group ${dragLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} transition-all hover:scale-[1.02] flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-all line-clamp-2 flex items-center gap-1.5 select-none">
                        {note.pinned && <Pin className="w-3.5 h-3.5 text-cyan-400 fill-current shrink-0 rotate-45" />}
                        <span>{note.title}</span>
                      </h3>

                      <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-all shrink-0">
                        {/* Pin Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinNote(note.id);
                          }}
                          className={`p-1.5 hover:bg-white/10 rounded-lg transition-all ${note.pinned ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white'}`}
                          title={note.pinned ? (language === 'fa' ? 'برداشتن پین' : 'Unpin Note') : (language === 'fa' ? 'پین کردن یادداشت' : 'Pin Note')}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(note);
                          }}
                          className="p-1.5 hover:bg-white/10 text-amber-400 rounded-lg transition-all"
                          title={trans.edit}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNoteClick(note);
                          }}
                          className="p-1.5 hover:bg-white/10 text-rose-400 rounded-lg transition-all"
                          title={language === 'fa' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-vazir whitespace-pre-wrap line-clamp-4">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 border-t border-white/5 pt-2.5 mt-3">
                    {note.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="text-[8px] font-black px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[8px] text-slate-500 font-bold font-mono mr-auto">
                      {digitsToPersian(new Date(note.updatedAt).toLocaleDateString())}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* DRAGGABLE POPUP FOR VIEWING NOTE DETAILS */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div 
            style={{ transform: `translate(${noteModalPos.x}px, ${noteModalPos.y}px)` }}
            className="bg-[#120826] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in select-none"
          >
            {/* Draggable Titlebar Header */}
            <div 
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="bg-[#1a0f35] px-5 py-4 border-b border-white/10 flex justify-between items-center cursor-move select-none"
              title={trans.dragToMove}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-indigo-200 uppercase tracking-wider">
                  {trans.noteDetails}
                </span>
                <span className="text-[8px] bg-cyan-400/15 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-400/20">
                  {trans.dragToMove}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNote(null)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note Content Panel */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto select-text font-vazir">
              <h2 className="text-lg font-black text-white border-b border-white/5 pb-2">
                {selectedNote.title}
              </h2>

              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                {selectedNote.content}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                {selectedNote.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-[9px] font-black px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-[10px] text-slate-500 font-bold font-mono mr-auto flex items-center">
                  {digitsToPersian(new Date(selectedNote.updatedAt).toLocaleDateString())}
                </span>
              </div>
            </div>

            {/* Footer control */}
            <div className="bg-[#150d2e] px-5 py-3 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white text-xs font-black rounded-xl transition-all shadow"
              >
                {trans.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CONFIRMATION OVERLAY POPUP */}
      {confirmPopup?.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-[#120826] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-fade-in">
            <h3 className="text-base font-black text-rose-500 flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{confirmPopup.title}</span>
            </h3>
            <p className="text-xs text-indigo-200/70 leading-relaxed">{confirmPopup.message}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  confirmPopup.onConfirm();
                  setConfirmPopup(null);
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-xs transition-all shadow-lg"
              >
                {trans.yes}
              </button>
              <button
                onClick={() => setConfirmPopup(null)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs transition-all"
              >
                {trans.no}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
