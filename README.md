# Système de Gestion des Entrées/Sorties avec QR Code

Un système web moderne et autonome pour enregistrer les entrées et sorties des visiteurs dans votre entreprise.

## Fonctionnalités

### Pour les Visiteurs
- **Enregistrement autonome** via formulaire simple
- **Scan QR Code** pour accès rapide au site
- **Entrée et Sortie** en un clic
- **Sortie rapide** pour les visiteurs déjà enregistrés
- **Interface responsive** (mobile, tablette, desktop)
- **Confirmation visuelle** après chaque enregistrement

### Pour les Administrateurs
- **Tableau de bord en temps réel**
  - Nombre de visiteurs présents actuellement
  - Statistiques du jour (entrées/sorties)
  - Total des visites
- **Liste des visiteurs présents**
- **Historique complet** des enregistrements
- **Filtrage par date**
- **Export CSV** pour analyse externe
- **Gestion des données** (effacement)

## Installation

1. Clonez ce dépôt:
```bash
git clone https://github.com/degdamentals/QRcode.git
cd QRcode
```

2. Ouvrez `index.html` dans votre navigateur

Aucune installation ou serveur requis! Le système fonctionne entièrement côté client.

## Utilisation

### Configuration du QR Code

1. **Hébergez le site** sur une plateforme gratuite:
   - [GitHub Pages](https://pages.github.com/)
   - [Netlify](https://www.netlify.com/)
   - [Vercel](https://vercel.com/)

2. **Générez un QR Code** pointant vers votre URL:
   - Utilisez [QR Code Generator](https://www.qr-code-generator.com/)
   - Ou [QR Monkey](https://www.qrcode-monkey.com/)

3. **Imprimez et placez** le QR Code à l'entrée de votre entreprise

### Accès Administrateur

- Cliquez sur **"Accès administrateur"** en bas de page
- Mot de passe par défaut: `admin123`
- **Important**: Changez le mot de passe dans `script.js` ligne 2

```javascript
const ADMIN_PASSWORD = 'votre_nouveau_mot_de_passe';
```

### Enregistrement des Visiteurs

1. Le visiteur scanne le QR Code ou accède à l'URL
2. Il remplit le formulaire avec ses informations
3. Il clique sur **"Enregistrer une ENTRÉE"**
4. À la sortie, il clique sur **"Enregistrer une SORTIE"**

### Sortie Rapide

Pour les visiteurs déjà enregistrés:
1. Cliquez sur **"Enregistrer une sortie rapide"**
2. Sélectionnez votre nom dans la liste
3. Votre sortie est enregistrée instantanément

## Stockage des Données

Les données sont stockées localement dans le navigateur (localStorage):
- ✅ Pas besoin de base de données
- ✅ Aucun coût de serveur
- ✅ Données persistantes
- ⚠️ Les données sont liées au navigateur utilisé

**Note**: Pour une utilisation en production avec plusieurs appareils, il est recommandé d'intégrer une base de données cloud (Firebase, Supabase, etc.)

## Technologies Utilisées

- **HTML5** - Structure
- **CSS3** - Styling moderne avec animations
- **JavaScript Vanilla** - Logique applicative
- **LocalStorage API** - Stockage des données

## Personnalisation

### Changer les Couleurs

Modifiez les variables CSS dans `styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
}
```

### Ajouter des Champs au Formulaire

1. Ajoutez le champ HTML dans `index.html`
2. Récupérez la valeur dans `script.js` (fonction `handleFormSubmit`)
3. Ajoutez la colonne dans l'export CSV (fonction `exportToCSV`)

### Modifier les Motifs de Visite

Dans `index.html`, ligne 51-57, modifiez les options:

```html
<select id="visitReason" name="visitReason">
    <option value="meeting">Réunion</option>
    <option value="delivery">Livraison</option>
    <!-- Ajoutez vos propres motifs -->
</select>
```

## Sécurité

- ⚠️ Le mot de passe admin est stocké en clair dans le code
- ⚠️ Pour une utilisation professionnelle, implémentez une vraie authentification
- ⚠️ Les données localStorage sont accessibles via les outils développeur du navigateur
- ✅ Aucune donnée n'est envoyée à des serveurs externes

## Améliorations Futures

- [ ] Backend avec base de données
- [ ] Authentification sécurisée
- [ ] Notifications email automatiques
- [ ] Photo des visiteurs
- [ ] Badges d'accès imprimables
- [ ] Gestion multi-sites
- [ ] API REST
- [ ] Application mobile native

## Support Navigateurs

- ✅ Chrome/Edge (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Licence

MIT License - Libre d'utilisation et de modification

## Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## Contact

Pour toute question ou suggestion, ouvrez une issue sur GitHub.

---

**Développé avec ❤️ pour faciliter la gestion des accès en entreprise**
