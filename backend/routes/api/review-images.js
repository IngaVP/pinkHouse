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
//delete a review image
router.delete("/:imageId", requireAuth, 

async (req, res) =>{
    const { user } = req
    const {imageId} = req.params
    const parsedImg = parseInt(imageId)

    const reviews = await Review.findOne({
        where: {
            userId: user.id
        }
    });

    if (!reviews){
        const newError = new Error("forbidden")
        newError.status = 403
         throw newError
    }

    const doomedImage = await ReviewImage.findOne({where:{
        id: parsedImg
    }});

    if(!doomedImage){
        const newError = new Error("Review Image couldn't be found")
        newError.status = 404
         throw newError
    }

     await doomedImage.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
}
)


module.exports = router