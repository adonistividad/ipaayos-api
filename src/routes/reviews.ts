const express = require('express');
const router = express.Router({});

import ReviewsController from '../controllers/reviews';
import AuthMiddleware from '../middlewares/Auth';
import ConnectDB from '../middlewares/ConnectDB';

const Auth = new AuthMiddleware();
const DB = new ConnectDB();
const Reviews = new ReviewsController();

router.post('/reviews/fetch', [DB.ConnectToDB], Reviews.FetchReview);
router.post('/reviews/fetch-all', [DB.ConnectToDB], Reviews.FetchReviews);
router.post('/reviews/update', [DB.ConnectToDB], Reviews.UpdateReview);

export default router;
