const nano = require('nano')('http://admin:YOURPASSWORD@localhost:5984');
const dbName = 'cocktails';

async function createDatabase() {
  try {
    await nano.db.create(dbName);
    console.log(`Database ${dbName} created.`);
  } catch (error) {
    if (error.statusCode === 412) {
      console.log(`Database ${dbName} already exists.`);
    } else {
      throw error;
    }
  }
}

async function insertCocktails() {
  const db = nano.use(dbName);
  const dummyCocktails = [
    {
      _id: '1',
      title: 'Mojito',
      description: 'A refreshing cocktail with lime, mint, and rum.',
      ingredients: 'Rum, Mint, Lime, Sugar, Soda Water',
      recipe: 'Muddle mint leaves with sugar and lime juice. Add a splash of soda water and fill the glass with ice. Pour in the rum and top with soda water.',
      image: '/uploads/mojito.webp',
      type: 'cocktail'
    },
    {
      _id: '2',
      title: 'Margarita',
      description: 'A classic cocktail with tequila, lime juice, and triple sec.',
      ingredients: 'Tequila, Lime Juice, Triple Sec, Salt',
      recipe: 'Rub the rim of the glass with the lime slice to make the salt stick to it. Take care to moisten only the outer rim and sprinkle the salt on it. The salt should present to the lips of the imbiber and never mix into the cocktail.',
      image: '/uploads/margarita.webp',
      type: 'cocktail'
    },
    {
      _id: '3',
      title: 'Old Fashioned',
      description: 'A strong cocktail with whiskey, bitters, and sugar.',
      ingredients: 'Whiskey, Bitters, Sugar, Orange Peel',
      recipe: 'Place sugar cube in old-fashioned glass and saturate with bitters, add a dash of plain water. Muddle until dissolved. Fill the glass with ice cubes and add whiskey. Garnish with orange slice, and a cocktail cherry.',
      image: '/uploads/old_fashioned.webp',
      type: 'cocktail'
    },
    {
      _id: '4',
      title: 'Cosmopolitan',
      description: 'A sophisticated cocktail with vodka, triple sec, cranberry juice, and lime juice.',
      ingredients: 'Vodka, Triple Sec, Cranberry Juice, Lime Juice',
      recipe: 'Shake all ingredients with ice and strain into a chilled cocktail glass. Garnish with a lime wheel.',
      image: '/uploads/cosmopolitan.webp',
      type: 'cocktail'
    },
    {
      _id: '5',
      title: 'Gin and Tonic',
      description: 'A classic cocktail with gin and tonic water, garnished with lime.',
      ingredients: 'Gin, Tonic Water, Lime',
      recipe: 'Fill a glass with ice cubes. Pour in the gin, add tonic water to taste, and stir gently. Garnish with a lime wedge.',
      image: '/uploads/gin_and_tonic.webp',
      type: 'cocktail'
    },
    {
      _id: '6',
      title: 'Piña Colada',
      description: 'A tropical cocktail with rum, coconut cream, and pineapple juice.',
      ingredients: 'Rum, Coconut Cream, Pineapple Juice',
      recipe: 'Blend all ingredients with ice until smooth and pour into a chilled glass. Garnish with a pineapple slice and cherry.',
      image: '/uploads/pina_colada.webp',
      type: 'cocktail'
    },
    {
      _id: '7',
      title: 'Manhattan',
      description: 'A classic cocktail with whiskey, sweet vermouth, and bitters.',
      ingredients: 'Whiskey, Sweet Vermouth, Bitters',
      recipe: 'Stir all ingredients with ice and strain into a chilled cocktail glass. Garnish with a cherry.',
      image: '/uploads/manhattan.webp',
      type: 'cocktail'
    },
    {
      _id: '8',
      title: 'Martini',
      description: 'A sophisticated cocktail with gin and dry vermouth.',
      ingredients: 'Gin, Dry Vermouth',
      recipe: 'Stir all ingredients with ice and strain into a chilled cocktail glass. Garnish with an olive or lemon twist.',
      image: '/uploads/martini.webp',
      type: 'cocktail'
    },
    {
      _id: '9',
      title: 'Whiskey Sour',
      description: 'A classic cocktail with whiskey, lemon juice, and sugar.',
      ingredients: 'Whiskey, Lemon Juice, Sugar',
      recipe: 'Shake all ingredients with ice and strain into a chilled glass. Garnish with a cherry and orange slice.',
      image: '/uploads/whiskey_sour.webp',
      type: 'cocktail'
    },
    {
      _id: '10',
      title: 'Negroni',
      description: 'A bitter cocktail with gin, campari, and sweet vermouth.',
      ingredients: 'Gin, Campari, Sweet Vermouth',
      recipe: 'Stir all ingredients with ice and strain into a chilled glass. Garnish with an orange peel.',
      image: '/uploads/negroni.webp',
      type: 'cocktail'
    },
    {
      _id: '11',
      title: 'Bloody Mary',
      description: 'A savory cocktail with vodka, tomato juice, and various spices and flavorings.',
      ingredients: 'Vodka, Tomato Juice, Lemon Juice, Worcestershire Sauce, Hot Sauce, Salt, Pepper',
      recipe: 'Stir all ingredients with ice and strain into a chilled glass. Garnish with a celery stalk and lemon wedge.',
      image: '/uploads/bloody_mary.webp',
      type: 'cocktail'
    }
  ];

  try {
    await db.bulk({ docs: dummyCocktails });
    console.log('Dummy cocktails inserted.');
  } catch (error) {
    console.error('Error inserting dummy cocktails:', error);
  }
}

async function main() {
  try {
    await createDatabase();
    await insertCocktails();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

main();
