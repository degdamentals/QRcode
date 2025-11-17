@echo off
echo ========================================
echo  Deploiement du systeme QR Code
echo  Serveur: http://192.168.5.76/
echo ========================================
echo.

REM Configuration - Modifiez ces variables selon votre configuration
set SERVER_PATH=\\192.168.5.76\www
set LOCAL_PATH=%~dp0

echo Verification du chemin serveur...
if not exist "%SERVER_PATH%" (
    echo ERREUR: Le chemin serveur n'est pas accessible: %SERVER_PATH%
    echo.
    echo Verifiez que:
    echo - Le serveur est accessible sur le reseau
    echo - Vous avez les permissions d'ecriture
    echo - Le partage reseau est configure
    echo.
    pause
    exit /b 1
)

echo.
echo Copie des fichiers vers le serveur...
echo.

REM Copier les fichiers necessaires
copy /Y "%LOCAL_PATH%index.html" "%SERVER_PATH%\"
copy /Y "%LOCAL_PATH%script.js" "%SERVER_PATH%\"
copy /Y "%LOCAL_PATH%styles.css" "%SERVER_PATH%\"
copy /Y "%LOCAL_PATH%api.php" "%SERVER_PATH%\"
copy /Y "%LOCAL_PATH%.htaccess" "%SERVER_PATH%\"
copy /Y "%LOCAL_PATH%test-api.html" "%SERVER_PATH%\"

echo.
echo ========================================
echo  Deploiement termine !
echo ========================================
echo.
echo Prochaines etapes:
echo.
echo 1. Ouvrez http://192.168.5.76/test-api.html
echo    pour tester l'API
echo.
echo 2. Si tous les tests passent, ouvrez
echo    http://192.168.5.76/
echo    pour utiliser le systeme
echo.
echo 3. Mot de passe admin: 7v5v822c
echo    (Pensez a le changer!)
echo.
pause
