const express = require('express');
const router = express.Router({});

import ProviderController from '../controllers/providers';
import AuthMiddleware from '../middlewares/Auth';
import ConnectDB from '../middlewares/ConnectDB';

const Auth = new AuthMiddleware();
const DB = new ConnectDB();
const Provider = new ProviderController();

router.post('/provider/fetch-one', [DB.ConnectToDB], Provider.FetchProvider);
router.post('/provider/fetch-all', [DB.ConnectToDB], Provider.FetchProviders);
router.post('/provider/update', [DB.ConnectToDB], Provider.UpdateProvider);
router.post('/provider/signup', [DB.ConnectToDB], Provider.SignupUser);
router.post('/provider/verify-account', [DB.ConnectToDB], Provider.VerifyAccount);
router.post('/provider/signin', [DB.ConnectToDB], Provider.SigninUser);
router.post('/provider/send-otp', [DB.ConnectToDB], Provider.SendOTP);
router.post('/provider/verify-otp', [DB.ConnectToDB], Provider.VerifyOTP);
router.post('/provider/forgot-password', [DB.ConnectToDB], Provider.ForgotPassword);
router.post('/provider/reset-password', [DB.ConnectToDB], Provider.ResetPassword);
router.post('/provider/verify-status', [Auth.VerifyAuthToken], Provider.CheckUserStatus);
router.post('/provider/account-settings', [Auth.VerifyAuthToken], Provider.AccountSettings);
router.post('/provider/auth', [Auth.VerifyAuthToken], Provider.AuthenticateUser);
router.post('/provider/resend-verification-email', [Auth.VerifyAuthToken], Provider.ResendEmailVerification);
router.post('/provider/dashboard-status', [Auth.VerifyAuthToken], Provider.UpdateDashboardStatus);
router.post('/provider/test-email', Provider.EmailTestingAPI);

router.post('/provider/fetch-badges', [DB.ConnectToDB], Provider.FetchBadges);

export default router;
