/* Shared catalog loader.
   Datasets ship as positional rows to keep the 12 x 100 entry files compact.
   Row: [name, producer, country, region, style, abv, source, tags, pour, notes, modes, extras?]
   modes is a bitmask: 1 = neat, 2 = on ice, 4 = cocktail. */

window.defineCatalog = function defineCatalog(spiritType, idPrefix, rows) {
  const data = rows.map((row, i) => {
    const [name, producer, country, region, style, abv, source, tags, pour, notes, modes, extras] = row;
    const index = String(i + 1).padStart(2, '0');

    return Object.assign({
      id: `${idPrefix}-${index}`,
      index: index,
      name: name,
      distillery: producer,
      country: country,
      region: region,
      style: style,
      abv: abv,
      distilledFrom: source,
      flavorTags: tags,
      signaturePour: pour,
      description: notes,
      serveModes: {
        neat: Boolean(modes & 1),
        ice: Boolean(modes & 2),
        cocktail: Boolean(modes & 4)
      }
    }, extras || {});
  });

  window.SPIRIT_TYPE = spiritType;
  window.SPIRIT_DATA = data;
  return data;
};
