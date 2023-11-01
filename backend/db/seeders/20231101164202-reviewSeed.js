'use strict';
const { Review } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        review: "Exceptional",
        stars: 4
      },{
        spotId: 2,
        userId: 2,
        review: "Note worthy",
        stars: 3
    },     {  spotId: 1,
      userId: 1,
      review: "Odd",
      stars: 3
    }
    ])
  },

  async down (queryInterface, Sequelize) {
		options.tableName = 'Reviews';
		const Op = Sequelize.Op;
		return queryInterface.bulkDelete(options, {
			review: { [Op.in]: ['Exceptional', "Note worthy", "Odd"] }
		}, {});
  }
};
