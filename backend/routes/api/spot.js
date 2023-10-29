const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot } = require('../../db/models');

const { SpotImage } = require('../../db/models')

const { Review } = require('../../db/models')

const { ReviewImage } = require('../../db/models')

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


// router.get("/:spotId/reviews", 
// async (req,res) =>{
//     const { spotId } = req.params

//     const allOfaSpotsReviews = await Spot.findAll({    
//         where: {
//         id: spotId
//         },
//         include: Review
//     })
//         return res.json({Review})


// })

//get all reviews by a spot Id

router.get("/:spotId/reviews", 
async (req,res) =>{
    const { spotId } = req.params
    
    const where = {}

    where.spotId = spotId

    const allOfaSpotsReviews = await Review.findAll({    
        // where: {
        // id: spotId
        // },
     include: [{model: ReviewImage}]
    });
    return res.json(allOfaSpotsReviews)
})
//add an image to a spot based on spot id
router.post('/:spotId/images', requireAuth, async (req, res) => {
   //grab spot id from params, and get url and preview from body
   const spotId = req.params.spotId;
   const {url, preview} = req.body;
 //get instance that matches the id provided from the DB
   const spotIdFromDb = await Spot.findOne({
     where: {
       id: spotId
     }
   });
   //if that instance exists
   if(spotIdFromDb){
      //create a new image
     const image = await SpotImage.create({spotId, url, preview});
     const {id} = image;
   return res.json({
     id,
     url,
     preview
   })
   }else{
     throw new Error({
       "message": "Spot couldn't be found"
     });
   } 
 });

router.get("/:spotId", 
async (req, res) =>{
   const { spotId } = req.params
   const spotById = await Spot.findOne({
      where: {
        id: spotId
      }
    });
    return res.json(
      spotById
    );
})
//edit a spot
router.put("/:spotId",
async (req, res) =>{
   const { address,city,state,country,lat,lng,name,description,price} = req.body
   const { spotId } = req.params
   const spotToChange = await Spot.findOne({  
      where: {
      id: spotId
    }
   });
   spotToChange.address = address
   spotToChange.city = city
   spotToChange.country = country
   spotToChange.lat = lat
   spotToChange.lng = lng
   spotToChange.name = name
   spotToChange.description = description
   spotToChange.price = price

   return res.json(
      spotToChange
   )
})

//delete a spot

router.delete("/:spotId", 
async (req,res) =>{
   //const { spotId } = req.params.spotId

   const spotToDelete = await Spot.findByPk(req.params.spotId);

   await spotToDelete.destroy()

   return res.json(
      {
         "message": "Successfully deleted"
       }
   )

}
)

//get all spots owned by the current user
router.get("/current",
async (req,res) =>{
   const { spots } = req;
   if (spots) {
     const userSpots = {
      address: spots.address,
      city: spots.city,
      state: spots.state,
      country: spots.country,
      lat: spots.lat,
      lng: spots.lng,
      name: spots.name,
      description: spots.description,
      price: spots.price
     };
     return res.json({
       spot: userSpots
     });
   } else return res.json({ spot: null });
}
)
//get all spots
router.get("/", async (req, res) => {
   const spots = await Spot.findAll();
  
   return res.json(spots);
  });
router.post("/", async (req,res) =>{

  const {address,city,state,country,lat,lng,name,description,price} = req.body


     const newSpot = await Spot.create({
       address,city,state,country,lat,lng,name,description,price
   });

    return res.json(newSpot)
})

// create a review for a spot based on the spot id
router.post("/:spotId/reviews", 
async (req, res) => {
    const {review, stars} = req.body

    const spotById = await Spot.findByPk(req.params.spotId)

      let newReview = await Review.create({review, stars})

      return res.json(newReview)
})

module.exports = router