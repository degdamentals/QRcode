# 🔧 Guide de dépannage

## Outils de diagnostic disponibles

1. **diagnostic.php** - Diagnostic complet du système
   - Ouvrez: `http://192.168.5.76/diagnostic.php`
   - Vérifie: PHP, SQLite, permissions, base de données, Apache

2. **test-simple.html** - Tests API rapides
   - Ouvrez: `http://192.168.5.76/test-simple.html`
   - Tests en 3 clics pour vérifier l'API

3. **test-api.html** - Tests API détaillés
   - Ouvrez: `http://192.168.5.76/test-api.html`
   - Tests complets de tous les endpoints

---

## Problèmes fréquents et solutions

### 1. ❌ "Erreur de connexion" ou page ne charge pas

**Symptôme:** Le navigateur affiche "Impossible de se connecter" ou "ERR_CONNECTION_REFUSED"

**Solutions:**

```bash
# Vérifier qu'Apache est démarré
sudo systemctl status apache2

# Si Apache n'est pas démarré
sudo systemctl start apache2

# Redémarrer Apache
sudo systemctl restart apache2
```

**Vérifiez aussi:**
- Vous êtes bien sur le réseau local
- L'adresse IP est correcte: `192.168.5.76`
- Aucun firewall ne bloque le port 80

---

### 2. ❌ "Erreur de base de données" ou "PDO Extension"

**Symptôme:** Message d'erreur mentionnant SQLite ou PDO

**Solution:**

```bash
# Installer l'extension SQLite pour PHP
sudo apt-get update
sudo apt-get install php-sqlite3

# Redémarrer Apache
sudo systemctl restart apache2

# Vérifier que SQLite est bien installé
php -m | grep sqlite
# Devrait afficher: pdo_sqlite et sqlite3
```

---

### 3. ❌ "Le répertoire n'est pas accessible en écriture"

**Symptôme:** Impossible de créer la base de données

**Solution:**

```bash
# Aller dans le répertoire du site
cd /var/www/html

# Donner les permissions d'écriture
sudo chmod 755 .

# Si le fichier visitors.db existe déjà
sudo chmod 666 visitors.db
sudo chown www-data:www-data visitors.db
```

---

### 4. ❌ "Impossible de charger les données"

**Symptôme:** Message d'erreur dans l'interface admin

**Solutions:**

**A. Vérifier l'URL de l'API**

Ouvrez `script.js` et vérifiez la ligne 2:
```javascript
const API_URL = 'http://192.168.5.76/api.php';
```

**B. Tester l'API directement**

Ouvrez dans votre navigateur:
```
http://192.168.5.76/api.php?action=getToday
```

Vous devriez voir:
```json
{"visitors":[]}
```

Si vous voyez une erreur ou page blanche:
- Vérifiez les logs Apache: `sudo tail -f /var/log/apache2/error.log`
- Vérifiez que `api.php` existe sur le serveur

---

### 5. ❌ "Mot de passe incorrect" (alors qu'il est bon)

**Symptôme:** Le mot de passe admin ne fonctionne pas

**Solutions:**

**A. Vérifier le mot de passe dans les fichiers**

Dans `api.php` (ligne 60):
```php
define('ADMIN_PASSWORD', '7v5v822c');
```

Dans `script.js` (ligne 3):
```javascript
const ADMIN_PASSWORD = '7v5v822c';
```

Les deux DOIVENT être identiques!

**B. Vider le cache du navigateur**
- Chrome/Edge: Ctrl + Shift + Delete
- Firefox: Ctrl + Shift + Delete
- Cocher "Fichiers en cache" et "Cookies"

---

### 6. ❌ Page blanche ou erreur 500

**Symptôme:** La page ne s'affiche pas du tout

**Diagnostic:**

```bash
# Voir les erreurs Apache
sudo tail -20 /var/log/apache2/error.log

# Voir les dernières requêtes
sudo tail -20 /var/log/apache2/access.log
```

**Solutions courantes:**

**A. Erreur de syntaxe PHP**
```bash
# Tester la syntaxe de api.php
php -l /var/www/html/api.php
```

**B. Permissions incorrectes**
```bash
cd /var/www/html
ls -la
# Les fichiers doivent être lisibles (r--r--r-- ou 644)
sudo chmod 644 *.php *.html *.js *.css
```

---

### 7. ❌ "CORS policy" error dans la console

**Symptôme:** Erreur CORS dans la console du navigateur (F12)

**Solution:**

Vérifiez que le fichier `.htaccess` existe et contient:
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, X-Admin-Password"
```

Activez mod_headers:
```bash
sudo a2enmod headers
sudo systemctl restart apache2
```

---

### 8. ❌ Les données ne se sauvegardent pas

**Symptôme:** Vous pouvez enregistrer, mais les données disparaissent

**Diagnostic:**

```bash
# Vérifier si la base de données existe
ls -la /var/www/html/visitors.db

# Vérifier sa taille
du -h /var/www/html/visitors.db
# Si 0 ou très petit, il y a un problème
```

**Solutions:**

```bash
# Supprimer et recréer la base
cd /var/www/html
sudo rm visitors.db
sudo touch visitors.db
sudo chmod 666 visitors.db
sudo chown www-data:www-data visitors.db

# Tester en ajoutant un visiteur
# Puis vérifier la taille
du -h visitors.db
# Devrait être > 0
```

---

### 9. ❌ "Sélection invalide" dans sortie rapide

**Symptôme:** La sortie rapide ne fonctionne pas

**Cause:** Aucun visiteur n'est actuellement "présent" (pas d'entrée sans sortie)

**Solution:** Enregistrez d'abord une ENTRÉE, puis testez la sortie rapide

---

### 10. ❌ L'export CSV ne fonctionne pas

**Symptôme:** Clic sur "Exporter CSV" ne fait rien

**Solutions:**

**A. Vérifier la console (F12)**
- Ouvrez la console du navigateur
- Regardez s'il y a des erreurs JavaScript

**B. Vérifier qu'il y a des données**
- Vous devez être en mode admin
- Il doit y avoir au moins 1 visiteur enregistré

**C. Vérifier les popups**
- Autorisez les téléchargements/popups pour ce site

---

## Commandes utiles

### Voir les logs en temps réel
```bash
sudo tail -f /var/log/apache2/error.log
```

### Redémarrer Apache
```bash
sudo systemctl restart apache2
```

### Vérifier la configuration Apache
```bash
apache2ctl -t
# Devrait afficher: Syntax OK
```

### Voir les processus Apache
```bash
sudo systemctl status apache2
```

### Vérifier les modules Apache actifs
```bash
apache2ctl -M | grep -E "(rewrite|headers)"
# Devrait afficher:
#  rewrite_module (shared)
#  headers_module (shared)
```

### Tester la connexion au serveur
```bash
# Depuis un autre ordinateur du réseau
ping 192.168.5.76
curl http://192.168.5.76/api.php?action=getToday
```

---

## Checklist complète de vérification

Utilisez cette checklist si rien ne fonctionne:

- [ ] Apache est démarré: `sudo systemctl status apache2`
- [ ] Extension SQLite installée: `php -m | grep sqlite`
- [ ] Fichiers présents: `ls /var/www/html/`
- [ ] Permissions OK: `ls -la /var/www/html/`
- [ ] API accessible: Ouvrir `http://192.168.5.76/api.php?action=getToday`
- [ ] Pas d'erreur dans les logs: `sudo tail /var/log/apache2/error.log`
- [ ] Module headers activé: `a2enmod headers`
- [ ] Module rewrite activé: `a2enmod rewrite`
- [ ] Fichier .htaccess présent: `ls -la /var/www/html/.htaccess`
- [ ] Mot de passe identique dans api.php et script.js
- [ ] Cache navigateur vidé

---

## Besoin d'aide supplémentaire?

1. **Utilisez les outils de diagnostic:**
   - `http://192.168.5.76/diagnostic.php` - Diagnostic complet
   - `http://192.168.5.76/test-simple.html` - Tests rapides

2. **Consultez les logs:**
   ```bash
   sudo tail -50 /var/log/apache2/error.log
   ```

3. **Testez l'API manuellement:**
   ```bash
   curl -v http://192.168.5.76/api.php?action=getToday
   ```

4. **Vérifiez la configuration PHP:**
   - Créez un fichier `info.php` avec: `<?php phpinfo(); ?>`
   - Ouvrez: `http://192.168.5.76/info.php`
   - Cherchez "pdo_sqlite" dans la page

---

**La plupart des problèmes sont résolus par:**
1. Redémarrage d'Apache
2. Installation de SQLite
3. Correction des permissions
4. Vidage du cache navigateur

Bonne chance! 🍀
