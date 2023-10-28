'use strict';
const { Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA;  // define your schema in options object
}

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        address: "Cherry Boulvard",
        city: "Seattle",
        state: "Washington",
        country: "USA",
        lat: 47.608013,
        lng: -122.335167,
        name: "Big House",
        description: "Large house",
        price: 630.00,
        avgRating: 4.5,
        previewImage: "https://www.bankrate.com/2022/09/01120255/Victorian-style-homes.jpg?auto=webp&optimize=high&crop=16:9"
      },
{
      address: "Orange Boulvard",
      city: "Seattle",
      state: "Washington",
      country: "USA",
      lat: 47.608013,
      lng: -122.335167,
      name: "Small House",
      description: "Tiny House",
      price: 250.00,
      avgRating: 4.5,
      previewImage: "https://www.bostonmagazine.com/wp-content/uploads/sites/2/2023/06/the-pink-house-3.jpg"
},
{
  address: "Apple Boulvard",
  city: "Seattle",
  state: "Washington",
  country: "USA",
  lat: 47.608013,
  lng: -122.335167,
  name: "Medium House",
  description: "Average House",
  price: 350.00,
  avgRating: 4.5,
  previewImage: "https://t3.ftcdn.net/jpg/06/01/84/12/360_F_601841290_YQ6SA4KGRPE44WWlUQngWMvB2cqKiWRz.jpg"
}
])
},

  async down (queryInterface, Sequelize) {
		options.tableName = 'Spots';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(options, {
			address: { [Op.in]: ['Cherry Boulvard', 'Orange Boulvard', 'Apple Boulvard'] }
		}, {});
  }
};
