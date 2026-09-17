import { Recipe } from '../../types/game';

export const COOKING_RECIPES: Recipe[] = [
  {
    id: 'recipe_vegetable_soup',
    name: 'Sup Sayur Segar (Vegetable Soup)',
    description: 'Sup hangat dari wortel dan kentang kebun yang gurih dan bergizi.',
    ingredients: [
      { itemId: 'crop_carrot', count: 1 },
      { itemId: 'crop_potato', count: 1 }
    ],
    energyRestored: 60,
    resultItemId: 'food_soup'
  },
  {
    id: 'recipe_fruit_salad',
    name: 'Salad Buah Tropis (Fruit Salad)',
    description: 'Irisan manis stroberi dan semangka dingin yang menyegarkan tubuh.',
    ingredients: [
      { itemId: 'crop_strawberry', count: 1 },
      { itemId: 'crop_watermelon', count: 1 }
    ],
    energyRestored: 75,
    resultItemId: 'food_salad'
  },
  {
    id: 'recipe_corn_soup',
    name: 'Sup Jagung Manis (Corn Chowder)',
    description: 'Sup kental dari jagung manis panggang yang kaya rasa.',
    ingredients: [
      { itemId: 'crop_corn', count: 1 }
    ],
    energyRestored: 55,
    resultItemId: 'food_corn_soup'
  },
  {
    id: 'recipe_berry_pie',
    name: 'Kue Pai Berry (Berry Pie)',
    description: 'Kue pai renyah isi campuran stroberi dan berry hutan manis.',
    ingredients: [
      { itemId: 'crop_strawberry', count: 1 },
      { itemId: 'forage_berry', count: 2 }
    ],
    energyRestored: 70,
    resultItemId: 'food_pie'
  }
];
