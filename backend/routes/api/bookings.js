const express = require('express')
const router = express.Router();
//const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { User } = require("../../db/models")
const { Booking } = require("../../db/models")

const { check } = require('express-validator');
let options = {};
//const { Op } = Sequelize.Op
if (process.env.NODE_ENV === 'production') {
	options.schema = process.env.SCHEMA;
}
const { Op } = require("sequelize")
//const Op = Sequelize.Op;
//const { handleValidationErrors } = require('../../utils/validation');


//ge all of the current users bookings
router.get("/current", requireAuth,
async (req,res) =>{
    const { user } = req

    const currentBookings = await Booking.findAll({where:{
        userId: user.id
    }, include : [{model: Spot}]});

    res.json(currentBookings)

})


//edit a booking 

router.put("/:bookingId", requireAuth,
async (req, res) =>{
    const { bookingId } = req.params

    const { startDate, endDate } = req.body
    const { user } = req

    const parsedEnd = Date.parse(endDate)
    const parsedStart = Date.parse(startDate) 
  
     if(parsedEnd <= parsedStart){
      const newError = new Error("Bad Request")
       newError.status = 400
       const errorObject = {"endDate": "endDate cannot be on or before startDate"}
      newError.errors = errorObject
        throw newError
     }

     let checkForExistingBooking = await Booking.findOne(
        {where: {endDate: {[Op.between]: [endDate, startDate]}}})
    
      let checkForExistingBooking2 = await Booking.findOne(
          {where: {endDate: {[Op.between]: [endDate, startDate]}}})

    
      if(startDate === (checkForExistingBooking.endDate || checkForExistingBooking.startDate)){
        const newError = new Error("Sorry, this spot is already booked for the specified dates")
        newError.status = 403
        newError.errors = {
          "endDate": "End date conflicts with an existing booking"
        }
         throw newError
      }

    const bookingToBeEdited = await Booking.findByPk(bookingId)
    if(bookingToBeEdited.userId !== user.id){
        const newError = new Error("forbidden")
        newError.status = 403
         throw newError
    }

    bookingToBeEdited.update({
        startDate: startDate,
        endDate: endDate
    })

    await bookingToBeEdited.save()

    return res.json(bookingToBeEdited)
})


//delete a booking

router.delete("/:bookingId", requireAuth,
async (req,res) =>{
    const { bookingId } = req.params

    const { user } = req

    const doomedBooking = await Booking.findOne({where:{id: bookingId}, include: [{model: User}]})

    if(!doomedBooking){
        const newError = new Error("Booking couldn't be found")
        newError.status = 404
         throw newError
    }

    //Booking must belong to the current user or the Spot must belong to the current user
    if (doomedBooking.userId === user.id || doomedBooking.User.id === doomedBooking.ownerId){

    await doomedBooking.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
    } else{
        res.status(403)
        throw new Error ("Forbidden")
    }
})

module.exports = router