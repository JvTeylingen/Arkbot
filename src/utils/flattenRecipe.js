function flattenRecipe(itemName, items, depth = 0) {
  if (depth > 10) return {};

  const item = items[itemName];
  if (!item || !item.craftingRecipe) return {};

  const result = {};

  for (const [ingredientName, quantity] of Object.entries(item.craftingRecipe.ingredients)) {
    const subItem = items[ingredientName];
    if (subItem && subItem.craftingRecipe) {
      const sub = flattenRecipe(ingredientName, items, depth + 1);
      for (const [subName, subQty] of Object.entries(sub)) {
        result[subName] = (result[subName] || 0) + subQty * quantity;
      }
    } else {
      result[ingredientName] = (result[ingredientName] || 0) + quantity;
    }
  }

  return result;
}

module.exports = { flattenRecipe };
