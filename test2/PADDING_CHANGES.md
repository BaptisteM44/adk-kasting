# Modifications Layout - Padding Global 16px

## Changements effectués

### ✅ 1. Suppression du max-width du conteneur
**Fichier:** `/styles/globals.scss`
- Retiré `max-width: 1200px` de la classe `.container`
- Le site occupe maintenant toute la largeur disponible

### ✅ 2. Application du padding global de 16px
**Fichier:** `/styles/globals.scss`
- Maintien du `padding: 0 16px` sur tous les conteneurs
- Ajout d'une classe `.full-width-padded` pour les éléments pleine largeur

### ✅ 3. Correction du Hero/Carousel
**Fichier:** `/styles/_layout.scss`

**Modifications sur `.hero`:**
- `&__content` : padding changé de `$spacing-lg` (24px) vers `16px`
- `&__film-info` : position `bottom` et `left` changées de `$spacing-lg` vers `16px`

**Modifications sur `.carousel`:**
- Boutons navigation (`&__nav--prev` et `&__nav--next`) : changés de `$spacing-lg` vers `16px`
- Version mobile : changée de `$spacing-md` vers `16px` pour maintenir la cohérence
- Indicateurs (`&__indicators`) : position `bottom` changée de `$spacing-lg` vers `16px`

## Résultat

### Avant
- Max-width de 1200px limitant la largeur du contenu
- Différents paddings (16px, 24px) selon les éléments
- Carousel avec padding incohérent

### Après
- ✅ Site utilise toute la largeur disponible (pas de max-width)
- ✅ Padding cohérent de 16px sur tous les bords
- ✅ Carousel et hero respectent le padding global de 16px
- ✅ Boutons de navigation et indicateurs alignés avec le padding global

## Impact visuel

1. **Page d'accueil** : Le carousel occupe toute la largeur mais respecte le padding de 16px pour :
   - Le contenu texte central
   - Les boutons de navigation (précédent/suivant)
   - Les indicateurs en bas
   - Les informations de film en bas à gauche

2. **Toutes les pages** : Le contenu s'étend sur toute la largeur disponible tout en maintenant une marge de 16px sur les bords

3. **Responsive** : Le padding de 16px est maintenu sur toutes les tailles d'écran

Le site respecte maintenant parfaitement le design system avec un padding global cohérent de 16px sur tous les éléments.