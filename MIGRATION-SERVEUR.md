# Migration du système QR Code vers le serveur Apache

## Résumé des changements

Votre système de gestion d'entrées/sorties a été migré de localStorage (stockage local dans le navigateur) vers un système client-serveur utilisant votre serveur Apache à l'adresse `http://192.168.5.76/`.

## Nouveaux fichiers créés

### 1. **api.php** - API Backend
- Gère toutes les opérations de base de données
- Endpoints disponibles:
  - `add` - Ajouter un visiteur (entrée/sortie)
  - `getAll` - Récupérer tous les visiteurs (admin)
  - `getToday` - Récupérer les visiteurs du jour
  - `verifyPassword` - Vérifier le mot de passe admin
  - `stats` - Obtenir les statistiques (admin)
  - `clearAll` - Effacer toutes les données (admin)

### 2. **.htaccess** - Configuration Apache
- Active CORS pour permettre les requêtes API
- Protège la base de données contre l'accès direct
- Configure la compression et le cache

### 3. **test-api.html** - Page de test
- Permet de tester toutes les fonctionnalités de l'API
- Utile pour vérifier que tout fonctionne après déploiement

### 4. **INSTALLATION.md** - Guide d'installation
- Instructions détaillées pour déployer sur Apache
- Configuration des permissions
- Conseils de sécurité

## Fichiers modifiés

### **script.js**
Changements principaux:
- ✅ Suppression de l'utilisation de `localStorage`
- ✅ Ajout de fonctions API asynchrones (`apiRequest`, `saveVisitor`, `loadVisitors`)
- ✅ Conversion des fonctions en async/await pour les appels serveur
- ✅ Gestion d'erreurs améliorée avec try/catch
- ✅ Authentification admin par token

**Fonctions modifiées:**
- `handleFormSubmit()` - Maintenant async, utilise l'API
- `showQuickExit()` - Maintenant async, charge depuis le serveur
- `recordExit()` - Maintenant async, sauvegarde sur le serveur
- `handleAdminAccess()` - Maintenant async, vérifie le mot de passe via l'API
- `updateStats()` - Maintenant async, récupère les stats depuis le serveur
- `clearAllData()` - Maintenant async, supprime via l'API

**Nouvelles fonctions:**
- `apiRequest()` - Fonction générique pour appeler l'API
- `saveVisitor()` - Sauvegarde un visiteur sur le serveur
- `loadVisitors()` - Charge les visiteurs depuis le serveur
- `getPresentVisitorsFromList()` - Calcule les visiteurs présents depuis une liste

## Base de données

### Structure SQLite (visitors.db)
Le fichier `visitors.db` sera créé automatiquement lors du premier enregistrement.

**Table: visitors**
```sql
CREATE TABLE visitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    visitReason TEXT,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
)
```

## Avantages de la migration

### 🎯 Centralisation des données
- Les données ne sont plus stockées localement dans chaque navigateur
- Un seul point de vérité pour toutes les entrées/sorties
- Accessible depuis n'importe quel appareil du réseau local

### 🔒 Sécurité améliorée
- Base de données SQLite protégée par .htaccess
- Authentification admin pour les opérations sensibles
- Validation côté serveur de toutes les données

### 📊 Statistiques centralisées
- Les statistiques sont calculées depuis toutes les données
- Pas de désynchronisation entre les appareils
- Historique complet accessible via l'admin

### 💾 Sauvegarde facilitée
- Un seul fichier de base de données à sauvegarder (`visitors.db`)
- Possibilité de sauvegardes automatiques
- Export CSV disponible dans l'interface admin

### 📱 Multi-dispositifs
- Plusieurs tablettes/ordinateurs peuvent utiliser le système simultanément
- Données synchronisées en temps réel
- Pas de perte de données lors du changement d'appareil

## Comment déployer

### Étape 1: Copier les fichiers
Copiez tous les fichiers du dossier `QRcode` vers votre serveur Apache:
```
/var/www/html/
├── index.html
├── script.js
├── styles.css
├── api.php
├── .htaccess
└── test-api.html
```

### Étape 2: Configurer les permissions
```bash
cd /var/www/html
chmod 755 .
```

### Étape 3: Tester
1. Ouvrez `http://192.168.5.76/test-api.html`
2. Cliquez sur tous les boutons de test
3. Vérifiez que tous les tests passent ✓

### Étape 4: Utiliser le système
1. Ouvrez `http://192.168.5.76/`
2. Le système fonctionne maintenant avec le serveur !

## Compatibilité

### Anciens navigateurs
Si des utilisateurs ont des données dans leur localStorage (ancien système), ces données **ne seront pas migrées automatiquement**. Vous pouvez:
1. Exporter les données au format CSV depuis l'ancien système
2. Importer manuellement dans la nouvelle base de données

### Tous les navigateurs modernes
- ✅ Chrome/Edge (version récente)
- ✅ Firefox (version récente)
- ✅ Safari (version récente)
- ✅ Opera (version récente)

## Maintenance

### Sauvegarder les données
```bash
# Copier la base de données
cp /var/www/html/visitors.db /backup/visitors_$(date +%Y%m%d).db
```

### Restaurer les données
```bash
# Restaurer depuis une sauvegarde
cp /backup/visitors_20250117.db /var/www/html/visitors.db
chmod 666 /var/www/html/visitors.db
```

### Voir les logs
```bash
# Logs Apache
sudo tail -f /var/log/apache2/error.log

# Si erreur, vérifier aussi
sudo tail -f /var/log/apache2/access.log
```

## Dépannage rapide

### Problème: "Impossible de charger les données"
**Solution:** Vérifiez que:
- Le serveur Apache est démarré: `sudo systemctl status apache2`
- L'URL dans script.js est correcte: `http://192.168.5.76/api.php`
- Le fichier api.php existe et est accessible

### Problème: "Erreur lors de l'enregistrement"
**Solution:** Vérifiez les permissions:
```bash
cd /var/www/html
ls -la visitors.db
# Doit être lisible/écritable par www-data
```

### Problème: La base de données ne se crée pas
**Solution:**
```bash
# Créer manuellement
cd /var/www/html
sudo touch visitors.db
sudo chown www-data:www-data visitors.db
sudo chmod 666 visitors.db
```

## Contact et support

Pour toute question, consultez:
1. Le fichier `INSTALLATION.md` pour les détails techniques
2. La page `test-api.html` pour tester l'API
3. Les logs Apache pour diagnostiquer les erreurs

---

**Version:** 2.0 - Système client-serveur
**Date:** 17 Janvier 2025
**Serveur:** http://192.168.5.76/
