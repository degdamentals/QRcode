<?php
// Afficher les erreurs PHP pour le débogage (à désactiver en production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactivé pour ne pas casser le JSON
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Password');

// Répondre aux requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fonctions utilitaires (définies en premier)
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $code = 400) {
    sendResponse(['error' => $message], $code);
}

// Configuration de la base de données SQLite
$dbFile = __DIR__ . '/visitors.db';

try {
    // Vérifier si le répertoire est accessible en écriture
    if (!is_writable(__DIR__)) {
        sendError('Le répertoire n\'est pas accessible en écriture. Vérifiez les permissions.', 500);
    }

    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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

} catch (PDOException $e) {
    sendError('Erreur de connexion à la base de données: ' . $e->getMessage(), 500);
}

// Mot de passe administrateur (à changer)
define('ADMIN_PASSWORD', '7v5v822c');

// Fonction pour récupérer les headers (compatible tous serveurs)
function getRequestHeadersSafe() {
    if (function_exists('getallheaders')) {
        return getallheaders();
    }

    // Fallback pour les serveurs qui n'ont pas getallheaders()
    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
        }
    }
    return $headers;
}

function verifyAdminPassword() {
    $headers = getRequestHeadersSafe();
    $password = isset($headers['X-Admin-Password']) ? $headers['X-Admin-Password'] : '';

    if ($password !== ADMIN_PASSWORD) {
        sendError('Mot de passe administrateur invalide', 403);
    }
}

// Routeur simple
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    switch ($action) {
        case 'add':
            // Ajouter un visiteur (entrée ou sortie)
            if ($method !== 'POST') {
                sendError('Méthode non autorisée', 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['name']) || empty(trim($input['name']))) {
                sendError('Le nom est requis');
            }

            if (!isset($input['action']) || !in_array($input['action'], ['entry', 'exit'])) {
                sendError('Action invalide (entry ou exit requis)');
            }

            $stmt = $db->prepare("INSERT INTO visitors (id, name, company, email, phone, visitReason, action, timestamp, date, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $input['id'],
                $input['name'],
                $input['company'] ?? '',
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $input['visitReason'] ?? '',
                $input['action'],
                $input['timestamp'],
                $input['date'],
                $input['time']
            ]);

            sendResponse(['success' => true, 'message' => 'Visiteur enregistré']);
            break;

        case 'getAll':
            // Récupérer tous les visiteurs (admin seulement)
            if ($method !== 'GET') {
                sendError('Méthode non autorisée', 405);
            }

            verifyAdminPassword();

            $stmt = $db->query("SELECT * FROM visitors ORDER BY timestamp DESC");
            $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendResponse(['visitors' => $visitors]);
            break;

        case 'getToday':
            // Récupérer les visiteurs du jour (pour sortie rapide)
            if ($method !== 'GET') {
                sendError('Méthode non autorisée', 405);
            }

            $today = date('d/m/Y');
            $stmt = $db->prepare("SELECT * FROM visitors WHERE date = ? ORDER BY timestamp DESC");
            $stmt->execute([$today]);
            $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendResponse(['visitors' => $visitors]);
            break;

        case 'verifyPassword':
            // Vérifier le mot de passe admin
            if ($method !== 'POST') {
                sendError('Méthode non autorisée', 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $password = isset($input['password']) ? $input['password'] : '';

            if ($password === ADMIN_PASSWORD) {
                sendResponse(['valid' => true]);
            } else {
                sendResponse(['valid' => false]);
            }
            break;

        case 'clearAll':
            // Effacer toutes les données (admin seulement)
            if ($method !== 'DELETE') {
                sendError('Méthode non autorisée', 405);
            }

            verifyAdminPassword();

            $db->exec("DELETE FROM visitors");
            sendResponse(['success' => true, 'message' => 'Toutes les données ont été effacées']);
            break;

        case 'stats':
            // Obtenir les statistiques (admin seulement)
            if ($method !== 'GET') {
                sendError('Méthode non autorisée', 405);
            }

            verifyAdminPassword();

            $today = date('d/m/Y');

            // Total de visites
            $total = $db->query("SELECT COUNT(*) as count FROM visitors")->fetch(PDO::FETCH_ASSOC)['count'];

            // Entrées aujourd'hui
            $todayEntries = $db->prepare("SELECT COUNT(*) as count FROM visitors WHERE date = ? AND action = 'entry'");
            $todayEntries->execute([$today]);
            $todayEntriesCount = $todayEntries->fetch(PDO::FETCH_ASSOC)['count'];

            // Sorties aujourd'hui
            $todayExits = $db->prepare("SELECT COUNT(*) as count FROM visitors WHERE date = ? AND action = 'exit'");
            $todayExits->execute([$today]);
            $todayExitsCount = $todayExits->fetch(PDO::FETCH_ASSOC)['count'];

            sendResponse([
                'total' => $total,
                'todayEntries' => $todayEntriesCount,
                'todayExits' => $todayExitsCount
            ]);
            break;

        default:
            sendError('Action non reconnue', 404);
    }
} catch (PDOException $e) {
    sendError('Erreur de base de données: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>
