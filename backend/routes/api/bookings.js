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

    const doomedBooking = await Booking.findByPk(bookingId)

    await doomedBooking.destroy()

    return res.json({
        "message": "Successfully deleted"
      })
})

module.exports = router