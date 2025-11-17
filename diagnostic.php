<?php
// Script de diagnostic pour identifier les problèmes

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Diagnostic du Système QR Code</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .test { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 20px; }
        pre { background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc; }
    </style>
</head>
<body>
    <h1>🔧 Diagnostic du Système QR Code</h1>

    <div class="test">
        <h2>1. Version PHP</h2>
        <?php
        echo "Version PHP: <strong>" . phpversion() . "</strong><br>";
        if (version_compare(phpversion(), '7.4.0', '>=')) {
            echo "<span class='success'>✓ PHP 7.4+ détecté</span>";
        } else {
            echo "<span class='error'>✗ PHP version insuffisante (requis: 7.4+)</span>";
        }
        ?>
    </div>

    <div class="test">
        <h2>2. Extension SQLite</h2>
        <?php
        if (extension_loaded('pdo_sqlite')) {
            echo "<span class='success'>✓ Extension PDO SQLite chargée</span><br>";
            $sqliteVersion = SQLite3::version();
            echo "Version SQLite: <strong>" . $sqliteVersion['versionString'] . "</strong>";
        } else {
            echo "<span class='error'>✗ Extension PDO SQLite NON disponible</span><br>";
            echo "<strong>Solution:</strong> Installez php-sqlite3 et redémarrez Apache";
        }
        ?>
    </div>

    <div class="test">
        <h2>3. Permissions du répertoire</h2>
        <?php
        $dir = __DIR__;
        echo "Répertoire actuel: <code>$dir</code><br>";

        if (is_writable($dir)) {
            echo "<span class='success'>✓ Répertoire accessible en écriture</span><br>";
        } else {
            echo "<span class='error'>✗ Répertoire NON accessible en écriture</span><br>";
            echo "<strong>Solution:</strong> <code>chmod 755 $dir</code><br>";
        }

        // Test création de fichier
        $testFile = $dir . '/test_write.txt';
        $canWrite = @file_put_contents($testFile, 'test');
        if ($canWrite !== false) {
            echo "<span class='success'>✓ Peut créer des fichiers</span><br>";
            @unlink($testFile);
        } else {
            echo "<span class='error'>✗ Impossible de créer des fichiers</span><br>";
        }
        ?>
    </div>

    <div class="test">
        <h2>4. Base de données</h2>
        <?php
        $dbFile = __DIR__ . '/visitors.db';
        echo "Fichier DB: <code>$dbFile</code><br>";

        if (file_exists($dbFile)) {
            echo "<span class='success'>✓ Fichier visitors.db existe</span><br>";
            if (is_writable($dbFile)) {
                echo "<span class='success'>✓ Base de données accessible en écriture</span><br>";
            } else {
                echo "<span class='error'>✗ Base de données NON accessible en écriture</span><br>";
                echo "<strong>Solution:</strong> <code>chmod 666 $dbFile</code><br>";
            }
        } else {
            echo "<span class='warning'>⚠ Fichier visitors.db n'existe pas encore (sera créé au premier enregistrement)</span><br>";
        }

        // Test de connexion
        if (extension_loaded('pdo_sqlite')) {
            try {
                $db = new PDO('sqlite:' . $dbFile);
                $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                echo "<span class='success'>✓ Connexion à la base de données réussie</span><br>";

                // Créer la table si elle n'existe pas
                $db->exec("CREATE TABLE IF NOT EXISTS visitors (
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
                )");
                echo "<span class='success'>✓ Table 'visitors' créée/vérifiée</span><br>";

                // Compter les enregistrements
                $count = $db->query("SELECT COUNT(*) FROM visitors")->fetchColumn();
                echo "Nombre d'enregistrements: <strong>$count</strong><br>";

            } catch (PDOException $e) {
                echo "<span class='error'>✗ Erreur de connexion: " . htmlspecialchars($e->getMessage()) . "</span><br>";
            }
        }
        ?>
    </div>

    <div class="test">
        <h2>5. Fichiers requis</h2>
        <?php
        $requiredFiles = ['index.html', 'script.js', 'styles.css', 'api.php'];
        foreach ($requiredFiles as $file) {
            $path = __DIR__ . '/' . $file;
            if (file_exists($path)) {
                echo "<span class='success'>✓ $file</span><br>";
            } else {
                echo "<span class='error'>✗ $file MANQUANT</span><br>";
            }
        }
        ?>
    </div>

    <div class="test">
        <h2>6. Configuration Apache</h2>
        <?php
        echo "Document Root: <code>" . $_SERVER['DOCUMENT_ROOT'] . "</code><br>";
        echo "Server Software: <code>" . $_SERVER['SERVER_SOFTWARE'] . "</code><br>";
        echo "Script Filename: <code>" . $_SERVER['SCRIPT_FILENAME'] . "</code><br>";

        // Vérifier mod_rewrite
        if (function_exists('apache_get_modules')) {
            $modules = apache_get_modules();
            if (in_array('mod_rewrite', $modules)) {
                echo "<span class='success'>✓ mod_rewrite activé</span><br>";
            } else {
                echo "<span class='warning'>⚠ mod_rewrite non détecté</span><br>";
            }
        } else {
            echo "<span class='warning'>⚠ Impossible de vérifier les modules Apache</span><br>";
        }
        ?>
    </div>

    <div class="test">
        <h2>7. Test de l'API</h2>
        <?php
        echo "<strong>URL de l'API:</strong> <code>http://192.168.5.76/api.php</code><br><br>";
        echo "<a href='api.php?action=getToday' target='_blank' style='display:inline-block; padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;'>
            Tester l'API (getToday)
        </a>";
        ?>
    </div>

    <div class="test">
        <h2>8. Headers HTTP</h2>
        <?php
        if (function_exists('getallheaders')) {
            echo "<pre>";
            print_r(getallheaders());
            echo "</pre>";
        } else {
            echo "Headers:<br>";
            foreach ($_SERVER as $key => $value) {
                if (strpos($key, 'HTTP_') === 0) {
                    echo htmlspecialchars($key) . ": " . htmlspecialchars($value) . "<br>";
                }
            }
        }
        ?>
    </div>

    <div class="test">
        <h2>9. Informations PHP</h2>
        <details>
            <summary style="cursor:pointer; color:#4CAF50; font-weight:bold;">Afficher phpinfo() complet</summary>
            <?php phpinfo(); ?>
        </details>
    </div>

    <div class="test">
        <h2>📋 Résumé et Actions</h2>
        <ol>
            <li>Si SQLite n'est pas installé: <code>sudo apt-get install php-sqlite3 && sudo systemctl restart apache2</code></li>
            <li>Si problème de permissions: <code>sudo chmod 755 <?php echo __DIR__; ?></code></li>
            <li>Si la base existe mais n'est pas accessible: <code>sudo chmod 666 <?php echo $dbFile; ?></code></li>
            <li>Vérifier les logs Apache: <code>sudo tail -f /var/log/apache2/error.log</code></li>
        </ol>
    </div>

    <div style="text-align:center; margin-top:30px;">
        <a href="index.html" style="padding:10px 20px; background:#2196F3; color:white; text-decoration:none; border-radius:5px; margin:5px;">
            ← Retour au système
        </a>
        <a href="test-api.html" style="padding:10px 20px; background:#FF9800; color:white; text-decoration:none; border-radius:5px; margin:5px;">
            Tests API détaillés →
        </a>
    </div>
</body>
</html>
