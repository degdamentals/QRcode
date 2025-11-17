// Configuration
const API_URL = 'http://192.168.5.76/api.php';
const ADMIN_PASSWORD = '7v5v822c'; // À changer pour la production

// État de l'application
let visitors = [];
let adminToken = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

// Fonctions API
async function apiRequest(action, options = {}) {
    try {
        const url = `${API_URL}?action=${action}`;
        const headers = {
            'Content-Type': 'application/json'
        };

        // Ajouter le mot de passe admin si disponible
        if (adminToken) {
            headers['X-Admin-Password'] = adminToken;
        }

        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: headers,
            body: options.body ? JSON.stringify(options.body) : null
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur serveur');
        }

        return data;
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Chargement des données depuis le serveur
async function loadVisitors() {
    try {
        const data = await apiRequest('getAll');
        visitors = data.visitors;
    } catch (error) {
        console.error('Erreur lors du chargement des visiteurs:', error);
        alert('Impossible de charger les données. Vérifiez la connexion au serveur.');
    }
}

// Sauvegarde d'un visiteur sur le serveur
async function saveVisitor(visitor) {
    try {
        await apiRequest('add', {
            method: 'POST',
            body: visitor
        });
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
        return false;
    }
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
async function handleFormSubmit(e) {
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

    // Enregistrement du visiteur sur le serveur
    const success = await saveVisitor(visitor);

    if (!success) {
        return;
    }

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
async function showQuickExit() {
    try {
        // Charger les visiteurs du jour depuis le serveur
        const data = await apiRequest('getToday');
        const todayVisitors = data.visitors;

        // Créer une liste des visiteurs présents
        const presentVisitors = getPresentVisitorsFromList(todayVisitors);

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
                await recordExit(selectedVisitor);
            } else {
                alert('Sélection invalide');
            }
        }
    } catch (error) {
        console.error('Erreur lors de la sortie rapide:', error);
        alert('Erreur lors de la récupération des données. Veuillez réessayer.');
    }
}

// Enregistrement d'une sortie
async function recordExit(entryVisitor) {
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

    const success = await saveVisitor(exit);
    if (success) {
        showSuccessMessage(exit);
    }
}

// Accès administrateur
async function handleAdminAccess() {
    const password = prompt('Mot de passe administrateur:');

    if (!password) {
        return;
    }

    try {
        const data = await apiRequest('verifyPassword', {
            method: 'POST',
            body: { password: password }
        });

        if (data.valid) {
            adminToken = password;
            await loadVisitors();
            showView('adminView');
            await updateStats();
            updateCurrentVisitorsList();
            updateHistory();
        } else {
            alert('Mot de passe incorrect');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Mise à jour des statistiques
async function updateStats() {
    try {
        const data = await apiRequest('stats');
        const currentVisitors = getPresentVisitors().length;

        document.getElementById('currentVisitors').textContent = currentVisitors;
        document.getElementById('todayEntries').textContent = data.todayEntries;
        document.getElementById('todayExits').textContent = data.todayExits;
        document.getElementById('totalVisits').textContent = data.total;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
}

// Obtenir la liste des visiteurs présents
function getPresentVisitors() {
    return getPresentVisitorsFromList(visitors);
}

// Obtenir la liste des visiteurs présents depuis une liste donnée
function getPresentVisitorsFromList(visitorList) {
    const visitorMap = new Map();

    // Parcourir tous les enregistrements
    visitorList.forEach(record => {
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
async function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir effacer TOUTES les données ? Cette action est irréversible.')) {
        if (confirm('Confirmer la suppression définitive ?')) {
            try {
                await apiRequest('clearAll', {
                    method: 'DELETE'
                });
                visitors = [];
                await updateStats();
                updateCurrentVisitorsList();
                updateHistory();
                alert('Toutes les données ont été effacées');
            } catch (error) {
                console.error('Erreur lors de la suppression des données:', error);
                alert('Erreur lors de la suppression des données');
            }
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
