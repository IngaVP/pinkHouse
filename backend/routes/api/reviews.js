const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { User } = require("../../db/models")

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateReviews = [
    check("review")
    .exists({checkFalsey: true})
    .withMessage("Review text is required"),
    check("stars")
    .isInt({min: 0})
    .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
  ]

//add an image to a review based on the Reviews Id
router.post("/:reviewId/images",requireAuth, 
async (req,res) =>{
    const { reviewId } = req.params
    const { url } = req.body
    const { user } = req
    
    const thisReview = await Review.findOne({
        where: {
            id: reviewId
        },
        include: [{model: ReviewImage}],
    })
    if(user.id !== thisReview.userId){
        const newError = new Error("forbidden")
        newError.status = 403
         throw newError
    }
    
    if(!thisReview){
        res.status(404)
        throw new Error("Review couldn't be found")
    }
    if(thisReview.ReviewImages.length > 9){
        const newError = new Error("Maximum number of images for this resource was reached")
        newError.status = 403
         //res.status(403)
         throw newError
    }
if(thisReview.userId !== user.id){  
     const newError = new Error("forbidden")
newError.status = 403
 throw newError}
    
    const newImage = await ReviewImage.create({ reviewId, url})

    const safeNewReviewImage = {
        id: newImage.id,
        url: newImage.url
    }
res.status(200).json(safeNewReviewImage);

})

//get all reviews written by current user
router.get("/current", requireAuth,
async (req,res) => {
    const { user } = req
    //const currentUserId = user.id



    let currentUsersReviews = await Review.findAll(
         {where: {
             userId: user.id
         }, 
    
       include: [
          {model: User, attributes: ["id","firstName","lastName"]},
         {model: Spot, attributes:  ["id","ownerId","address","city","state", "country","lat","lng","name","price"] },
            {model: ReviewImage, attributes: ["id", "url"]}
     ]
    });

    if(!currentUsersReviews){
        res.status(404)
        throw new Error("Spot couldn't be found")
    }

    // if(currentUsersReviews.userId != user.id){
    //     res.status(403)
    //     throw new Error("Forbidden")
    // }
    
    return res.json(currentUsersReviews)
    
});



//edit a review
router.put("/:reviewId", requireAuth, validateReviews,
async (req,res)=>{
    const { reviewId } = req.params

    const { user } = req
    const {review, stars} = req.body
    
    const reviewToChange = await Review.findOne({
        where: {
            id: reviewId
        }
    });
    if(!reviewToChange){
        res.status(404)
        throw new Error("Review couldn't be found")
    }

    if(reviewToChange.userId !== user.id){
        const newError = new Error("forbidden")
        newError.status = 403
         throw newError
    }
    reviewToChange.update({
        review: review,
        stars: stars
    })
    await reviewToChange.save()

    return res.json(reviewToChange)
}
)
//delete a review
router.delete("/:reviewId", requireAuth,
async (req,res)=>{
    const {reviewId} = req.params
    const { user } = req
    
    // const where = {}

    // where.userId = user.id

    const doomedReview = await Review.findOne({where:{
        id: reviewId
    }})
    if(!doomedReview){
        res.status(404)
        throw new Error("Review couldn't be found")
    }
    if(user.id !== doomedReview.userId){
        res.status(403)
        throw new Error("Forbidden")
    }
    await doomedReview.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
})


module.exports = router