# Guide de démarrage rapide

## 🚀 Mise en route en 5 minutes

### Méthode 1: Copie manuelle (Recommandée)

1. **Copiez tous les fichiers** du dossier `QRcode` vers votre serveur Apache:
   - Connectez-vous à votre serveur à l'adresse `\\192.168.5.76\www` (ou le chemin réseau)
   - Copiez ces fichiers:
     - `index.html`
     - `script.js`
     - `styles.css`
     - `api.php`
     - `.htaccess`
     - `test-api.html` (optionnel, pour les tests)

2. **Testez l'installation**:
   - Ouvrez votre navigateur
   - Allez sur `http://192.168.5.76/test-api.html`
   - Cliquez sur "Tester la connexion"
   - Si vous voyez "✓ Connexion réussie!", tout fonctionne !

3. **Utilisez le système**:
   - Ouvrez `http://192.168.5.76/`
   - Le système est prêt à l'emploi !

### Méthode 2: Script automatique (Windows)

1. **Double-cliquez sur** `deploy.bat`
2. Le script copiera automatiquement tous les fichiers
3. Suivez les instructions à l'écran

---

## 🔐 Accès administrateur

1. Ouvrez `http://192.168.5.76/`
2. Cliquez sur **"Accès administrateur"** en bas de page
3. Entrez le mot de passe: `7v5v822c`
4. Vous verrez:
   - Statistiques en temps réel
   - Liste des visiteurs présents
   - Historique des entrées/sorties
   - Fonction d'export CSV

### ⚠️ IMPORTANT: Changez le mot de passe !

**Dans api.php** (ligne 17):
```php
define('ADMIN_PASSWORD', 'VOTRE_NOUVEAU_MOT_DE_PASSE');
```

**Dans script.js** (ligne 3):
```javascript
const ADMIN_PASSWORD = 'VOTRE_NOUVEAU_MOT_DE_PASSE';
```

---

## 📱 Utilisation quotidienne

### Pour les visiteurs

#### Enregistrer une ENTRÉE:
1. Ouvrir `http://192.168.5.76/`
2. Remplir le formulaire (seul le nom est obligatoire)
3. Cliquer sur **"Enregistrer une ENTRÉE"**
4. Un message de confirmation s'affiche

#### Enregistrer une SORTIE:

**Option 1 - Sortie rapide:**
1. Cliquer sur **"Enregistrer une sortie rapide"**
2. Sélectionner votre nom dans la liste
3. Valider

**Option 2 - Nouveau formulaire:**
1. Remplir le formulaire avec votre nom
2. Cliquer sur **"Enregistrer une SORTIE"**

### Pour les administrateurs

#### Voir qui est présent:
1. Accéder au mode admin (mot de passe: `7v5v822c`)
2. La section **"Visiteurs présents"** affiche la liste en temps réel

#### Consulter l'historique:
1. Mode admin → section **"Historique des enregistrements"**
2. Filtrer par date si nécessaire
3. Les 50 derniers enregistrements sont affichés

#### Exporter les données:
1. Mode admin → cliquer sur **"Exporter CSV"**
2. Un fichier CSV est téléchargé automatiquement
3. Ouvrir avec Excel ou Google Sheets

#### Effacer les données:
1. Mode admin → cliquer sur **"Effacer les données"**
2. ⚠️ Confirmer DEUX fois (action irréversible!)
3. Toutes les données sont supprimées de la base

---

## 🔧 Résolution de problèmes

### Le système ne charge pas?

**Vérifiez:**
- Le serveur Apache est démarré
- Vous êtes sur le bon réseau (accès à 192.168.5.76)
- Les fichiers sont bien copiés sur le serveur

**Solution rapide:**
```bash
# Sur le serveur Linux
sudo systemctl restart apache2
```

### Erreur "Impossible de charger les données"?

**Vérifiez:**
- Ouvrez la console du navigateur (F12)
- Regardez l'onglet "Console" pour voir l'erreur exacte
- Vérifiez que `http://192.168.5.76/api.php` est accessible

**Solution:**
- Assurez-vous que le fichier `api.php` existe sur le serveur
- Vérifiez les permissions du dossier

### La base de données ne se crée pas?

**Sur le serveur:**
```bash
cd /var/www/html
sudo touch visitors.db
sudo chown www-data:www-data visitors.db
sudo chmod 666 visitors.db
```

### Erreur de mot de passe admin?

Le mot de passe par défaut est: `7v5v822c`

Si vous l'avez changé et oublié:
1. Éditez le fichier `api.php` sur le serveur
2. Ligne 17, changez le mot de passe
3. Éditez aussi `script.js`, ligne 3

---

## 📊 Fonctionnalités

### ✅ Ce que le système fait:

- ✅ Enregistre les entrées et sorties des visiteurs
- ✅ Stocke les informations (nom, entreprise, email, téléphone, motif)
- ✅ Affiche qui est présent en temps réel
- ✅ Génère des statistiques quotidiennes
- ✅ Exporte les données en CSV
- ✅ Fonctionne sur plusieurs appareils simultanément
- ✅ Données centralisées sur le serveur
- ✅ Interface responsive (mobile, tablette, PC)

### 🎯 Cas d'usage:

- **Entreprises**: Suivi des visiteurs et livraisons
- **Événements**: Gestion des participants
- **Espaces de coworking**: Présences quotidiennes
- **Immeubles**: Contrôle d'accès visiteurs
- **Chantiers**: Suivi des intervenants

---

## 🆘 Support et aide

### Documentation complète:
- **INSTALLATION.md** - Installation détaillée sur serveur Apache
- **MIGRATION-SERVEUR.md** - Explications techniques de la migration
- **README.md** - Documentation générale du projet

### Test de l'API:
- Ouvrez `http://192.168.5.76/test-api.html`
- Testez chaque fonctionnalité individuellement
- Vérifiez les réponses du serveur

### Logs du serveur:
```bash
# Sur le serveur Linux
sudo tail -f /var/log/apache2/error.log
```

---

## 🎉 Vous êtes prêt !

Votre système est maintenant opérationnel à l'adresse:
**http://192.168.5.76/**

**Conseil**: Créez un raccourci ou un QR Code pointant vers cette URL pour faciliter l'accès aux visiteurs !

---

**Version:** 2.0 - Système client-serveur
**Date:** 17 Janvier 2025
**Support:** Consultez la documentation complète
