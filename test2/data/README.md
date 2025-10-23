# 🎬 Gestion des Films du Carousel

Ce dossier contient les données et images des films affichés dans le carousel de la page d'accueil.

## 📁 Structure
```
data/
└── films.json          # Données des films

public/images/films/
├── le-dernier-metro.jpg
├── amelie.jpg
├── la-haine.jpg
├── jules-et-jim.jpg
└── parapluies-cherbourg.jpg
```

## ✏️ Comment ajouter/modifier un film

### 1. Ajouter l'image
- Placez votre image dans `public/images/films/`
- Format recommandé : JPG, 1920x1080 (ratio 16:9)
- Nommage : utilisez des tirets pour les espaces (ex: `mon-nouveau-film.jpg`)

### 2. Mettre à jour le JSON
Éditez `data/films.json` :

```json
{
  "id": "6",                                    // ID unique
  "title": "Nom du Film",                       // Titre affiché
  "year": 2023,                                 // Année de sortie
  "image_url": "/images/films/nom-du-film.jpg", // Chemin vers l'image
  "order_index": 6,                             // Ordre d'affichage
  "is_active": true                             // Actif ou non
}
```

### 3. Redémarrer le serveur
Après modification, redémarrez avec `npm run dev`

## 🎯 Films actuels
1. **Le Dernier Métro** (1980)
2. **Amélie** (2001) 
3. **La Haine** (1995)
4. **Jules et Jim** (1962)
5. **Les Parapluies de Cherbourg** (1964)

## ⚙️ Configuration
- **Autoplay** : 5 secondes par film
- **Ordre** : Défini par `order_index`
- **Filtrage** : Seuls les films avec `is_active: true` sont affichés