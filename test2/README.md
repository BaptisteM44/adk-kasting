# ADKcasting - Plateforme de casting professionnel

Une application moderne de gestion de casting construite avec Next.js et Supabase.

## 🌟 Fonctionnalités

- **Page d'accueil** avec carousel de films cinématographiques
- **Base de données** de 9000+ comédiens professionnels  
- **Système de filtrage avancé** (âge, genre, compétences, localisation...)
- **Fiches détaillées** avec toutes les informations nécessaires
- **Système d'authentification** avec rôles (public, comédien, admin)
- **Export PDF** des fiches comédiens (admins uniquement)
- **Interface responsive** avec design moderne en SCSS
- **Dashboard administrateur** avec système de notation
- **Gestion sécurisée des données** avec Row Level Security

## 🚀 Installation rapide

### 1. Prérequis
- Node.js 18+ 
- Compte Supabase
- Accès à une base de données avec comédiens existants

### 2. Installation
```bash
git clone <votre-repo>
cd ADKcasting
npm install
```

### 3. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env.local

# Modifier .env.local avec vos clés Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Base de données
Dans Supabase SQL Editor, exécuter dans l'ordre :
```sql
-- 1. Créer les tables et données de base
\i sql/schema.sql

-- 2. Ajouter les fonctions utilitaires  
\i sql/functions.sql

-- 3. Configurer la sécurité (RLS)
\i sql/rls.sql
```

### 5. Lancement
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base (Button, Input...)
│   ├── Layout.tsx      # Layout principal avec header/footer
│   ├── ComedienCard.tsx    # Carte comédien
│   ├── ComedienFilters.tsx # Système de filtres
│   └── FilmCarousel.tsx    # Carousel d'accueil
├── pages/              # Pages Next.js
│   ├── api/           # API routes
│   ├── comediens/     # Pages comédiens (liste + détail)
│   ├── index.tsx      # Page d'accueil
│   ├── login.tsx      # Connexion
│   └── dashboard.tsx  # Tableau de bord
├── lib/               # Utilitaires et services
│   ├── supabase.ts    # Client Supabase
│   ├── auth.ts        # Service d'authentification  
│   └── pdf.ts         # Génération PDF
├── styles/            # Styles SCSS
│   ├── globals.scss   # Styles globaux
│   ├── _variables.scss # Variables
│   └── _components.scss # Styles des composants
├── sql/               # Scripts de base de données
│   ├── schema.sql     # Tables et structure
│   ├── functions.sql  # Fonctions utilitaires
│   └── rls.sql        # Sécurité (Row Level Security)
└── types/             # Types TypeScript
```

## 🎭 Utilisation

### Pour les directeurs de casting
1. **Parcourir** la base de comédiens sur `/comediens`
2. **Filtrer** par critères (âge, genre, compétences...)  
3. **Consulter** les fiches détaillées
4. **Contacter** directement par email/téléphone
5. **Télécharger** les CV au format PDF (compte admin)

### Pour les comédiens  
1. **Se connecter** avec ses identifiants
2. **Mettre à jour** son profil sur `/dashboard`
3. **Modifier** ses informations et photo

### Pour les administrateurs
1. **Gérer** tous les profils comédiens
2. **Noter** les comédiens (étoiles 1-5) 
3. **Exporter** les fiches PDF
4. **Voir** les statistiques globales

## 🔐 Système d'authentification

### Rôles utilisateurs
- **Public** : Consultation libre des comédiens
- **Comédien** : Modification de son propre profil  
- **Admin** : Accès complet + notation + export PDF

### Comptes de test
- **Admin** : `admin@ADKcasting.com` / `admin123`
- **Comédien** : `comedien@ADKcasting.com` / `comedien123`

## 🛠 Personnalisation

### Ajouter des filtres
1. Modifier `types/index.ts` (interface `ComedienFilters`)
2. Ajouter les champs dans `ComedienFilters.tsx`
3. Mettre à jour la fonction `search_comediens` en SQL

### Modifier les styles
- Variables : `styles/_variables.scss`
- Composants : `styles/_components.scss` 
- Layout : `styles/_layout.scss`

### Ajouter des champs comédien
1. Modifier la table `comediens` en SQL
2. Mettre à jour l'interface `Comedien` dans `types/index.ts`
3. Adapter les composants `ComedienCard` et fiche détail

## 📊 Base de données

### Tables principales
- **comediens** : Profils complets des comédiens
- **admin_ratings** : Notes attribuées par les admins  
- **films** : Films pour le carousel d'accueil
- **user_profiles** : Rôles et permissions utilisateurs

### Sécurité
- **Row Level Security** activé sur toutes les tables
- **Authentification** via Supabase Auth
- **Permissions** granulaires par rôle

## 🚀 Déploiement

### Vercel (recommandé)
```bash
npm install -g vercel
vercel
```

### Variables d'environnement en production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `NODE_ENV=production`

## 🐛 Dépannage

### Erreur de connexion Supabase
- Vérifier les clés dans `.env.local`
- Contrôler les politiques RLS
- Vérifier que les tables existent

### Problème de filtres  
- Contrôler les index sur les colonnes filtrées
- Vérifier la fonction `search_comediens`
- Tester les requêtes directement en SQL

### Export PDF qui ne fonctionne pas
- Vérifier que l'utilisateur est admin
- Contrôler les permissions sur la table `comediens`
- Tester l'API `/api/pdf?id=xxx`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`) 
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Distribué sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 📞 Support

- Email: support@ADKcasting.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [jsPDF](https://github.com/parallax/jsPDF) - Génération PDF côté client
