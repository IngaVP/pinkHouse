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
let options = {}
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA;
}
const { Op } = require("sequelize")
const sequelize = require("sequelize")


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
  
  const { spotId } = req.params;
  const parsedpot = parseInt( spotId )
  const { url, preview } = req.body;
  const { user } = req

  const spot = await Spot.findByPk(parsedpot);

  if(!spot){
     const newError = new Error("Spot couldn't be found")
     newError.status = 404
      throw newError
   };

if (user.id !== spot.ownerId){
  const newError = new Error("forbidden")
  newError.status = 403
   //res.status(403)
   throw newError
 };

     
    const image = await SpotImage.create({spotId, url, preview});
    const {id} = image;
  return res.json({image})
  
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


  // const Spots = await Spot.findAll(
  //   {where:{
  //     ownerId: user.id

  // }});

  
  let Spots = []

  const aggregateSpots = await Spot.findAll({where: {ownerId: user.id}})

  for(let element of aggregateSpots){

    const reviewCheck = await Review.findOne({ where:{userId: user.id}})

    let aggregatePreview = await SpotImage.findOne({
      where: {spotId: element.id, preview:true},
      raw: true,
     })

console.log(element)
if(aggregatePreview && reviewCheck){
  
  const original = await Spot.findOne(
    {where:{id: element.id}, 

    include: [{model:Review, attributes: []}, {model: SpotImage, where: {preview: true}, attributes: ["url"]}], 
    attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt",
    [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]]
  });

    let spotObject = {
      id: original.id,
      ownerId: original.ownerId,
      address: original.address,
      city: original.city,
      state: original.state,
      country: original.country,
      lat: original.lat,
      lng: original.lng,
      name: original.name,
      description: original.description,
      price: original.price,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
      avgRating: original.avgRating,
      previewImage: aggregatePreview.url
    }
    Spots.push(spotObject)
  } else if (!aggregatePreview && reviewCheck){
    
    const original = await Spot.findByPk( element.id, {
  //    {where:{id: element.id}, 

      include: [{model:Review, attributes: []}], 
      attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt",
      [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]]
    });

    console.log(original)
    let spotObject = {
      id: original.id,
      ownerId: original.ownerId,
      address: original.address,
      city: original.city,
      state: original.state,
      country: original.country,
      lat: original.lat,
      lng: original.lng,
      name: original.name,
      description: original.description,
      price: original.price,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
      avgRating: original.avgRating,
      previewImage: null
    }
    Spots.push(spotObject)
  } else if (aggregatePreview && !reviewCheck){
    
    const original = await Spot.findOne(
      {where:{id: element.id}, 

      include: [{model:Review, attributes: []}, {model: SpotImage, where: {preview: true}, attributes: ["url"]}], 
      attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt"]
    });
  let spotObject = {
    id: original.id,
    ownerId: original.ownerId,
    address: original.address,
    city: original.city,
    state: original.state,
    country: original.country,
    lat: original.lat,
    lng: original.lng,
    name: original.name,
    description: original.description,
    price: original.price,
    createdAt: original.createdAt,
    updatedAt: original.updatedAt,
    avgRating: null,
    previewImage: aggregatePreview.url
  }
  Spots.push(spotObject)
  } else if (!aggregatePreview && !reviewCheck){

    
    const original = await Spot.findOne(
      {where:{id: element.id}, 

      // include: [{model:Review, attributes: []}, {model: SpotImage, where: {preview: true}, attributes: ["url"]}], 
      // attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt",]
    });

    console.log(element.id)
    let spotObject = {
      id: element.id,
      ownerId: original.ownerId,
      address: original.address,
      city: original.city,
      state: original.state,
      country: original.country,
      lat: original.lat,
      lng: original.lng,
      name: original.name,
      description: original.description,
      price: original.price,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
      avgRating: null,
      previewImage: null
    }
    Spots.push(spotObject)
  }
}

return res.json(Spots)

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
//const { Op } = require("sequelize");
router.post("/:spotId/bookings", requireAuth,
async (req,res)=>{

  const { spotId } = req.params;
  const { user } = req
  const { startDate, endDate } = req.body
  const parsedEnd = Date.parse(endDate)

  const parsedStart = Date.parse(startDate) 

  let start = new Date(startDate)
  let end = new Date(endDate)

   if(parsedEnd <= parsedStart){
    const newError = new Error("Bad Request")
     newError.status = 400
     const errorObject = {"endDate": "endDate cannot be on or before startDate"}
    newError.errors = errorObject
      throw newError
   }
  let thisSpot = await Spot.findByPk(spotId)

  if(!thisSpot){
    res.status(404)
    throw new Error("Spot couldn't be found")
  }

  if(thisSpot.ownerId === user.id){
    const newError = new Error("forbidden")
    newError.status = 403
     throw newError
}
  let checkForExistingBooking = await Booking.findOne(
    {where: {endDate:({[Op.between]: [start, end]})}})

    let checkForExistingBooking2 = await Booking.findOne(
      {where: {startDate:({[Op.between]: [start,end]})}})


if(checkForExistingBooking){
//start date falls on other start or end date
  if(Date.parse(new Date(startDate)) === ((Date.parse(checkForExistingBooking2.startDate)) || Date.parse(new Date(endDate)) === Date.parse(checkForExistingBooking2.startDate))){
    const newError = new Error("Sorry, this spot is already booked for the specified dates")
    newError.status = 403
    newError.errors = {
      "startDate": "Start date conflicts with an existing booking"
    }
     throw newError
  }


//end date falls on other start or end date 
  if((Date.parse(new Date(endDate)) === (Date.parse(checkForExistingBooking.startDate) || Date.parse(checkForExistingBooking.endDate)))){
  
    const newError = new Error("Sorry, this spot is already booked for the specified dates")
    newError.status = 403
    newError.errors = {
      "endDate": "End date conflicts with an existing booking"
    }
     throw newError
  } 

  if (Date.parse(new Date(startDate)) < Date.parse(checkForExistingBooking.startDate) && Date.parse(checkForExistingBooking.endDate) < Date.parse(new Date(endDate))) {
    const newError = new Error("Sorry, this spot is already booked for the specified dates")
    newError.errors = {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking"
                }
      newError.status = 403
      throw newError
    }
//dates in the past
//console.log("now", Date.parse(Date.now()))
if(Date.parse(new Date(startDate)) < Date.now() || Date.parse(new Date(endDate)) < Date.now()){
  const newError = new Error("Date cannot be in the past")
    newError.status = 403
    throw newError
}

//within existing booking
if((Date.parse(checkForExistingBooking.startDate) < Date.parse(new Date(startDate))) && (Date.parse(new Date(endDate)) > Date.parse(checkForExistingBooking.startDate))){
  const newError = new Error("Sorry, this spot is already booked for the specified dates")
  newError.errors = {
      startDate: "Start date conflicts with an existing booking",
     // endDate: "End date conflicts with an existing booking"
              }
    newError.status = 403
    throw newError
}


if(Date.parse(checkForExistingBooking.startDate) < Date.parse(new Date(endDate)) && (Date.parse(new Date(endDate))) > Date.parse(checkForExistingBooking.startDate)){
  const newError = new Error("Sorry, this spot is already booked for the specified dates")
  newError.errors = {
     // startDate: "Start date conflicts with an existing booking",
      endDate: "End date conflicts with an existing booking"
              }
    newError.status = 403
    throw newError
}

}

 let newBooking =  await Booking.create({
    spotId: spotId,
    userId: user.id,
    startDate: startDate,
    endDate: endDate
  })
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


router.get("/:spotId" ,requireAuth, 
async (req, res) =>{
   const { spotId } = req.params

   const spotById = await Spot.findOne({
      where: {
        id: spotId
      }, include: [{model:SpotImage}, {model:User}]
    });

    if(!spotById){
      res.status(404)
      throw new Error("Spot couldn't be found")
    }
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
      "message": "Spot couldn't be found"})
   }

   console.log("user id", user.id)
   console.log("spotToChange.ownerId", spotToChange.ownerId)

   if(user.id !== spotToChange.ownerId){
    const newError = new Error("forbidden")
    newError.status = 403
     //res.status(403)
     throw newError
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

   return res.json(
      spotToChange
   )

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
    const newError = new Error("forbidden")
    newError.status = 403
     //res.status(403)
     throw newError
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
router.get("/", requireAuth, async (req, res) => {

  let Spots = []

  const aggregateSpots = await Spot.findAll({group: Spot.id})

  for(let element of aggregateSpots){

    const reviewCheck = await Review.findOne({ where:{spotId: element.id}})

    let aggregatePreview = await SpotImage.findOne({
      where: {spotId: element.id, preview:true},
      raw: true,
     })

console.log(element)
if(aggregatePreview && reviewCheck){
  
  const original = await Spot.findOne(
    {where:{id: element.id}, 

    include: [{model:Review, attributes: []}, {model: SpotImage, where: {preview: true}, attributes: ["url"]}], 
    attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt",
    [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]]
  });

    let spotObject = {
      id: original.id,
      ownerId: original.ownerId,
      address: original.address,
      city: original.city,
      state: original.state,
      country: original.country,
      lat: original.lat,
      lng: original.lng,
      name: original.name,
      description: original.description,
      price: original.price,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
      avgRating: original.avgRating,
      previewImage: aggregatePreview.url
    }
    Spots.push(spotObject)
  } else if (!aggregatePreview && reviewCheck){
    
    const original = await Spot.findByPk( element.id, {
  //    {where:{id: element.id}, 

      include: [{model:Review, attributes: []}], 
      attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt",
      [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]]
    });

    console.log(original)
    let spotObject = {
      id: original.id,
      ownerId: original.ownerId,
      address: original.address,
      city: original.city,
      state: original.state,
      country: original.country,
      lat: original.lat,
      lng: original.lng,
      name: original.name,
      description: original.description,
      price: original.price,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
      avgRating: original.avgRating,
      previewImage: null
    }
    Spots.push(spotObject)
  } else if (aggregatePreview && !reviewCheck){
    
    const original = await Spot.findOne(
      {where:{id: element.id}, 

      include: [{model:Review, attributes: []}, {model: SpotImage, where: {preview: true}, attributes: ["url"]}], 
      attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt"]
    });
  let spotObject = {
    id: original.id,
    ownerId: original.ownerId,
    address: original.address,
    city: original.city,
    state: original.state,
    country: original.country,
    lat: original.lat,
    lng: original.lng,
    name: original.name,
    description: original.description,
    price: original.price,
    createdAt: original.createdAt,
    updatedAt: original.updatedAt,
    avgRating: null,
    previewImage: aggregatePreview.url
  }
  Spots.push(spotObject)
  } else if (!aggregatePreview && !reviewCheck){

    
    const original = await Spot.findOne(
      {where:{id: element.id}, 

      // include: [{model:Review, attributes: []}, {model: SpotImage, where: {preview: true}, attributes: ["url"]}], 
      // attributes: ["ownerId","address", "city","state","country","lat","lng","name","description","price","createdAt","updatedAt",]
    });

    console.log(element.id)
    let spotObject = {
      id: element.id,
      ownerId: original.ownerId,
      address: original.address,
      city: original.city,
      state: original.state,
      country: original.country,
      lat: original.lat,
      lng: original.lng,
      name: original.name,
      description: original.description,
      price: original.price,
      createdAt: original.createdAt,
      updatedAt: original.updatedAt,
      avgRating: null,
      previewImage: null
    }
    Spots.push(spotObject)
  }
}

return res.json(Spots)
})


//create a spot
router.post("/", requireAuth, validateSpotCreation, async (req,res) =>{

  const {address,city,state,country,lat,lng,name,description,price} = req.body
  const { user } = req

     const newSpot = await Spot.create({
       ownerId: user.id, address,city,state,country,lat,lng,name,description,price
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