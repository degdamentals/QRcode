# Instructions d'installation sur le serveur Apache

## Prérequis
- Serveur Apache avec PHP 7.4 ou supérieur
- Extension PHP SQLite activée (php-sqlite3)
- Module Apache mod_rewrite activé
- Module Apache mod_headers activé

## Étapes d'installation

### 1. Copier les fichiers sur le serveur

Transférez tous les fichiers du dossier `QRcode` vers le répertoire racine de votre serveur Apache à l'adresse `http://192.168.5.76/` :

```
QRcode/
├── index.html
├── script.js
├── styles.css
├── api.php
├── .htaccess
└── INSTALLATION.md
```

### 2. Configurer les permissions

Sur le serveur, assurez-vous que le répertoire a les bonnes permissions pour créer la base de données :

```bash
# Se connecter au serveur
cd /var/www/html/  # ou le chemin de votre serveur Apache

# Donner les permissions d'écriture
chmod 755 .
chmod 666 visitors.db  # Une fois le fichier créé
```

### 3. Vérifier les modules Apache

Assurez-vous que les modules nécessaires sont activés :

```bash
# Activer mod_rewrite
sudo a2enmod rewrite

# Activer mod_headers
sudo a2enmod headers

# Redémarrer Apache
sudo systemctl restart apache2
```

### 4. Vérifier l'extension SQLite de PHP

```bash
# Vérifier si SQLite est installé
php -m | grep sqlite

# Si absent, installer (Ubuntu/Debian)
sudo apt-get install php-sqlite3

# Redémarrer Apache
sudo systemctl restart apache2
```

### 5. Tester l'installation

1. Ouvrez votre navigateur et allez à : `http://192.168.5.76/`
2. Vous devriez voir le formulaire d'enregistrement
3. Testez en enregistrant une entrée
4. Vérifiez que le fichier `visitors.db` a été créé dans le répertoire

### 6. Accès administrateur

- URL : `http://192.168.5.76/`
- Cliquez sur "Accès administrateur" en bas de page
- Mot de passe : `7v5v822c`

**IMPORTANT : Changez le mot de passe dès que possible !**

## Changer le mot de passe administrateur

Pour changer le mot de passe :

1. Ouvrez le fichier `api.php`
2. Trouvez la ligne : `define('ADMIN_PASSWORD', '7v5v822c');`
3. Remplacez `7v5v822c` par votre nouveau mot de passe
4. Sauvegardez le fichier

5. Ouvrez le fichier `script.js`
6. Trouvez la ligne : `const ADMIN_PASSWORD = '7v5v822c';`
7. Remplacez `7v5v822c` par le même mot de passe
8. Sauvegardez le fichier

## Sécurité

### Protection de la base de données
Le fichier `.htaccess` empêche l'accès direct au fichier `visitors.db` via le navigateur.

### HTTPS (Recommandé)
Pour une sécurité maximale, configurez HTTPS sur votre serveur :

```bash
# Installer Certbot (Let's Encrypt)
sudo apt-get install certbot python3-certbot-apache

# Obtenir un certificat SSL
sudo certbot --apache
```

### Sauvegarde automatique

Créez un script de sauvegarde automatique :

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/qrcode"
DB_FILE="/var/www/html/visitors.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/visitors_$DATE.db

# Garder seulement les 30 dernières sauvegardes
ls -t $BACKUP_DIR/visitors_*.db | tail -n +31 | xargs rm -f
```

Ajoutez au crontab :
```bash
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /path/to/backup.sh
```

## Dépannage

### La base de données ne se crée pas
- Vérifiez les permissions du répertoire : `ls -la`
- Vérifiez que PHP a l'extension SQLite : `php -m | grep sqlite`

### Erreur CORS
- Vérifiez que mod_headers est activé
- Vérifiez le fichier .htaccess

### Impossible de se connecter
- Vérifiez que l'URL de l'API dans script.js est correcte : `http://192.168.5.76/api.php`
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### Page blanche
- Vérifiez les logs Apache : `sudo tail -f /var/log/apache2/error.log`
- Vérifiez les erreurs PHP

## Support

Pour toute question ou problème, consultez les logs :
```bash
# Logs Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# Logs PHP
sudo tail -f /var/log/php/error.log
```
