'use strict';

const permissionNames = [
  'users_users_index',
  'users_users_create',
  'users_users_show',
  'users_users_update',
  'users_users_destroy'
];

const inQuery = `(${permissionNames.map(name => `'${name}'`).join(', ')})`;

module.exports = {
  up: (queryInterface) => {

    return queryInterface.sequelize
      .query('SELECT id FROM roles WHERE name=\'admin\' LIMIT 1', { plain: true })
      .then((adminRole) => {

        return queryInterface.sequelize
          .query(`SELECT id FROM permissions WHERE action IN ${inQuery}`)
          .then((result) => result[0])
          .then((permissions) => {

            return queryInterface.bulkInsert('role_permissions', permissions.map((permission) => {

              return {
                role_id: adminRole.id,
                permission_id: permission.id,
                created_at: new Date(),
                updated_at: new Date()
              };
            }));
          });
      });
  },

  down: (queryInterface, Sequelize) => {

    const Op = Sequelize.Op;

    return queryInterface.sequelize
      .query('SELECT id FROM roles WHERE name=\'admin\' LIMIT 1', { plain: true })
      .then((adminRole) => {

        return queryInterface.sequelize
          .query(`SELECT id FROM permissions WHERE action IN ${inQuery}`)
          .then((result) => result[0])
          .then((permissions) => {

            return queryInterface.bulkDelete('role_permissions', {
              role_id: adminRole.id,
              permission_id: {
                [Op.in]: permissions.map(permission => permission.id)
              }
            });
          });
      });
  }
};
