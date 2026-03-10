# État d'avancement — Évaluation Développement Mobile Cross-Platform

## ✅ Ce qui est déjà fait

### 1) Framework + base projet
- Projet en **React Native (Expo)**.
- Architecture multi-dossiers (`navigation`, `screens`, `services`, `types`).

### 2) Authentification
- **Inscription** (email + mot de passe).
- **Connexion**.
- **Déconnexion**.
- La navigation bascule correctement entre stack auth et stack app selon la session Supabase.

### 3) Navigation & écrans minimum
Écrans présents :
- Authentification : `Login` + `Register`.
- Liste : `Home` (liste des habitudes + bouton d'ajout).
- Détail : `HabitDetail` (modifier + supprimer).
- Ajout / édition : `HabitForm`.
- Paramètres : `Settings` (déconnexion).

### 4) Appels API + stockage distant (Supabase)
- Client Supabase configuré.
- CRUD distant sur la table `habits` via service dédié (`getHabits`, `createHabit`, `getHabitById`, `updateHabit`, `deleteHabit`).
- Données liées à l'utilisateur pour la liste (`eq('user_id', session.user.id)`).

### 5) Organisation du code (plutôt propre)
- Les écrans utilisent des services (`authService`, `habitService`), ce qui évite les appels API directs partout.
- Navigation séparée (`AuthStack`, `AppStack`, `RootNavigator`).

---

## ⚠️ Partiellement fait / à améliorer

### 1) Gestion d'état réseau / résilience
- États `loading` gérés sur les écrans principaux.
- États d'erreur affichés via `Alert`.
- **Mais** il n'y a pas de stratégie claire de cache/backup d'affichage en cas de perte réseau prolongée (ex: dernière liste persistée localement).

### 2) Sécurité / configuration
- Les clés Supabase sont codées en dur dans `supabaseClient.ts`.
- Mieux: variables d'environnement + documentation d'installation.

### 3) Typage
- `HomeScreen` utilise `useState<any[]>([])` au lieu du type `Habit[]`.

---

## ❌ Ce qui manque pour respecter la consigne à 100%

### 1) Fonctionnalité native obligatoire
Aucune API native n'est implémentée pour l'instant (caméra, géolocalisation, notifications, capteurs...).

➡️ Priorité haute : ajouter **au moins une** fonctionnalité native avec :
- demande de permission au bon moment,
- explication utilisateur,
- gestion du refus.

### 2) README livrable
La consigne demande un README avec :
- instructions de lancement,
- choix techniques,
- fonctionnalités implémentées,
- justification du choix React Native/Flutter.

### 3) Captures obligatoires
À produire :
- écran authentification,
- écran liste,
- écran détail,
- écran fonctionnalité native.

### 4) Vidéo de démonstration
À produire avec :
- navigation complète,
- CRUD complet + persistance,
- démonstration loading + erreur,
- fonctionnalité native (permission + usage + refus),
- explication architecture/backend/état.

---

## Plan conseillé (ordre de priorité)
1. Ajouter une fonctionnalité native (ex: notifications locales de rappel d'habitude).
2. Implémenter la gestion du refus de permission + message UX clair.
3. Ajouter un fallback local minimal pour la liste en cas de coupure réseau (ex: AsyncStorage).
4. Écrire le README complet.
5. Générer les captures demandées.
6. Enregistrer la vidéo en suivant le barème.

---

## Estimation rapide d'avancement
- **Fonctionnalités obligatoires de base (hors natif/livrables)** : avancées.
- **Conformité globale à la consigne** : environ **65–75%**.
- **Blocage principal** : fonctionnalité native + livrables (README, captures, vidéo).
