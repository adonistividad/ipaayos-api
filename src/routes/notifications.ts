const express = require('express');
const router = express.Router({});

import NotificationsController from '../controllers/notifications';
import AuthMiddleware from '../middlewares/Auth';
import ConnectDB from '../middlewares/ConnectDB';

const Auth = new AuthMiddleware();
const DB = new ConnectDB();
const Notifications = new NotificationsController();

router.post('/notifications/fetch', [DB.ConnectToDB], Notifications.FetchNotification);
router.post('/notifications/fetch-all', [DB.ConnectToDB], Notifications.FetchNotifications);
router.post('/notifications/fetch-all-grouped', [DB.ConnectToDB], Notifications.FetchGroupedNotifications);
router.post('/notifications/update', [DB.ConnectToDB], Notifications.UpdateNotification);
 
export default router;
