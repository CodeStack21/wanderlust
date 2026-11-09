const express = require("express")
const router = express.Router({mergeParams: true}); // to merge parent and child route --> to get route as /listings/:id/reviews/:reviewId not as --> /reviewId
const wrapAsync = require("../utils/wrapAsync.js")
const Review = require("../models/reviews.js")
const Listing = require("../models/listing.js")
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controllers/reviews.js")

// REVIEWS
// CREATE REVIEW
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview))

// DELETE REVIEW
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;