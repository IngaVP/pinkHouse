const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { User } = require("../../db/models")
const { SpotImage } = require("../../db/models")


const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

router.delete("/:imageId", requireAuth, 

async (req, res) =>{
    const { user } = req

    const reviews = await Review.findOne({
        where: {
            userId: user.id
        }
    });

    const reviewId = reviews.reviewId
    const doomedImage = await ReviewImage.findOne({where:{
        reviewId: reviewId
    }});

    await doomedImage.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
}
)


module.exports = router