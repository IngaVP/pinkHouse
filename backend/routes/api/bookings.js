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

    const bookingToBeEdited = await Booking.findByPk(bookingId)

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
        res.status(404)
        throw new Error("Booking couldn't be found")
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