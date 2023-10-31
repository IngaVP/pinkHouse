// backend/routes/api/users.js
const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

<<<<<<< HEAD
const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];
=======

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];
>>>>>>> dev

//sign up
router.post(
    '/',
    validateSignup,
    async (req, res) => {
      const { email, password, username, firstName, lastName } = req.body;
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({ email, username, hashedPassword, firstName, lastName});
  
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      };
  
      await setTokenCookie(res, safeUser);
  
      return res.json({
        user: safeUser
      });
    }
  );

  // Restore session user
// router.get(
//     '/',
//     (req, res) => {
//       const { user } = req;
//       if (user) {
//         const safeUser = {
//           id: user.id,
//           email: user.email,
//           username: user.username,
//         };
//         return res.json({
//           user: safeUser
//         });
//       } else return res.json({ user: null });
//     }
//   );

<<<<<<< HEAD

=======
>>>>>>> dev


//   // Sign up
// router.post(
//     '/',
//     validateSignup,
//     async (req, res) => {
//       const { email, password, username, lastName, firstName} = req.body;
//       const hashedPassword = bcrypt.hashSync(password);
//       const user = await User.create({ email, username, lastName, firstName, hashedPassword });
  
//       const safeUser = {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         lastName: user.lastName,
//         firstName: user.firstName
//       };
  
//       await setTokenCookie(res, safeUser);
  
//       return res.json({
//         user: safeUser
//       });
//     }
//   );

module.exports = router;