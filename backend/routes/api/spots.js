const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot } = require('../../db/models');

const { SpotImage } = require('../../db/models')

const { Review } = require('../../db/models')

const { ReviewImage } = require('../../db/models')

const { Booking } = require('../../db/models')

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
  check('address')
  //check('city')
  // check('email')
  //   .exists({ checkFalsy: true })
  //   .isEmail()
  //   .withMessage('Please provide a valid email.'),
  // check('username')
  //   .exists({ checkFalsy: true })
  //   .isLength({ min: 4 })
  //   .withMessage('Please provide a username with at least 4 characters.'),
  // check('username')
  //   .not()
  //   .isEmail()
  //   .withMessage('Username cannot be an email.'),
  // check('password')
  //   .exists({ checkFalsy: true })
  //   .isLength({ min: 6 })
  //   .withMessage('Password must be 6 characters or more.'),
  // handleValidationErrors
];
//get all bookings for a Spot based on the spots id

router.get("/:spotId/bookings", requireAuth, 
async (req, res) =>{
  const {spotId} = req.params

  const alltheBookings = await Booking.findAll({where:{
    spotId: spotId
  }})

  return(res.json(alltheBookings))
}
)


//create a booking from a spot based on the spot Id

router.post("/:spotId/bookings", requireAuth,
async (req,res)=>{

  const { spotId } = req.params;
  const { user } = req

  let thisSpot = await Spot.findByPk(spotId)

 let newBooking =  await Booking.create({
    spotId: spotId,
    userId: user.id,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  })
//console.log
  return res.json(newBooking)
})


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
router.get("/current", requireAuth,
async (req,res) =>{

  const { user } = req

 // const where = {}

 // where.ownerId = user.id

  const Spots = await Spot.findAll(
    {where:{
      ownerId: user.id

  }});

  return(res.json({Spots}))

}
)

// create a review for a spot based on the spot id
router.post("/:spotId/reviews", 
async (req, res) => {
    const {review, stars} = req.body

    const spotById = await Spot.findByPk(req.params.spotId)

      let newReview = await Review.create({review, stars})

      return res.json(newReview)
})

//get all spots
router.get("/", async (req, res) => {
   const spots = await Spot.findAll();
  
   return res.json(spots);
  });


//create a spot
router.post("/", requireAuth, async (req,res) =>{

  const {address,city,state,country,lat,lng,name,description,price} = req.body


     const newSpot = await Spot.create({
       address,city,state,country,lat,lng,name,description,price
   });

    return res.json(newSpot)
})



//add query filters
router.get("/", 
async (res,req) =>{

  const  {page, size} = req.query


  const where = {};
	const query = {};

  if(size >= 1 && size <=10){
    size = 1
  } else{
    parseInt(size)
  };

  if (page >= 1 && page <=20){
    page = 20
  } else{
    parseInt(page)
  };
  query.limit = size;
	query.offset = size * (page - 1);

  let Spots = await Spot.findAll({	where,
		...query,})

    return res.json({Spots,page,size}
    );
})

module.exports = router