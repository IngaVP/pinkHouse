const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
const { ReviewImage } = require('../../db/models')

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


//add an image to a review based on the Reviews Id
router.post("/:reviewId/images", 
async (req,res) =>{
    const { reviewId } = req.params
    const { url } = req.body
    const thisReview = await Review.findOne({
        where: {
            id: reviewId
        }
    })

    const newImage = await ReviewImage.create({ reviewId, url})

    return res.json(
        newImage
    )
})



module.exports = router