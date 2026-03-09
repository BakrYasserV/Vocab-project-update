const addBtn = document.getElementById('addBtn');
const wordInput = document.getElementById('wordInput');
const meaningInput = document.getElementById('meaningInput');
const notesGrid = document.getElementById('notesGrid');
const columnSelect = document.getElementById('columnSelect');
const selectAllBtn = document.getElementById('selectAllBtn');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const scrollBtn = document.getElementById('scrollToTopBtn');

let vocabList = JSON.parse(localStorage.getItem('myVocab')) || [];
let selectedIndexes = new Set();

const goUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });
document.getElementById('backToTopTitle').addEventListener('click', goUp);
scrollBtn.addEventListener('click', goUp);

window.onscroll = () => {
    scrollBtn.style.display = (window.scrollY > 200) ? 'flex' : 'none';
};

function updateGridLayout() {
    notesGrid.style.gridTemplateColumns = `repeat(${columnSelect.value}, 1fr)`;
}
columnSelect.addEventListener('change', updateGridLayout);

function renderAllCards() {
    notesGrid.innerHTML = '';
    updateDeleteBtnVisibility();
    updateGridLayout();
    vocabList.forEach((item, index) => createCardElement(item, index));
}

function createCardElement(item, index) {
    const card = document.createElement('div');
    card.classList.add('note-card');
    if (selectedIndexes.has(index)) card.classList.add('selected');
    
    card.innerHTML = `
        <div class="selected-badge"><span class="material-icons" style="font-size:14px">check_circle</span> SELECTED</div>
        <div class="card-actions">
            <span class="material-icons edit-icon">edit</span>
            <span class="material-icons delete-icon">delete</span>
        </div>
        <h3 class="word-text">${item.word}</h3>
        <p class="meaning-text">${item.meaning}</p>
        <input type="text" class="inline-note" placeholder="Note..." value="${item.note || ''}">
        <button class="save-card-btn" style="display:none">Save Changes</button>
    `;

    const wordEl = card.querySelector('.word-text');
    const meaningEl = card.querySelector('.meaning-text');
    const noteInp = card.querySelector('.inline-note');
    const saveBtn = card.querySelector('.save-card-btn');

    card.addEventListener('dblclick', () => {
        if (wordEl.contentEditable === "true") return;
        selectedIndexes.has(index) ? selectedIndexes.delete(index) : selectedIndexes.add(index);
        renderAllCards();
    });

    card.querySelector('.edit-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        wordEl.contentEditable = "true";
        meaningEl.contentEditable = "true";
        wordEl.style.background = "rgba(255,255,255,0.05)";
        meaningEl.style.background = "rgba(255,255,255,0.05)";
        saveBtn.className = "save-btn-active";
        wordEl.focus();
    });

    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vocabList[index] = { word: wordEl.innerText, meaning: meaningEl.innerText, note: noteInp.value };
        saveAndRefresh();
    });

    card.querySelector('.delete-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        vocabList.splice(index, 1);
        saveAndRefresh();
    });

    noteInp.addEventListener('blur', () => {
        vocabList[index].note = noteInp.value;
        localStorage.setItem('myVocab', JSON.stringify(vocabList));
    });

    notesGrid.appendChild(card);
}

function updateDeleteBtnVisibility() {
    deleteSelectedBtn.style.display = selectedIndexes.size > 0 ? 'flex' : 'none';
    deleteSelectedBtn.innerHTML = `<span class="material-icons">delete_sweep</span> Delete (${selectedIndexes.size})`;
}

function saveAndRefresh() {
    localStorage.setItem('myVocab', JSON.stringify(vocabList));
    selectedIndexes.clear();
    renderAllCards();
}

addBtn.addEventListener('click', () => {
    if (wordInput.value && meaningInput.value) {
        vocabList.push({ word: wordInput.value, meaning: meaningInput.value, note: "" });
        saveAndRefresh();
        wordInput.value = ''; meaningInput.value = '';
        wordInput.focus();
    }
});

selectAllBtn.addEventListener('click', () => {
    if (selectedIndexes.size === vocabList.length) selectedIndexes.clear();
    else vocabList.forEach((_, i) => selectedIndexes.add(i));
    renderAllCards();
});

deleteSelectedBtn.addEventListener('click', () => {
    if(confirm(`Delete ${selectedIndexes.size} items?`)) {
        vocabList = vocabList.filter((_, i) => !selectedIndexes.has(i));
        selectedIndexes.clear();
        saveAndRefresh();
    }
});

renderAllCards();