const User = require('./User');
const Person = require('./Person');
const Report = require('./Report');
const Group = require('./Group');

User.belongsTo(Group, { foreignKey: 'groupId' });
Group.hasMany(User, { foreignKey: 'groupId' });

Person.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Person, { foreignKey: 'userId' });

Report.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Report, { foreignKey: 'userId' });

Report.belongsTo(Person, { foreignKey: 'personId' });
Person.hasMany(Report, { foreignKey: 'personId' });

module.exports = {
  User,
  Person,
  Report,
  Group,
};
