import type { ColorPair } from '$lib/models/color';
import Fuse from 'fuse.js';

interface ColorMapping {
  colorPair: ColorPair;
  aromas: Array<string>;
}

const colorMappings: Array<ColorMapping> = [
  // Roasted/Burnt
  { colorPair: { color: 'black', backgroundColor: 'rgb(190, 134, 99)' }, aromas: ['burnt'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(223, 189, 126)' }, aromas: ['tobacco'] },
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(202, 164, 101)' },
    aromas: ['pipe tobacco'],
  },

  // Cereal
  { colorPair: { color: 'black', backgroundColor: 'rgb(221, 175, 97)' }, aromas: ['cereal'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(183, 144, 111)' }, aromas: ['grain'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(235, 157, 94)' }, aromas: ['malt'] },

  // Smoky/Ashy
  { colorPair: { color: 'black', backgroundColor: 'rgb(161, 116, 59)' }, aromas: ['smoky'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(137, 152, 147)' }, aromas: ['ashy'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(185, 164, 73)' }, aromas: ['acrid'] },

  // Spices
  { colorPair: { color: 'white', backgroundColor: 'rgb(204, 60, 66)' }, aromas: ['pepper'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(121, 70, 82)' }, aromas: ['pungent'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(177, 77, 87)' }, aromas: ['brown spice'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(140, 41, 44)' }, aromas: ['nutmeg'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(229, 118, 46)' }, aromas: ['cinnamon'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(161, 108, 90)' }, aromas: ['clove'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(199, 137, 53)' }, aromas: ['anise'] },

  // Nutty
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(199, 136, 105)' },
    aromas: ['nutty', 'nut', 'walnut', 'cashew'],
  },
  { colorPair: { color: 'black', backgroundColor: 'rgb(212, 173, 19)' }, aromas: ['peanuts'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(157, 84, 51)' }, aromas: ['hazelnut'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(200, 159, 131)' }, aromas: ['almond'] },

  // Cocoa
  { colorPair: { color: 'black', backgroundColor: 'rgb(187, 118, 76)' }, aromas: ['cocoa'] },
  {
    colorPair: { color: 'white', backgroundColor: 'rgb(71, 6, 3)' },
    aromas: ['dark chocolate'],
  },
  {
    colorPair: { color: 'white', backgroundColor: 'rgb(105, 42, 25)' },
    aromas: ['chocolate', 'brownie'],
  },

  // Sweet
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(230, 88, 50)' },
    aromas: ['sweet', 'sugarcane', 'lemonade'],
  },
  { colorPair: { color: 'black', backgroundColor: 'rgb(212, 90, 89)' }, aromas: ['brown sugar'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(49, 12, 15)' }, aromas: ['molasses'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(174, 52, 31)' }, aromas: ['maple syrup'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(215, 136, 35)' }, aromas: ['caramelized'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(218, 92, 31)' }, aromas: ['honey'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(248, 154, 128)' }, aromas: ['vanilla'] },

  // Floral
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(224, 113, 156)' },
    aromas: ['floral', 'flower', 'lilac', 'lilies', 'orchid', 'blossom'],
  },
  { colorPair: { color: 'white', backgroundColor: 'rgb(151, 94, 109)' }, aromas: ['black tea'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(249, 158, 27)' }, aromas: ['chamomile'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(239, 90, 120)' }, aromas: ['rose'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(247, 241, 189)' }, aromas: ['jasmine'] },

  // Berry
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(221, 76, 81)' },
    aromas: ['berry', 'berries'],
  },
  { colorPair: { color: 'white', backgroundColor: 'rgb(62, 3, 23)' }, aromas: ['blackberry'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(229, 41, 104)' }, aromas: ['raspberry'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(100, 105, 176)' }, aromas: ['blueberry'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(239, 45, 54)' }, aromas: ['strawberry'] },

  // Dried Fruit
  {
    colorPair: { color: 'white', backgroundColor: 'rgb(201, 74, 68)' },
    aromas: ['dried fruit', 'plum', 'apricot', 'mango'],
  },
  { colorPair: { color: 'white', backgroundColor: 'rgb(181, 59, 84)' }, aromas: ['raisin'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(165, 68, 111)' }, aromas: ['prune'] },

  // Other Fruit
  { colorPair: { color: 'black', backgroundColor: 'rgb(208, 124, 54)' }, aromas: ['coconut'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(231, 52, 81)' }, aromas: ['cherry'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(230, 86, 86)' }, aromas: ['pomegranate'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(248, 154, 28)' }, aromas: ['pineapple'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(174, 185, 44)' }, aromas: ['grape'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(78, 185, 71)' }, aromas: ['apple'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(246, 138, 92)' }, aromas: ['peach'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(186, 166, 53)' }, aromas: ['pear'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(255, 225, 53)' }, aromas: ['banana'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(196, 214, 0)' }, aromas: ['lemongrass'] },

  // Citrus
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(247, 161, 41)' },
    aromas: ['citrus fruit', 'yuzu', 'bergamot'],
  },
  { colorPair: { color: 'black', backgroundColor: 'rgb(242, 99, 85)' }, aromas: ['grapefruit'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(226, 99, 30)' }, aromas: ['orange'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(253, 228, 2)' }, aromas: ['lemon'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(126, 177, 56)' }, aromas: ['lime'] },

  // Sour/Fermented
  { colorPair: { color: 'black', backgroundColor: 'rgb(225, 195, 21)' }, aromas: ['sour'] },
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(158, 167, 24)' },
    aromas: ['sour aromatics'],
  },
  { colorPair: { color: 'black', backgroundColor: 'rgb(148, 167, 112)' }, aromas: ['acetic acid'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(208, 179, 79)' }, aromas: ['butyric acid'] },
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(142, 182, 70)' },
    aromas: ['isovaleric acid'],
  },
  { colorPair: { color: 'black', backgroundColor: 'rgb(250, 239, 8)' }, aromas: ['citric acid'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(193, 186, 9)' }, aromas: ['malic acid'] },

  // Green/Vegetative
  { colorPair: { color: 'black', backgroundColor: 'rgb(162, 176, 40)' }, aromas: ['olive oil'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(112, 137, 51)' }, aromas: ['raw'] },
  {
    colorPair: { color: 'black', backgroundColor: 'rgb(58, 162, 85)' },
    aromas: ['green'],
  },

  // Alcohol/Fermented
  { colorPair: { color: 'white', backgroundColor: 'rgb(143, 27, 83)' }, aromas: ['winey'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(179, 64, 57)' }, aromas: ['whiskey'] },
  { colorPair: { color: 'black', backgroundColor: 'rgb(186, 146, 50)' }, aromas: ['fermented'] },
  { colorPair: { color: 'white', backgroundColor: 'rgb(139, 100, 57)' }, aromas: ['overripe'] },
];

const colorFuseKeys = ['aromas'];
const colorFuseOptions = {
  threshold: 0.2,
  ignoreLocation: true,
  findAllMatches: true,
  includeScore: true,
  keys: colorFuseKeys,
};

const colorSearch = new Fuse(colorMappings, colorFuseOptions);

export function getAromaColor(aroma: string): ColorPair {
  const defaultColorPair = {
    color: 'white',
    backgroundColor: 'rgb(105, 42, 25)',
  };

  const wholeStringResults = colorSearch.search(aroma.trim());

  if (
    wholeStringResults.length > 0 &&
    wholeStringResults[0].score &&
    wholeStringResults[0].score < 0.2
  ) {
    return wholeStringResults[0].item.colorPair;
  }

  const results = aroma
    .split(/\s+/)
    .filter((substring) => substring.trim() !== '')
    .flatMap((substring) => colorSearch.search(substring))
    .toSorted((a, b) => (a?.score ?? 1) - (b?.score ?? 1));

  return results.length > 0 ? results[0].item.colorPair : defaultColorPair;
}
