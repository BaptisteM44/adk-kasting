# Système de Design - ADK Kasting

## Typographie

Le système de typographie suivant a été implémenté selon les spécifications fournies :

### Variables SCSS

**Fichier : `/styles/_variables.scss`**

```scss
// === Tailles de police et hauteurs de ligne selon les spécifications ===
$font-size-body: 18px;
$line-height-body: 26px;

$font-size-title: 36px;
$line-height-title: 48px;

$font-size-big-title: 50px;
$line-height-big-title: 48px;

// Variables pour points de rupture responsive
$mobile-breakpoint: 768px;
```

### Classes utilitaires

**Fichier : `/styles/globals.scss`**

```scss
// Classes de typographie réutilisables
.text-body {
  font-size: $font-size-body;
  line-height: $line-height-body;
  
  @media (max-width: $mobile-breakpoint) {
    font-size: 16px;
    line-height: 24px;
  }
}

.text-title {
  font-size: $font-size-title;
  line-height: $line-height-title;
  font-weight: 600;
  
  @media (max-width: $mobile-breakpoint) {
    font-size: 28px;
    line-height: 36px;
  }
}

.text-big-title {
  font-size: $font-size-big-title;
  line-height: $line-height-big-title;
  font-weight: 700;
  
  @media (max-width: $mobile-breakpoint) {
    font-size: 40px;
    line-height: 44px;
  }
}
```

## Espacement Global

- **Padding des conteneurs** : 16px appliqué globalement
- **Responsive design** : Adaptation automatique pour mobile

## Pages mises à jour

Les classes de typographie ont été appliquées aux pages suivantes :

1. **Page d'accueil** (`/pages/index.tsx`)
   - Titres principaux : `.text-big-title`
   - Sous-titres : `.text-title`
   - Corps de texte : `.text-body`

2. **Page des comédiens** (`/pages/comediens/index.tsx`)
   - Titre principal : `.text-big-title`
   - Descriptions : `.text-body`

3. **Page de connexion** (`/pages/connexion.tsx`)
   - Titre principal : `.text-title`
   - Informations : `.text-body`

4. **Page d'inscription** (`/pages/inscription.tsx`)
   - Titre principal : `.text-title`
   - Labels et textes : `.text-body`

5. **Page À propos** (`/pages/about.tsx`)
   - Grand titre : `.text-big-title`
   - Titre section : `.text-title`
   - Corps de texte : `.text-body`

6. **Page FAQ** (`/pages/faq.tsx`)
   - Titre principal : `.text-big-title`
   - Questions et réponses : `.text-body`

## Composants mis à jour

- **ComedienCard** : Application des classes aux noms et informations
- **Header** : Utilise les composants Button qui héritent du système
- **Autres composants** : À mettre à jour selon les besoins

## Spécifications de design

### Bodytexte_18
- Taille : 18px
- Hauteur de ligne : 26px
- Usage : Corps de texte, descriptions, labels

### Titles_40
- Taille : 36px (renommé de 40px pour correspondre aux standards)
- Hauteur de ligne : 48px
- Usage : Titres de sections, sous-titres importants

### BigTitles_50
- Taille : 50px
- Hauteur de ligne : 48px
- Usage : Titres principaux de pages

## Notes d'implémentation

- Toutes les classes sont responsive avec des tailles réduites sur mobile
- Le padding global de 16px est appliqué via les conteneurs
- Les variables SCSS permettent une maintenance facile
- La famille de polices reste Inter pour tout le site

## Prochaines étapes

1. Continuer l'application du système aux composants restants
2. Ajouter les spécifications de couleurs selon le design
3. Définir les espacements et grilles standardisées
4. Créer des composants de boutons avec les nouvelles spécifications