'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
<<<<<<< HEAD
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        username: 'Demo-lition',
        email: 'demo@user.io',
        // firstName: "Demo",
        // lastName: "Demio",
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        username: 'FakeUser1',
        email: 'user1@user.io',
        // firstName: "Test",
        // lastName: "thisTest",
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        username: 'FakeUser2',
        email: 'user2@user.io',
        // firstName: "Testing",
        // lastName: "Testtting",
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    }, {});
  }
};
=======
	async up(queryInterface, Sequelize) {
		await User.bulkCreate([
			{
				email: 'demo@user.io',
				username: 'Demo-lition',
				firstName: "Demo",
				lastName: "Lition",
				hashedPassword: bcrypt.hashSync('password')
			},
			{
				email: 'user1@user.io',
				username: 'FakeUser1',
				firstName: "Fake",
				lastName: "User",
				hashedPassword: bcrypt.hashSync('password2')
			},
			{
				email: 'user2@user.io',
				username: 'FakeUser2',
				firstName: "Faketwo",
				lastName: "Usertwo",
				hashedPassword: bcrypt.hashSync('password3')
			}
		], { validate: true });
	},

	async down(queryInterface, Sequelize) {
		options.tableName = 'Users';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(options, {
			username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
		}, {});
	}
};

// 'use strict';

// const { User } = require('../models');
// const bcrypt = require("bcryptjs");

// let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA;  // define your schema in options object
// }

// module.exports = {
//   async up (queryInterface, Sequelize) {
//     await User.bulkCreate([
//       {
//         email: 'demo@user.io',
//         username: 'Demo-lition',
//         firstName: "Demo",
//         lastName: "Lition",
//         hashedPassword: bcrypt.hashSync('password')
//       },
//       {
//         email: 'user1@user.io',
//         username: 'FakeUser1',
//         firstName:"Fake",
//         lastName: "User",
//         hashedPassword: bcrypt.hashSync('password2')
//       },
//       {
//         email: 'user2@user.io',
//         username: 'FakeUser2',
//         firstName: "Faketwo",
//         lastName: "Usertwo",
//         hashedPassword: bcrypt.hashSync('password3')
//       }
//     ], { validate: true });
//   },

//   async down (queryInterface, Sequelize) {
//     options.tableName = 'Users';
//     const Op = Sequelize.Op;
//     return queryInterface.bulkDelete(options, {
//       username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
//     }, {});
//   }
// };
>>>>>>> dev
