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

//delete a spot image
router.delete("/:imageId", requireAuth,
async (req,res) =>{
    const { user } = req
    const { imageId } = req.params
    const parsedImgId = parseInt(imageId)

    //find spot that belongs to user
    let spot = await Spot.findOne({where:{ownerId: user.id}})

  if(spot){
    const newError = new Error("forbidden")
  newError.status = 403
   throw newError}

    let doomedImage = await SpotImage.findOne({where: {id: imageId}})

    if(!doomedImage){
      const newError = new Error("Review Image couldn't be found")
      newError.status = 404
       throw newError
    }

    await doomedImage.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
})


module.exports = router