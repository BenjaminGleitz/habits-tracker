# Habit Tracker (React Native + Expo + Supabase)

Application mobile cross-platform (Android + iOS) de suivi d’habitudes, avec authentification, CRUD, stockage distant via Supabase, gestion d’état (loading / erreur), fallback offline minimal, et fonctionnalité native de rappels locaux.

---

## 1) Pourquoi React Native (et pas Flutter) ?

J’ai choisi **React Native avec Expo** pour les raisons suivantes :

- **Un seul codebase TypeScript** pour Android et iOS.
- **Développement rapide** (Expo Go, itérations rapides, API natives accessibles).
- **Écosystème mature** pour la navigation, Supabase, stockage local et notifications.
- **Lisibilité / maintenabilité** facilitée par une séparation claire `screens / services / navigation / types`.

---

## 2) Stack technique

- **Framework mobile** : React Native (Expo)
- **Langage** : TypeScript
- **Navigation** : React Navigation (stack auth + stack app)
- **Backend / BDD / Auth** : Supabase
- **Stockage local** : AsyncStorage
- **Feature native** : notifications locales planifiées (`expo-notifications`)

---

## 3) Fonctionnalités implémentées

### Authentification
- Inscription
- Connexion
- Déconnexion
- Données liées à l’utilisateur authentifié

### Navigation multi-écrans
- Écran d’authentification : `Login`, `Register`
- Écran liste : `Home`
- Écran détail : `HabitDetail`
- Écran ajout / édition : `HabitForm`
- Écran paramètres : `Settings`

### CRUD habitudes
- Créer une habitude
- Lire la liste des habitudes
- Voir le détail d’une habitude
- Modifier une habitude
- Supprimer une habitude

### États UI
- `loading` sur les écrans principaux
- gestion d’erreurs (alertes, retry sur détail)
- succès fonctionnel (création / modification / suppression / rappel)

### Appels API + données distantes (Supabase)
- Auth Supabase
- CRUD asynchrone sur la table `habits`
- Suivi journalier via `habit_logs`

### Fallback offline minimal
- Cache local des habitudes (par utilisateur) via `AsyncStorage`
- En cas d’échec réseau, affichage des dernières données locales chargées

### Fonctionnalité native obligatoire
- Rappels d’habitudes via **notifications locales planifiées**
- Demande de permission notifications au moment opportun
- Gestion explicite du refus de permission

---

## 4) Structure du projet

```text
.
├── App.tsx
├── app.json
├── package.json
└── src
    ├── navigation
    │   ├── RootNavigator.tsx
    │   ├── AuthStack.tsx
    │   └── AppStack.tsx
    ├── screens
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── HabitDetailScreen.tsx
    │   ├── HabitFormScreen.tsx
    │   └── SettingsScreen.tsx
    ├── services
    │   ├── supabaseClient.ts
    │   ├── authService.ts
    │   ├── habitService.ts
    │   └── reminderService.ts
    ├── types
    │   ├── navigation.ts
    │   ├── habit.ts
    │   └── expo-notifications.d.ts
    └── theme.ts
```

Principe d’architecture :
- Les **screens** gèrent l’UI et les interactions utilisateur.
- Les **services** gèrent l’accès aux APIs (Supabase) et au natif (notifications).
- La **navigation** est centralisée et découplée.
- Les **types** regroupent les modèles et contrats TypeScript.

---

## 5) Prérequis

- Node.js 18+ (recommandé : LTS)
- npm
- Expo CLI via `npx expo ...` (pas besoin d’installation globale)
- Un projet Supabase actif (Auth email/password + tables)

---

## 6) Installation & lancement

```bash
npm install
npx expo start
```

Puis lancer :
- `a` pour Android (émulateur)
- `i` pour iOS (simulateur macOS)
- ou scanner le QR code avec Expo Go

Scripts utiles :

```bash
npm run start
npm run android
npm run ios
npm run web
```

---

## 7) Configuration Supabase

Le projet utilise un client Supabase dans `src/services/supabaseClient.ts`.

> Recommandation pour un rendu propre : passer les clés Supabase via variables d’environnement (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) et documenter la procédure dans ce README.

### Tables minimales attendues

#### `habits`
- `id` (uuid, pk)
- `user_id` (uuid, lien user auth)
- `title` (text)
- `description` (text nullable)
- `created_at` (timestamp)

#### `habit_logs`
- `habit_id`
- `user_id`
- `date`
- `done`
- contrainte unique recommandée : `(habit_id, user_id, date)`

---

## 8) Démonstration attendue (vidéo)

La vidéo de démonstration doit montrer :

1. Navigation complète : `login → liste → détail → paramètres`
2. CRUD complet : ajout, modification, suppression
3. Persistance des données après redémarrage
4. Appels API + cas `loading` + cas erreur simulée
5. Feature native notifications : permission accordée / refusée + rappel réel
6. Explication courte de l’architecture et des choix techniques

Lien vidéo : **à ajouter ici**.

---

## 9) Captures d’écran

Ajouter les captures dans un dossier `docs/screenshots/` puis les référencer ici.

- Authentification  
  `![auth](docs/screenshots/auth.png)`
- Liste des habitudes  
  `![list](docs/screenshots/list.png)`
- Détail habitude  
  `![detail](docs/screenshots/detail.png)`
- Rappel natif (permission / confirmation)  
  `![native](docs/screenshots/native-reminder.png)`

---

## 10) Points d’amélioration possibles

- Renforcer la politique de cache offline (synchronisation plus fine, invalidation).
- Ajouter tests unitaires/intégration (services + logique écran).
- Passer toutes les configurations sensibles via variables d’environnement.
- Ajouter indicateurs UX explicites pour les états de succès.

---

## 11) Auteur

Projet réalisé dans le cadre de l’évaluation “Développement mobile cross-platform”.