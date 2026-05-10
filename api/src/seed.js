const { User, Person, Report, Group } = require('./models');
const sequelize = require('./config/database');

const ensureTables = async () => {
  try {
    await sequelize.query(`CREATE TABLE IF NOT EXISTS \`Groups\` (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deletedAt DATETIME NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  } catch (e) {
    console.log('Note: Groups table may already exist:', e.message);
  }

  const columns = [
    { table: 'Users', column: 'groupId', type: 'INT NULL' },
    { table: 'People', column: 'userId', type: 'INT NULL' },
    { table: 'Reports', column: 'userId', type: 'INT NULL' },
  ];
  for (const { table, column, type } of columns) {
    try {
      await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN IF NOT EXISTS \`${column}\` ${type}`);
    } catch (_) {
      try { await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${type}`); } catch (_) {}
    }
  }
};

const seed = async () => {
  try {
    await sequelize.sync({ force: false });
    await ensureTables();

    const [mdqGroup] = await Group.findOrCreate({
      where: { name: 'mdqSi' },
    });
    console.log(`Group mdqSi ready (id=${mdqGroup.id})`);

    const [admin] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: { password: 'password123', groupId: mdqGroup.id },
    });
    if (!admin.groupId) {
      admin.groupId = mdqGroup.id;
      await admin.save();
    }
    console.log(`Admin user ready (id=${admin.id})`);

    const updatedPeople = await Person.update({ userId: admin.id }, { where: { userId: null } });
    if (updatedPeople[0] > 0) console.log(`Associated ${updatedPeople[0]} existing people with admin`);

    await Report.update({ userId: admin.id }, { where: { userId: null } });
    const updatedReports = await Report.update({ userId: admin.id }, { where: { userId: null } });
    if (updatedReports[0] > 0) console.log(`Associated ${updatedReports[0]} existing reports with admin`);

    const peopleCount = await Person.count();
    if (peopleCount === 0) {
      await Person.bulkCreate([
        {
          name: 'Juan Perez',
          alias: 'El Juancho',
          ageEstimate: 45,
          gender: 'Masculino',
          description: 'Suele estar en la plaza central. Tiene problemas de rodilla.',
          lastKnownLocation: 'Plaza Central',
          userId: admin.id,
        },
        {
          name: 'Maria Garcia',
          alias: 'Mari',
          ageEstimate: 60,
          gender: 'Femenino',
          description: 'Necesita medicación para la presión. Muy amable.',
          lastKnownLocation: 'Calle 5 y 10',
          userId: admin.id,
        },
        {
          name: 'Carlos Lopez',
          alias: 'Charly',
          ageEstimate: 30,
          gender: 'Masculino',
          description: 'Acompañado por un perro llamado "Pantufla".',
          lastKnownLocation: 'Estación de Tren',
          userId: admin.id,
        },
      ]);
      console.log('Test people created');
    }

    const marDelPlataPerson = await Person.findOne({ where: { name: 'Lucia Fernandez' } });
    if (!marDelPlataPerson) {
      const person = await Person.create({
        name: 'Lucia Fernandez',
        alias: 'Luci',
        ageEstimate: 38,
        gender: 'Femenino',
        description: 'Vive en Mar del Plata, zona céntrica. Necesita asistencia regular.',
        lastKnownLocation: 'Mar del Plata, Plaza San Martín',
        userId: admin.id,
      });

      await Report.create({
        personId: person.id,
        latitude: -38.0018,
        longitude: -57.5426,
        urgency: 'Media',
        status: 'Pendiente',
        comment: 'Visto en la Plaza San Martín de Mar del Plata.',
        userId: admin.id,
        createdAt: new Date('2026-05-09'),
        updatedAt: new Date('2026-05-09'),
      });

      console.log('Mar del Plata person and report created');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
