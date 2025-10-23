# ADKwebsite

Dépôt local pour le projet ADKwebsite.

Contenu:
- `adk-app/` : nouveau front Next.js (app router)
- `test2/` : legacy front, scripts, components, SQL, types

Instructions rapides:

1. Installer les dépendances

```bash
# à la racine si tu gères les workspaces ou dans chaque sous-dossier
npm install
npm --prefix adk-app install
npm --prefix test2 install
```

2. Lancer en développement

```bash
# front moderne
npm --prefix adk-app run dev

# legacy
npm --prefix test2 run dev
```

3. Base de données

- Voir `test2/sql/` pour les migrations et `README.md` dans `test2/`.
- Copie `.env.example` en `.env.local` avant de lancer.

4. Nettoyage des artefacts Next.js

```bash
rm -rf test2/.next adk-app/.next
```

Notes:
- Ce repo est initialisé localement. Pour le pousser sur GitHub, crée un repo distant et exécute :

```bash
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```
