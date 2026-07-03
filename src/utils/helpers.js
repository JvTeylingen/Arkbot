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
  const mult = formulas.maturationMultiplier || 1;

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

module.exports = { inferDinoUses, calculateBreedData, formatUptime };
