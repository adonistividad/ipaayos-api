const express = require('express');
const router = express.Router({});

import UserController from '../controllers/user';
import AuthMiddleware from '../middlewares/Auth';
import ConnectDB from '../middlewares/ConnectDB';

const Auth = new AuthMiddleware();
const DB = new ConnectDB();
const User = new UserController();

router.post('/user/signup', [DB.ConnectToDB], User.SignupUser);
router.post('/user/signin', [DB.ConnectToDB], User.SigninUser);
router.post('/user/verify-account', [DB.ConnectToDB], User.VerifyAccount);
router.post('/user/fetch-one', [DB.ConnectToDB], User.FetchUser);
router.post('/user/update', [DB.ConnectToDB], User.UpdateUser);
//-- router.post('/user/fetch-user-details', [DB.ConnectToDB], User.FetchUserDetails);
//-- router.post('/user/update-user-details', [DB.ConnectToDB], User.UpdateUserDetails);

router.post('/user/send-otp', [DB.ConnectToDB], User.SendOTP);
router.post('/user/verify-otp', [DB.ConnectToDB], User.VerifyOTP);
router.post('/user/forgot-password', [DB.ConnectToDB], User.ForgotPassword);
router.post('/user/reset-password', [DB.ConnectToDB], User.ResetPassword);
router.post('/user/verify-status', [Auth.VerifyAuthToken], User.CheckUserStatus);
router.post('/user/account-settings', [Auth.VerifyAuthToken], User.AccountSettings);
router.post('/user/auth', [Auth.VerifyAuthToken], User.AuthenticateUser);
router.post('/user/resend-verification-email', [Auth.VerifyAuthToken], User.ResendEmailVerification);
router.post('/user/dashboard-status', [Auth.VerifyAuthToken], User.UpdateDashboardStatus);
router.post('/user/test-email', User.EmailTestingAPI);

router.post('/user/fetch-badges', [DB.ConnectToDB], User.FetchBadges);

export default router;
