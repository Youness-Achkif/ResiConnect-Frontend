# ResiConnect Frontend

Site en production: [https://resiconnect.app/](https://resiconnect.app/)

ResiConnect est une application web de gestion de résidences pensée pour centraliser les échanges entre gestionnaires, résidents et agents de sécurité. Le frontend expose les principaux parcours métier: connexion, inscription, demande d’adhésion, dashboards par rôle, gestion des paiements, tickets, annonces, déclaration de problèmes avec photo et contrôle d’accès QR code.

## À Propos Du Projet

ResiConnect a été conçu pour simplifier la gestion quotidienne de plusieurs résidences dans une même plateforme. Le projet facilite la communication entre le gestionnaire et les résidents, organise les demandes d’adhésion, structure le suivi des paiements, permet aux résidents de déclarer un problème avec photo, et centralise les tickets, les annonces et le contrôle d’accès des visiteurs.

L’objectif principal est de proposer une expérience claire et pratique pour deux profils: le gestionnaire, qui pilote les résidences et les opérations, et le résident, qui accède à ses informations, ses demandes et ses échanges dans un espace dédié.

## En Bref

- Application React avec navigation par rôles `gestionnaire` et `resident`.
- Sélecteur de résidence persistant côté gestionnaire.
- Parcours d’onboarding résident avec recherche de résidence et demande d’adhésion.
- Espace gestionnaire pour suivre les paiements, les tickets et les annonces.
- Espace résident pour consulter son historique de paiements, ouvrir des tickets, suivre les annonces et gérer ses visiteurs.
- Contrôle d’accès QR code avec scanner caméra navigateur.

## Objectif Du Projet

1. Le projet résout un vrai cas métier: gérer plusieurs résidences et plusieurs profils utilisateurs dans une seule interface.
2. L’architecture frontend est organisée par responsabilités: pages, composants UI, contextes globaux et services API.
3. L’expérience a été pensée pour deux publics: le résident et le gestionnaire.
4. Le contrôle d’accès QR code ajoute une dimension opérationnelle concrète au produit.

## Fonctionnalités Clés

- Authentification avec redirection selon le rôle utilisateur.
- Inscription gestionnaire et inscription résident.
- Recherche de résidence par nom ou code.
- Demande d’adhésion à une résidence avec sélection d’appartement.
- Dashboard résident avec paiements, tickets et annonces.
- Dashboard gestionnaire avec paiements, tickets, annonces, suivi des résidents et traitement des problèmes.
- Déclaration de problème par le résident avec photo et description.
- Mise à jour du statut d’un problème par le gestionnaire: ouvert, en cours ou résolu.
- Historique des paiements consultable par le résident.
- Consultation des annonces publiées par le gestionnaire.
- Ajout et gestion de visiteurs par le résident.
- Scan de QR code via caméra navigateur avec `html5-qrcode`.
- Génération de QR code avec `qrcode.react`.
- Persistance locale de l’utilisateur, du token et de la résidence sélectionnée.

## Fonctionnalités Par Rôle

### Résident

- Consulter son historique de paiements.
- Suivre les annonces publiées par le gestionnaire.
- Déclarer un problème avec photo et description.
- Suivre le statut d’un problème: ouvert, en cours ou résolu.
- Ajouter et gérer des visiteurs.
- Accéder à son espace personnel après authentification.

### Gestionnaire

- Gérer plusieurs résidences, bâtiments et appartements.
- Valider ou suivre les demandes d’adhésion.
- Consulter et traiter les problèmes déclarés par les résidents.
- Mettre à jour le statut d’un problème.
- Suivre les paiements et les tickets.
- Publier des annonces à destination des résidents.
- Gérer les résidences depuis un dashboard centralisé.

## User Story - Déclaration De Problème Résident

### Problème Résolu

Quand un résident rencontre un incident dans son logement, comme une fuite d’eau ou une panne, il doit pouvoir le signaler simplement avec des preuves visuelles. Cela aide le gestionnaire à mieux comprendre la situation et à prioriser l’intervention.

### Fonctionnement

1. Le résident se connecte à son espace.
2. Il crée une déclaration de problème avec une description.
3. Il ajoute une photo pour illustrer la situation.
4. Le gestionnaire consulte la demande dans son dashboard.
5. Le gestionnaire met à jour le statut du problème: ouvert, en cours ou résolu.
6. Le résident peut suivre l’évolution de son signalement.

### Améliorations Possibles

- Catégorisation automatique du problème.
- Priorité urgente ou normale.
- Notifications au résident à chaque changement de statut.

## User Story - Gestion Des Visiteurs

### Fonctionnement

1. Le résident ajoute un visiteur depuis son espace.
2. Il renseigne les informations nécessaires pour l’accès.
3. Le système prépare l’autorisation ou le QR code associé.
4. Le résident partage l’accès au visiteur.
5. Le passage du visiteur peut être enregistré dans l’historique.

### Intérêt Produit

Cette fonctionnalité réduit les appels au gardien, sécurise l’entrée des visiteurs et donne au gestionnaire une meilleure visibilité sur les accès.

## User Story - Contrôle D’Accès Par QR Code

### Problème Résolu

Le gardien reçoit souvent des appels pour autoriser un visiteur: un cousin, un livreur ou un invité annoncé à l’avance. Ce fonctionnement est lent, manuel et peu sécurisé.

### Fonctionnement

1. Le résident se connecte à son espace.
2. Il crée un visiteur avec un nom, une date, une heure et une durée de validité.
3. Le système génère un QR code associé à cette visite.
4. Le QR code est partagé au visiteur.
5. Au moment de l’arrivée, le gardien scanne le QR code.
6. Si tout est valide, l’accès est autorisé et l’entrée est enregistrée dans l’historique.

### Améliorations Possibles

- QR code à usage unique.
- Détection automatique de plaque d’immatriculation.
- Notification au résident lorsque le visiteur entre.

## Stack Technique

| Categorie | Technologies |
| --- | --- |
| Front-end | HTML, CSS, JavaScript, React |
| Back-end | Node.js, Express.js |
| Base de données | PostgreSQL |
| Stockage fichiers | Cloudinary |
| Déploiement | Coolify |
| Dépôts GitHub | `ResiConnect-Frontend` et `ResiConnect-Backend` |

- React Router DOM 7
- Axios
- `qrcode.react`
- `html5-qrcode`
- Create React App via `react-scripts`

## Structure Du Projet

- `src/pages` contient les écrans principaux et les dashboards.
- `src/components` regroupe les composants réutilisables et les blocs UI.
- `src/context` gère l’authentification et les données partagées.
- `src/services` centralise les appels API.
- `src/styles` contient le thème et les styles globaux.

## Routes Principales

- `/login` pour la connexion.
- `/register` pour la création de compte.
- `/resident` pour le dashboard résident.
- `/manager` pour le dashboard gestionnaire.
- `/resident/payments`, `/resident/tickets`, `/resident/announcements` pour les vues résidentielles.
- `/manager/payments`, `/manager/tickets`, `/manager/announcements` pour les vues gestionnaire.

## Installation

1. Installer les dépendances avec `npm install`.
2. Démarrer le projet avec `npm start`.
3. Générer le build de production avec `npm run build`.

## Variables D’Environnement

Le frontend consomme l’API via `REACT_APP_API_URL`. Exemple:

```bash
REACT_APP_API_URL=https://api.resiconnect.app
```

## Déploiement

Le projet est déployé sur `resiconnect.app`, avec un backend séparé pour l’API et la persistance des données.
