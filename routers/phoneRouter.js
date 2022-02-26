const express = require('express');
const phoneController = require('../controllers/phoneController');
// const protect = require('../middlewares/protect');
// const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

// router.use(protect); //  protect all router which are comming after this middleware
router
  .route('/me')
  .get(phoneController.getMe, phoneController.getUser)
  .patch(phoneController.getMe, phoneController.updateUser);


router
  .route('/search')
  .get(phoneController.searchPhones);

router
  .route('/:id')
  .get(phoneController.getUser)
  .patch(phoneController.updateUser)
  .delete(phoneController.deleteUser);
  // .delete(restrictTo('admin'), userController.deleteUser);

module.exports = router;
