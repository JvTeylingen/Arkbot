function inferDinoUses(dino) {
  const uses = [];
  if (dino.temperament === 'Aggressive' || dino.temperament === 'Territorial') uses.push('Combat');
  if (dino.saddleLevel) uses.push('Riding');
  if (dino.taming.method === 'passive') uses.push('Easy Tame');
  if (dino.baseStats.weight > 400) uses.push('Hauling');
  if (dino.baseStats.stamina > 350) uses.push('Travel');
  if (dino.baseStats.meleeDamage > 50) uses.push('High Damage');
  return uses.length ? uses : ['General Purpose'];
}

function calculateBreedData(dino, calculators) {
  const dinoBreed = calculators.dinoBreeding?.[dino.shortName || dino.name];
  const formulas = calculators.breedingFormulas || {};
  const raw = formulas.maturationMultiplier || 1;
  const mult = raw > 0 ? 1 / raw : 1;

  if (dinoBreed) {
    return {
      incubation: `${Math.round(dinoBreed.incubationMin * mult)} min`,
      maturation: `${Math.round(dinoBreed.maturationMin * mult)} min (${Math.round(dinoBreed.maturationMin * mult / 60)}h)`,
      imprintInterval: `${Math.round(dinoBreed.imprintIntervalMin * mult)} min (every ${Math.round(dinoBreed.imprintIntervalMin * mult / 60)}h)`,
      totalTime: `${Math.round(dinoBreed.totalAdultMin * mult)} min (${Math.round(dinoBreed.totalAdultMin * mult / 60)}h)`,
      mutationChance: `${(formulas.mutationChance || 0.025) * 100}% per parent`,
    };
  }

  const base = dino.baseStats.health / 100;
  return {
    incubation: `${Math.round(base * mult)} min`,
    maturation: `${Math.round(base * mult * 10)} min`,
    imprintInterval: formulas.imprintInterval || '8h',
    totalTime: `${Math.round(base * mult * 12)} min`,
    mutationChance: `${(formulas.mutationChance || 0.025) * 100}% per parent`,
  };
}

function calculateTamingData(dino, calculators, level = 1) {
  const tamingFormulas = calculators.tamingFormulas || {};
  const tamingData = calculators.tamingData || {};
  const foodData = calculators.foodData || {};
  const speedMult = tamingFormulas.tamingSpeedMultiplier || 1;

  const scaling = dino.statScaling || {};
  const expectedPoints = Math.max(0, (level - 1) / 6);
  const foodMult = 1 + expectedPoints * (scaling.food ?? 0.1);
  const torporMult = 1 + expectedPoints * (scaling.torpor ?? 0.06);

  const method = dino.taming.method || 'knockout';
  const torpor = Math.round((dino.taming.torpor || 0) * torporMult);
  const preferredKibble = dino.taming.preferredKibble || null;
  const kibbleBonus = dino.taming.kibbleBonus || 0;

  const foods = dino.taming.food || [];
  const bestFood = foods.reduce((best, f) => {
    const fv = foodData[f]?.tamingAffinity || 0;
    const bv = foodData[best]?.tamingAffinity || 0;
    return fv > bv ? f : best;
  }, foods[0] || 'Unknown');

  const bestFoodAffinity = foodData[bestFood]?.tamingAffinity || 0;
  const eatingInterval = foodData[bestFood]?.category === 'berry'
    ? (tamingData.berryEatingInterval || 17)
    : (tamingData.eatingInterval || 10);

  let effectiveAffinity = bestFoodAffinity;
  if (preferredKibble && kibbleBonus > 0) {
    const kibbleAffinity = foodData[preferredKibble]?.tamingAffinity || 0;
    effectiveAffinity = Math.max(effectiveAffinity, kibbleAffinity * (1 + kibbleBonus));
  }

  const baseFood = Math.round((dino.baseStats?.food || 1000) * foodMult);
  const baseAffinity = dino.taming.tamingAffinity || Math.round((dino.baseStats?.food || 1000) * 0.5);
  const totalAffinityNeeded = Math.max(1, Math.round(baseAffinity * foodMult));
  const totalEats = Math.ceil(totalAffinityNeeded / Math.max(1, effectiveAffinity) / speedMult);
  const rawTimeMin = (totalEats * eatingInterval) / 60;
  const adjustedTimeMin = Math.round(rawTimeMin);

  const torporPerNarcotic = tamingData.torporPerNarcotic || 40;
  const narcoticsNeeded = Math.ceil(torpor / torporPerNarcotic);

  return {
    method,
    torpor,
    foods,
    bestFood,
    preferredKibble,
    kibbleBonus,
    baseFood,
    level,
    totalEats,
    estimatedTimeMin: adjustedTimeMin || 1,
    narcoticsNeeded,
    speedMult,
  };
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '<1m';
}

module.exports = { inferDinoUses, calculateBreedData, calculateTamingData, formatUptime };
