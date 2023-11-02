'use strict';
const { Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: "Cherry Boulvard",
        city: "Seattle",
        state: "Washington",
        country: "USA",
        lat: 47.608013,
        lng: -122.335167,
        name: "Big House",
        description: "Large house",
        price: 630.00,
      },
{
  ownerId: 2,
      address: "Orange Boulvard",
      city: "Seattle",
      state: "Washington",
      country: "USA",
      lat: 47.608013,
      lng: -122.335167,
      name: "Small House",
      description: "Tiny House",
      price: 250.00,
},
{
  ownerId: 3,
  address: "Apple Boulvard",
  city: "Seattle",
  state: "Washington",
  country: "USA",
  lat: 47.608013,
  lng: -122.335167,
  name: "Medium House",
  description: "Average House",
  price: 350.00,
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
