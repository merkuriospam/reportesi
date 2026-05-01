const { User, Person } = require('./models');
const sequelize = require('./config/database');

const seed = async () => {
  try {
    await sequelize.sync({ force: false });
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (!admin) {
      await User.create({
        username: 'admin',
        password: 'password123',
      });
      console.log('Admin user created: admin / password123');
    }

    const peopleCount = await Person.count();
    if (peopleCount === 0) {
      await Person.bulkCreate([
        { 
          name: 'Juan Perez', 
          alias: 'El Juancho',
          ageEstimate: 45,
          gender: 'Masculino',
          description: 'Suele estar en la plaza central. Tiene problemas de rodilla.',
          lastKnownLocation: 'Plaza Central'
        },
        { 
          name: 'Maria Garcia', 
          alias: 'Mari',
          ageEstimate: 60,
          gender: 'Femenino',
          description: 'Necesita medicación para la presión. Muy amable.',
          lastKnownLocation: 'Calle 5 y 10'
        },
        { 
          name: 'Carlos Lopez', 
          alias: 'Charly',
          ageEstimate: 30,
          gender: 'Masculino',
          description: 'Acompañado por un perro llamado "Pantufla".',
          lastKnownLocation: 'Estación de Tren'
        },
      ]);
      console.log('Test people created');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
