const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
//const { ReviewImage } = require('../../db/models')

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

// // create a review for a spot based on the spot id
// router.post("/:spotId/reviews", 
// async (req, res) => {
//     const {review, stars} = req.body

//     const spotById = await Spot.findByPk(req.params.spotId)

//       let newReview = await Review.create({review, stars})

//       return res.json(newReview)
// })

module.exports = router