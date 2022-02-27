const express = require('express');
const phoneController = require('../controllers/phoneController');
// const protect = require('../middlewares/protect');
// const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router
  .route('/search')
  .get(phoneController.searchPhones);

router
  .route("/:slug")
  .get(phoneController.getPhone);

// router.use(protect); //  protect all routes which are coming after this middleware

router
  .route('/add-list/:brandSlug')
  .post(phoneController.addPhoneList);
  
// get all phones from PhoneList, scrap and save all phones detail
router
  .route('/add-from-list')
  .post(phoneController.addPhoneDetailsFromList);
  
//! deprecated :)
router
  .route('/')
  .post(phoneController.addPhone);


module.exports = router;
