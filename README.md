# Système de Gestion des Entrées/Sorties avec QR Code

Un système web moderne pour enregistrer les entrées et sorties des visiteurs. Données centralisées sur serveur Apache avec base SQLite.

## 🚀 Installation Rapide

### Prérequis
- Serveur Apache avec PHP 7.4+
- Extension PHP SQLite (php-sqlite3)
- Modules Apache: mod_headers, mod_rewrite

### Installation en 5 minutes

```bash
# 1. Installer SQLite
sudo apt-get update && sudo apt-get install -y php-sqlite3

# 2. Activer modules Apache
sudo a2enmod headers rewrite

# 3. Copier les fichiers dans /var/www/html/
# (index.html, script.js, styles.css, api.php, .htaccess)

# 4. Configurer permissions
cd /var/www/html
sudo chmod 755 .
sudo chmod 644 *.php *.html *.js *.css .htaccess

# 5. Redémarrer Apache
sudo systemctl restart apache2

# 6. Tester
curl http://VOTRE_IP/api.php?action=getToday
# Devrait retourner: {"visitors":[]}
```

### Configuration

**Changer le mot de passe admin (IMPORTANT!):**

Dans `api.php` ligne 60:
```php
define('ADMIN_PASSWORD', 'VOTRE_NOUVEAU_MDP');
```

Dans `script.js` ligne 3:
```javascript
const ADMIN_PASSWORD = 'VOTRE_NOUVEAU_MDP';
```

**Configurer l'URL du serveur:**

Dans `script.js` ligne 2:
```javascript
const API_URL = 'http://VOTRE_IP/api.php';
```

## 📱 Utilisation

### Pour les visiteurs

**Enregistrer une ENTRÉE:**
1. Ouvrir l'URL du système
2. Remplir le formulaire (nom obligatoire)
3. Cliquer "Enregistrer une ENTRÉE"

**Enregistrer une SORTIE:**
- Option 1: Cliquer "Enregistrer une sortie rapide" et sélectionner son nom
- Option 2: Remplir le formulaire et cliquer "Enregistrer une SORTIE"

### Pour les administrateurs

**Accès admin:**
1. Cliquer "Accès administrateur" (bas de page)
2. Entrer le mot de passe (par défaut: `7v5v822c`)

**Fonctionnalités admin:**
- Vue des visiteurs présents en temps réel
- Statistiques du jour (entrées/sorties)
- Historique complet avec filtrage par date
- Export CSV des données
- Suppression des données

## 🔧 Diagnostic et Dépannage

### Outils de diagnostic

**diagnostic.php** - Ouvrir `http://VOTRE_IP/diagnostic.php`
- Vérifie PHP, SQLite, permissions, base de données
- Affiche les erreurs avec solutions

**test-simple.html** - Ouvrir `http://VOTRE_IP/test-simple.html`
- Tests rapides en 3 clics
- Vérifie connexion, ajout visiteur, récupération données

### Problèmes fréquents

**1. "Erreur de connexion"**
```bash
# Vérifier qu'Apache est démarré
sudo systemctl status apache2
sudo systemctl restart apache2
```

**2. "Erreur de base de données" / "PDO Extension"**
```bash
# Installer SQLite
sudo apt-get install php-sqlite3
sudo systemctl restart apache2

# Vérifier
php -m | grep sqlite
```

**3. "Répertoire non accessible en écriture"**
```bash
cd /var/www/html
sudo chmod 755 .
sudo chmod 666 visitors.db  # si existe
```

**4. "CORS policy error"**
```bash
sudo a2enmod headers
sudo systemctl restart apache2
```

**5. Page blanche / Erreur 500**
```bash
# Voir les logs
sudo tail -20 /var/log/apache2/error.log
```

**6. Les données ne se sauvegardent pas**
```bash
# Créer/recréer la base
cd /var/www/html
sudo rm visitors.db
sudo touch visitors.db
sudo chmod 666 visitors.db
sudo chown www-data:www-data visitors.db
```

### Checklist de vérification

- [ ] Apache démarré: `sudo systemctl status apache2`
- [ ] SQLite installé: `php -m | grep sqlite`
- [ ] Fichiers présents: `ls /var/www/html/api.php`
- [ ] Permissions OK: `ls -la /var/www/html/`
- [ ] Modules actifs: `apache2ctl -M | grep -E "(rewrite|headers)"`
- [ ] API répond: `curl http://VOTRE_IP/api.php?action=getToday`

### Logs et commandes utiles

```bash
# Logs Apache en temps réel
sudo tail -f /var/log/apache2/error.log

# Vérifier syntaxe PHP
php -l /var/www/html/api.php

# Tester connexion SQLite
php -r "new PDO('sqlite:/var/www/html/visitors.db');"

# Voir modules Apache
apache2ctl -M
```

## 🏗️ Architecture

### Structure des fichiers
```
/var/www/html/
├── index.html          # Interface principale
├── script.js           # Logique frontend + appels API
├── styles.css          # Styles
├── api.php             # API REST backend
├── .htaccess           # Configuration Apache (CORS, sécurité)
├── visitors.db         # Base SQLite (créée auto)
├── diagnostic.php      # Outil de diagnostic
└── test-simple.html    # Tests API rapides
```

### API Endpoints

**Public (sans auth):**
- `GET /api.php?action=getToday` - Visiteurs du jour
- `POST /api.php?action=add` - Ajouter entrée/sortie
- `POST /api.php?action=verifyPassword` - Vérifier mot de passe admin

**Admin (auth requise via header X-Admin-Password):**
- `GET /api.php?action=getAll` - Tous les visiteurs
- `GET /api.php?action=stats` - Statistiques
- `DELETE /api.php?action=clearAll` - Effacer données

### Base de données

**Table: visitors**
```sql
CREATE TABLE visitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    visitReason TEXT,
    action TEXT NOT NULL,      -- 'entry' ou 'exit'
    timestamp TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
)
```

## 🛡️ Sécurité

**Implémenté:**
- ✅ Base de données SQLite protégée (.htaccess)
- ✅ Authentification admin par mot de passe
- ✅ CORS configuré pour éviter accès externe
- ✅ Validation des données côté serveur
- ✅ Préparation des requêtes SQL (protection injection)

**Recommandations:**
- ⚠️ Changez le mot de passe par défaut
- ⚠️ Configurez HTTPS (Let's Encrypt)
- ⚠️ Sauvegardez régulièrement visitors.db
- ⚠️ Limitez l'accès réseau au serveur

### Sauvegarde automatique

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/qrcode"
mkdir -p $BACKUP_DIR
cp /var/www/html/visitors.db $BACKUP_DIR/visitors_$DATE.db
# Garder 30 dernières sauvegardes
ls -t $BACKUP_DIR/visitors_*.db | tail -n +31 | xargs rm -f
```

Ajouter au crontab: `0 2 * * * /path/to/backup.sh`

## 📊 Fonctionnalités

### Frontend
- ✅ Formulaire d'entrée/sortie responsive
- ✅ Sortie rapide pour visiteurs enregistrés
- ✅ Validation formulaire
- ✅ Messages de confirmation
- ✅ Interface admin complète

### Backend
- ✅ API REST en PHP
- ✅ Base SQLite (création auto)
- ✅ Authentification admin
- ✅ Gestion d'erreurs robuste
- ✅ Logs d'erreurs PHP

### Admin
- ✅ Statistiques temps réel
- ✅ Liste visiteurs présents
- ✅ Historique avec filtrage
- ✅ Export CSV
- ✅ Suppression données

## 🔄 Migration depuis localStorage

Si vous aviez l'ancienne version (localStorage):
1. Exportez les données CSV depuis l'ancien système
2. Les données ne seront pas migrées automatiquement
3. Le nouveau système fonctionne avec base serveur

## 🌐 Support Navigateurs

- ✅ Chrome/Edge (version récente)
- ✅ Firefox (version récente)
- ✅ Safari (version récente)
- ✅ Opera (version récente)

## 📝 Personnalisation

**Modifier les motifs de visite:**

Dans `index.html` lignes 51-57:
```html
<select id="visitReason" name="visitReason">
    <option value="meeting">Réunion</option>
    <option value="delivery">Livraison</option>
    <!-- Ajoutez vos motifs -->
</select>
```

**Changer les couleurs:**

Dans `styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --success-color: #10b981;
    --danger-color: #ef4444;
}
```

## 📄 Licence

MIT License - Libre d'utilisation et modification

## 🤝 Contribution

Les pull requests sont bienvenues! Pour des changements majeurs, ouvrez d'abord une issue.

## 📞 Support

Pour signaler un bug ou demander une fonctionnalité, ouvrez une issue sur GitHub.

---

**Version:** 2.0 - Système client-serveur
**Serveur:** Apache + PHP 7.4+ + SQLite
**Développé avec ❤️ pour faciliter la gestion des accès**
