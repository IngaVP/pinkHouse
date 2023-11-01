const express = require('express')

const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot } = require('../../db/models');

const { SpotImage } = require('../../db/models')

const { Review } = require('../../db/models')

const { ReviewImage } = require('../../db/models')

const { Booking } = require('../../db/models')

const { User } = require('../../db/models')

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


const router = express.Router();
const validateSpotCreation = [
  check('address')
  .exists({checkFalsey: true})
  .withMessage("Street address is required"),
  check('city')
  .exists({checkFalsey: true})
  .withMessage("City is required"),
  check("state")
  .exists({checkFalsey: true})
  .withMessage("State is required"),
  check("country")
  .exists({checkFalsey: true})
  .withMessage("Country is required"),
  check("lat")
  .exists({checkFalsey: true})
  .withMessage("Latitude is not valid"),
  check("lng")
  .exists({checkFalsey: true})
  .withMessage("Longitude is not valid"),
  check("name")
  .isLength({max: 50})
  .withMessage("Name must be less than 50 characters"),
  check("description") 
  .exists({checkFalsey: true})
  .withMessage("Description is required"),
  check("price")
  .isInt({ min: 0})
  .withMessage("Price per day is required"),
  handleValidationErrors
];



const validateSpotImage = [
  check("url")
  .exists({checkFalsey: true}),
  check("preview")
  .exists({checkFalsey: true}),
  handleValidationErrors
]

const validateReviews = [
  check("review")
  .exists({checkFalsey: true})
  .withMessage("Review text is required"),
  check("stars")
  .isInt({min: 0})
  .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors
]

//add an image to a spot based on spot id
router.post('/:spotId/images', requireAuth, async (req, res) => {
  //grab spot id from params, and get url and preview from body
  const spotId = req.params.spotId;
  const { url, preview } = req.body;
  const { user } = req
//get instance that matches the id provided from the DB
  const spot = await Spot.findOne({
    where: {
      id: spotId
    }
  });

  if(!spot){
    res.status(404)
     throw new Error(
        "Spot couldn't be found"
     );
   };

if (spot.ownerId !== user.id){
    res.status(403)
    throw new Error(
      "Forbidden"
      )
     };

     
    const image = await SpotImage.create({spotId, url, preview});
    const {id} = image;
  return res.json({
    id,
    url,
    preview
  })
  
});
//get all bookings for a Spot based on the spots id

router.get("/:spotId/bookings", requireAuth, 
async (req, res) =>{
  const {spotId} = req.params

  const { user } = req

  const Bookings = await Booking.findAll({where:{
    spotId: spotId
  }})

  if(!Bookings.length){
    res.status(404)
    throw new Error("Spot couldn't be found")
  }

  if(user.id !== Bookings.UserId){
    res.json({Bookings})

  } else{ 
    const Bookings = await Booking.findAll({where:{
      spotId: spotId
    }, include: [{model: User}]})
    res.json(Bookings)
  }
}
)

//get all spots owned by the current user
router.get("/current", requireAuth,
async (req,res) =>{

 const { user } = req


  const Spots = await Spot.findAll(
    {where:{
      ownerId: user.id

  }});
// const id = req.user.id
// //const id = req.user.id;
//     console.log("Current User ID:", id);
//     //find spots where ownerId = current user, also include associated model review and spotimage.
//     const spots = await Spot.findAll({
//         include: [{model: Review}, {model:SpotImage}],
//         where: { ownerId: id}
//     })

  return(res.json({Spots}))

}
)
// create a review for a spot based on the spot id
router.post("/:spotId/reviews", requireAuth, validateReviews,
async (req, res) => {
    const { review, stars } = req.body

    const { user } = req

    const { spotId } = req.params

    const parsedspotId = parseInt(spotId)

    const spotById = await Spot.findByPk(parsedspotId)

    if (!spotById){
      res.status(404);
      throw new Error("Spot couldn't be found")
    }

    const previousReviewChecker = await Review.findOne({
      where:{userId: user.id, spotId: parsedspotId}
    })

    if(previousReviewChecker){
      res.status(500)
      throw new Error("User already has a review for this spot")
    }
      let newReview = await Review.create({userId: user.id, spotId: parsedspotId, review,
        stars})

      return res.json(newReview)
})

//create a booking from a spot based on the spot Id

router.post("/:spotId/bookings", requireAuth,
async (req,res)=>{

  const { spotId } = req.params;
  const { user } = req

  let thisSpot = await Spot.findByPk(spotId)

  let checkForExistingBooking = await Booking.findOne({
    where:{
      startDate: req.body.startDate,
      endDate: req.body.EndDate
    }
  })

  if(checkForExistingBooking){
    res.status(403)
    throw new Error("Sorry, this spot is already booked for the specified dates")
  }

  if(!thisSpot){
    res.status(404)
    throw new Error("Spot couldn't be found")
  }

  if(thisSpot.ownerId === user.id){
    res.json(403)
    throw new Error("Forbidden")
  }

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
    
    const allOfaSpotsReviews = await Review.findAll({    
        where: {
        spotId: spotId
        },
      include: [{model: ReviewImage}]
    });

    if(!allOfaSpotsReviews.length){
      res.status(404)
      throw new Error("Spot couldn't be found")
    }
    
    return res.json(allOfaSpotsReviews)
})


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
router.put("/:spotId", requireAuth, validateSpotCreation,
async (req, res) =>{
   const { address,city,state,country,lat,lng,name,description,price} = req.body
   const { user } = req
   const { spotId } = req.params

   const spotToChange = await Spot.findOne({  
      where: {
      id: spotId
    }
   });
   if(!spotToChange){
    res.status(404)
    return res.json({
      "message": "Spot couldn't be found"
    })
   }
   
   spotToChange.update({
   address: address,
   city: city,
   state: state,
   country: country,
   lat: lat,
   lng: lng,
   name: name,
   description: description,
   price: price,
   })

await spotToChange.save()

if(user.id === spotToChange.ownerId){
   return res.json(
      spotToChange
   )
} else{
  const err = new Error('User does not have correct role or permission');
  err.title = 'Permissions';
  err.errors = { message: 'Forbidden' };
  err.status = 403;
  return res.json(err)
};
})

//delete a spot

router.delete("/:spotId", requireAuth,
async (req,res) =>{
   //const { spotId } = req.params.spotId

   const { user } = req

   const { spotId } = req.params

   let spotIdParsed = parseInt(spotId)

   const spotToDelete = await Spot.findByPk(spotIdParsed);

   if(!spotToDelete){
    res.status(404)
    throw new Error(
      "Spot couldn't be found"
    )
   }

   if (user.id !== spotToDelete.ownerId){
    res.status(403)
    throw new Error("forbidden")
   }
   await spotToDelete.destroy()

   return res.json(
      {
         "message": "Successfully deleted"
       }
   )

}
)
//get all spots
router.get("/", async (req, res) => {
   const spots = await Spot.findAll();
  
   return res.json(spots);
  });


//create a spot
router.post("/", validateSpotCreation, requireAuth, async (req,res) =>{

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