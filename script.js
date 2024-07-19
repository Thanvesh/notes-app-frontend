const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const appSection = document.getElementById('appSection');
const notesContainer = document.getElementById('notesContainer');
const noteModal = document.getElementById('noteModal');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const noteColor = document.getElementById('noteColor');
const noteReminder = document.getElementById('noteReminder');
const noteTags = document.getElementById('noteTags');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const createNoteBtn = document.getElementById('createNoteBtn');
const closeModalBtn = document.querySelector('.modal .close');
const searchBox = document.getElementById('searchBox');
const archivedNotesBtn = document.getElementById('archivedNotesBtn');
const remindersBtn = document.getElementById('remindersBtn');
const trashNotesBtn = document.getElementById('trashNotesBtn');
const labelSelect = document.getElementById('labelSelect');
const searchBtn = document.getElementById('searchBtn');
const logoutBtn = document.getElementById('logoutBtn');
const notesBtn = document.getElementById('notesBtn');



let notes = [];
let currentView = 'Home'



let editNoteId = null; // Track the note being edited


// Authentication
function loginUser(username, password) {
  fetch('https://notes-app-server-lzzb.onrender.com/api/noteusers/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        showApp();
      } else {
        alert('Login failed');
      }
    })
    .catch(err => console.error('Error logging in:', err));
}

function signupUser(username, email, password) {
  fetch('https://notes-app-server-lzzb.onrender.com/api/noteusers/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        showApp();
      } else {
        alert('Signup failed');
      }
    })
    .catch(err => console.error('Error signing up:', err));
}

function showLogin() {
  loginSection.style.display = 'block';
  signupSection.style.display = 'none';
  appSection.style.display = 'none';
}

function showSignup() {
  loginSection.style.display = 'none';
  signupSection.style.display = 'block';
  appSection.style.display = 'none';
}

function showApp() {
  loginSection.style.display = 'none';
  signupSection.style.display = 'none';
  appSection.style.display = 'block';
  fetchNotes();
}

// Event listeners for auth forms
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('loginName').value;
    const password = document.getElementById('loginPassword').value;
    loginUser(name, password);
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    signupUser(name, email, password);
  });

  logoutBtn.addEventListener('click', () => {
    console.log('Logout button clicked');
    localStorage.removeItem('authToken');
    console.log('Auth token removed:', localStorage.getItem('authToken') === null);

    // Clear notes and reset view
    notes = [];

    // Redirect to login page
    showLogin();
  });

  if (localStorage.getItem('authToken')) {
    showApp();
  } else {
    showLogin();
  }
});

const clearSearchBtn = document.getElementById('clearSearchBtn');

  clearSearchBtn.addEventListener('click', () => {
    searchBox.value = '';
    fetchNotes()
  });

// Fetch and display notes
function fetchNotes(filter = {}) {
  let url = 'https://notes-app-server-lzzb.onrender.com/api/notes';
  if (filter.archived) url += '/archived';
  if (filter.reminder) url += '/reminders';
  if (filter.trash) url += '/trash';
  if (filter.label) url += `/tag/${filter.label}`;

  const authToken = localStorage.getItem('authToken');
  fetch(url, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
    .then(response => response.json())
    .then(data => {
      notes = data;
      displayNotes();
      populateLabels();
    })
    .catch(err => console.error('Error fetching notes:', err));
}

function searchNotes(searchTerm) {
  return notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm) ||
    note.content.toLowerCase().includes(searchTerm) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}



// Display notes
function displayNotes() {
  notesContainer.innerHTML = ""
  let filteredNotes = notes;

  if (currentView === 'archived') {
    filteredNotes = notes.filter(note => note.archived);
  } else if (currentView === 'reminders') {
    filteredNotes = notes.filter(note => note.reminder);
  } else if (currentView === 'trash') {
    filteredNotes = notes.filter(note => note.trashed);
  } else if (currentView === 'label') {
    filteredNotes = notes.filter(note => note.tags.includes(labelSelect.value));
  }

  const searchTerm = searchBox.value.toLowerCase();
  if (searchTerm) {
    filteredNotes = searchNotes(searchTerm);
  }

  filteredNotes.forEach(note => {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.style.backgroundColor = note.backgroundColor;

    const isDark = isColorDark(note.backgroundColor);
    if (isDark) {
      noteElement.style.color = 'white';
    }
    const noteTitle = document.createElement('h3');
    noteTitle.textContent = note.title;
    

    noteTitle.classList.add("note-title")

    const noteContent = document.createElement('p');
    noteContent.textContent = note.content;

    const noteTags = document.createElement('small');
    noteTags.textContent = `Tags: ${note.tags.join(', ')}`;

    const noteReminder = document.createElement('small');
    noteReminder.textContent = `Reminder: ${note.reminder ? new Date(note.reminder).toLocaleDateString() : 'None'}`;

    const noteButtonContainer=document.createElement("div")
    noteButtonContainer.className="noteButtonContainer"
    

    const archiveButton = document.createElement('button');
    archiveButton.innerHTML = '<i class="fa-regular fa-folder"></i>';
    archiveButton.onclick = () => archiveNote(note._id);
    noteButtonContainer.appendChild(archiveButton)
    

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> ';
    deleteButton.onclick = () => deleteNote(note._id);



    noteButtonContainer.appendChild(deleteButton)

    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> ';
    editButton.onclick = () => editNote(note._id);
    noteButtonContainer.appendChild(editButton)

    noteElement.appendChild(noteTitle);
    noteElement.appendChild(noteContent);
    noteElement.appendChild(noteTags);
    noteElement.appendChild(noteReminder);
    noteElement.appendChild(noteButtonContainer);

    if (isDark) {
      archiveButton.style.color = 'white';
      deleteButton.style.color="white"
      editButton.style.color="white"
      
    }

    


    if (currentView === 'trash') {
      const restoreButton = document.createElement('button');
      restoreButton.innerHTML = '<i class="fa-regular fa-window-restore"></i> ';
      restoreButton.onclick = () => restoreNote(note._id);
      noteButtonContainer.appendChild(restoreButton)

      const permanentlyDeleteButton = document.createElement('button');
      permanentlyDeleteButton.innerHTML = '<i class="fa-regular fa-square-minus"></i>';
      permanentlyDeleteButton.onclick = () => permanentlyDeleteNote(note._id);
      noteButtonContainer.appendChild(permanentlyDeleteButton)

      editButton.style.display = 'none'
    }
    

    notesContainer.appendChild(noteElement);
  });
}


// Show modal for creating/editing notes
function showNoteModal() {
  noteModal.style.display = 'flex';
  if (editNoteId === null) {

    noteTitle.value = '';
    noteContent.value = '';
    noteColor.value = '#ffffff';
    noteReminder.value = '';
    noteTags.value = '';

  }
}

// Hide modal
function hideNoteModal() {
  noteModal.style.display = 'none';
}

// Save note
function saveNote() {
  const tags = noteTags.value.split(',').map(tag => tag.trim()).slice(0, 9);

  const noteData = {
    title: noteTitle.value,
    content: noteContent.value,
    backgroundColor: noteColor.value,
    reminder: noteReminder.value,
    tags
  };

  const authToken = localStorage.getItem('authToken');
  const method = editNoteId ? 'PUT' : 'POST';
  const url = editNoteId ? `https://notes-app-server-lzzb.onrender.com/api/notes/${editNoteId}` : 'https://notes-app-server-lzzb.onrender.com/api/notes/';

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(noteData)
  })
    .then(response => response.json())
    .then(() => {
      fetchNotes();
      hideNoteModal();
    })
    .catch(err => console.error('Error saving note:', err));
}

//editNote 

function editNote(noteId) {
  const note = notes.find(note => note._id === noteId);

  if (!note) return;

  else {
    noteTitle.value = note.title;
    noteContent.value = note.content;
    noteColor.value = note.backgroundColor;
    noteReminder.value = note.reminder ? new Date(note.reminder).toISOString().slice(0, 16) : '';
    noteTags.value = note.tags.join(', ');

    editNoteId = noteId;
    showNoteModal();
  }

}

function isColorDark(color) {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
  if (!hex) return null;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Archive note
function archiveNote(noteId) {
  const authToken = localStorage.getItem('authToken');
  fetch(`https://notes-app-server-lzzb.onrender.com/api/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ archived: true })
  })
    .then(() => fetchNotes())
    .catch(err => console.error('Error archiving note:', err));
}

// Delete note
function deleteNote(noteId) {
  const authToken = localStorage.getItem('authToken');
  fetch(`https://notes-app-server-lzzb.onrender.com/api/notes/${noteId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
    .then(() => fetchNotes())
    .catch(err => console.error('Error deleting note:', err));
}

function permanentlyDeleteNote(noteId) {
  const authToken = localStorage.getItem('authToken');
  fetch(`https://notes-app-server-lzzb.onrender.com/api/notes/${noteId}/permanent`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  })
    .then(() => fetchNotes())
    .catch(err => console.error('Error permanently deleting note:', err));
}

function restoreNote(noteId) {
  const note = notes.find(note => note._id === noteId);

  if (!note) return;

  const update = {
    trashed: false,
    archived: note.archived || false,
    reminder: note.reminder || null
  };

  const authToken = localStorage.getItem('authToken');
  fetch(`https://notes-app-server-lzzb.onrender.com/api/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(update)
  })
    .then(() => fetchNotes())
    .catch(err => console.error('Error restoring note:', err));
}
// Populate label filter
function populateLabels() {
  const labels = new Set();
  notes.forEach(note => note.tags.forEach(tag => labels.add(tag)));

  labelSelect.innerHTML = '<option value="">All Labels</option>';
  labels.forEach(label => {
    const option = document.createElement('option');
    option.value = label;
    option.textContent = label;
    labelSelect.appendChild(option);
  });
}

// Event listeners
createNoteBtn.addEventListener('click', showNoteModal);
saveNoteBtn.addEventListener('click', saveNote);
closeModalBtn.addEventListener('click', hideNoteModal);

notesBtn.addEventListener('click', () => {
  currentView = 'Home';
  fetchNotes();
});

searchBox.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    displayNotes();
  }
});

searchBtn.addEventListener('click', () => {
  displayNotes();
});

archivedNotesBtn.addEventListener('click', () => {
  currentView = 'archived';
  fetchNotes({ archived: true });
});

remindersBtn.addEventListener('click', () => {
  currentView = 'reminders';
  fetchNotes({ reminder: true });
});

trashNotesBtn.addEventListener('click', () => {
  currentView = 'trash';
  fetchNotes({ trash: true });
});

labelSelect.addEventListener('change', () => {
  currentView = 'label';
  fetchNotes({ label: labelSelect.value });
});

document.getElementById('menuIcon').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  // Adjust main content width based on sidebar state
  if (sidebar.classList.contains('collapsed')) {
    mainContent.style.width = '95%';
  } else {
    mainContent.style.width = '90%';
  }
});

// Fetch notes on load
fetchNotes();
