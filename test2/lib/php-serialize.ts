/**
 * Sérialise un tableau JavaScript en format PHP sérialisé
 * Compatible avec le format WordPress
 *
 * Exemple:
 *   phpSerialize(["Chant", "Doublage"])
 *   → "a:2:{i:0;s:5:"Chant";i:1;s:8:"Doublage";}"
 */
export function phpSerialize(arr: string[] | null | undefined): string {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return '';
  }

  // Filtrer les valeurs vides
  const validItems = arr.filter(item => item && typeof item === 'string' && item.trim() !== '');

  if (validItems.length === 0) {
    return '';
  }

  let result = `a:${validItems.length}:{`;
  validItems.forEach((item, index) => {
    const itemStr = String(item);
    result += `i:${index};s:${itemStr.length}:"${itemStr}";`;
  });
  result += '}';

  return result;
}

/**
 * Alias pour la fonction de désérialisation existante
 * Pour cohérence avec phpSerialize
 */
export { unserializePHP as phpUnserialize } from './wordpress-compat';

/**
 * Exemples d'utilisation:
 *
 * // Sérialiser
 * phpSerialize(["Chant"])
 * // → "a:1:{i:0;s:5:"Chant";}"
 *
 * phpSerialize(["Chant", "Doublage", "Acrobatie"])
 * // → "a:3:{i:0;s:5:"Chant";i:1;s:8:"Doublage";i:2;s:10:"Acrobatie";}"
 *
 * phpSerialize([])
 * // → ""
 *
 * // Désérialiser
 * phpUnserialize('a:2:{i:0;s:5:"Chant";i:1;s:8:"Doublage";}')
 * // → ["Chant", "Doublage"]
 */
