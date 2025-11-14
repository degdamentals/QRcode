// Configuration
const STORAGE_KEY = 'visitor_records';
const ADMIN_PASSWORD = 'admin123'; // À changer pour la production

// État de l'application
let visitors = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadVisitors();
    initializeEventListeners();
    updateStats();
});

// Chargement des données depuis localStorage
function loadVisitors() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        visitors = JSON.parse(stored);
    }
}

// Sauvegarde des données dans localStorage
function saveVisitors() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
}

// Initialisation des écouteurs d'événements
function initializeEventListeners() {
    // Formulaire d'enregistrement
    const form = document.getElementById('visitorForm');
    form.addEventListener('submit', handleFormSubmit);

    // Bouton sortie rapide
    document.getElementById('quickExitBtn').addEventListener('click', showQuickExit);

    // Bouton nouvel enregistrement
    document.getElementById('newEntryBtn').addEventListener('click', () => showView('registrationView'));

    // Accès admin
    document.getElementById('adminAccessBtn').addEventListener('click', handleAdminAccess);
    document.getElementById('closeAdminBtn')?.addEventListener('click', () => showView('registrationView'));

    // Boutons admin
    document.getElementById('exportBtn')?.addEventListener('click', exportToCSV);
    document.getElementById('clearDataBtn')?.addEventListener('click', clearAllData);
    document.getElementById('filterDate')?.addEventListener('change', updateHistory);
}

// Gestion de la soumission du formulaire
function handleFormSubmit(e) {
    e.preventDefault();

    // Récupération du bouton cliqué
    const clickedButton = document.activeElement;
    const action = clickedButton.value;

    const formData = new FormData(e.target);
    const name = formData.get('name').trim();

    if (!name) {
        alert('Veuillez entrer votre nom');
        return;
    }

    const visitor = {
        id: generateId(),
        name: name,
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        visitReason: formData.get('visitReason'),
        action: action,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR')
    };

    // Enregistrement du visiteur
    visitors.push(visitor);
    saveVisitors();

    // Affichage du message de succès
    showSuccessMessage(visitor);

    // Réinitialisation du formulaire
    e.target.reset();
}

// Affichage du message de succès
function showSuccessMessage(visitor) {
    document.getElementById('successName').textContent = visitor.name;
    document.getElementById('successDate').textContent = visitor.date;
    document.getElementById('successTime').textContent = visitor.time;

    if (visitor.action === 'entry') {
        document.getElementById('successTitle').textContent = 'Entrée enregistrée';
        document.getElementById('successText').textContent = 'Bienvenue ! Votre entrée a été enregistrée avec succès.';
    } else {
        document.getElementById('successTitle').textContent = 'Sortie enregistrée';
        document.getElementById('successText').textContent = 'Au revoir ! Votre sortie a été enregistrée avec succès.';
    }

    showView('successView');

    // Retour automatique après 5 secondes
    setTimeout(() => {
        showView('registrationView');
    }, 5000);
}

// Gestion de la sortie rapide
function showQuickExit() {
    const today = new Date().toLocaleDateString('fr-FR');
    const todayVisitors = visitors.filter(v =>
        v.date === today && v.action === 'entry'
    );

    if (todayVisitors.length === 0) {
        alert('Aucune entrée enregistrée aujourd\'hui');
        return;
    }

    // Créer une liste des visiteurs présents
    const presentVisitors = getPresentVisitors();

    if (presentVisitors.length === 0) {
        alert('Aucun visiteur actuellement présent');
        return;
    }

    const names = presentVisitors.map((v, i) => `${i + 1}. ${v.name}`).join('\n');
    const choice = prompt(`Sélectionnez votre nom (entrez le numéro):\n\n${names}`);

    if (choice) {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < presentVisitors.length) {
            const selectedVisitor = presentVisitors[index];
            recordExit(selectedVisitor);
        } else {
            alert('Sélection invalide');
        }
    }
}

// Enregistrement d'une sortie
function recordExit(entryVisitor) {
    const exit = {
        id: generateId(),
        name: entryVisitor.name,
        company: entryVisitor.company,
        email: entryVisitor.email,
        phone: entryVisitor.phone,
        visitReason: entryVisitor.visitReason,
        action: 'exit',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR')
    };

    visitors.push(exit);
    saveVisitors();
    showSuccessMessage(exit);
}

// Accès administrateur
function handleAdminAccess() {
    const password = prompt('Mot de passe administrateur:');

    if (password === ADMIN_PASSWORD) {
        showView('adminView');
        updateStats();
        updateCurrentVisitorsList();
        updateHistory();
    } else if (password !== null) {
        alert('Mot de passe incorrect');
    }
}

// Mise à jour des statistiques
function updateStats() {
    const today = new Date().toLocaleDateString('fr-FR');
    const todayRecords = visitors.filter(v => v.date === today);

    const todayEntries = todayRecords.filter(v => v.action === 'entry').length;
    const todayExits = todayRecords.filter(v => v.action === 'exit').length;
    const currentVisitors = getPresentVisitors().length;

    document.getElementById('currentVisitors').textContent = currentVisitors;
    document.getElementById('todayEntries').textContent = todayEntries;
    document.getElementById('todayExits').textContent = todayExits;
    document.getElementById('totalVisits').textContent = visitors.length;
}

// Obtenir la liste des visiteurs présents
function getPresentVisitors() {
    const visitorMap = new Map();

    // Parcourir tous les enregistrements
    visitors.forEach(record => {
        if (record.action === 'entry') {
            visitorMap.set(record.name, record);
        } else if (record.action === 'exit') {
            visitorMap.delete(record.name);
        }
    });

    return Array.from(visitorMap.values());
}

// Mise à jour de la liste des visiteurs présents
function updateCurrentVisitorsList() {
    const list = document.getElementById('currentVisitorsList');
    const presentVisitors = getPresentVisitors();

    if (presentVisitors.length === 0) {
        list.innerHTML = '<p class="empty-message">Aucun visiteur actuellement présent</p>';
        return;
    }

    list.innerHTML = presentVisitors.map(v => `
        <div class="visitor-card">
            <div class="visitor-info">
                <strong>${v.name}</strong>
                ${v.company ? `<span class="company">${v.company}</span>` : ''}
            </div>
            <div class="visitor-meta">
                <span>Entrée: ${v.time}</span>
                ${v.visitReason ? `<span class="reason">${getReasonLabel(v.visitReason)}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Mise à jour de l'historique
function updateHistory() {
    const list = document.getElementById('historyList');
    const filterDate = document.getElementById('filterDate').value;

    let filteredVisitors = [...visitors].reverse();

    if (filterDate) {
        const selectedDate = new Date(filterDate).toLocaleDateString('fr-FR');
        filteredVisitors = filteredVisitors.filter(v => v.date === selectedDate);
    }

    if (filteredVisitors.length === 0) {
        list.innerHTML = '<p class="empty-message">Aucun enregistrement</p>';
        return;
    }

    list.innerHTML = filteredVisitors.slice(0, 50).map(v => `
        <div class="history-item ${v.action}">
            <div class="history-main">
                <span class="action-badge ${v.action}">${v.action === 'entry' ? 'ENTRÉE' : 'SORTIE'}</span>
                <strong>${v.name}</strong>
                ${v.company ? `<span class="company">${v.company}</span>` : ''}
            </div>
            <div class="history-meta">
                <span>${v.date} ${v.time}</span>
                ${v.visitReason ? `<span>${getReasonLabel(v.visitReason)}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// Export CSV
function exportToCSV() {
    if (visitors.length === 0) {
        alert('Aucune donnée à exporter');
        return;
    }

    const headers = ['Date', 'Heure', 'Action', 'Nom', 'Entreprise', 'Email', 'Téléphone', 'Motif'];
    const rows = visitors.map(v => [
        v.date,
        v.time,
        v.action === 'entry' ? 'ENTRÉE' : 'SORTIE',
        v.name,
        v.company || '',
        v.email || '',
        v.phone || '',
        getReasonLabel(v.visitReason) || ''
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `visiteurs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Effacer toutes les données
function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir effacer TOUTES les données ? Cette action est irréversible.')) {
        if (confirm('Confirmer la suppression définitive ?')) {
            visitors = [];
            saveVisitors();
            updateStats();
            updateCurrentVisitorsList();
            updateHistory();
            alert('Toutes les données ont été effacées');
        }
    }
}

// Fonctions utilitaires
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getReasonLabel(reason) {
    const labels = {
        'meeting': 'Réunion',
        'delivery': 'Livraison',
        'maintenance': 'Maintenance',
        'interview': 'Entretien',
        'other': 'Autre'
    };
    return labels[reason] || '';
}
