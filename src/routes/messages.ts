const express = require('express');
const router = express.Router({});

import MessagesController from '../controllers/messages';
import AuthMiddleware from '../middlewares/Auth';
import ConnectDB from '../middlewares/ConnectDB';

const Auth = new AuthMiddleware();
const DB = new ConnectDB();
const Messages = new MessagesController();

router.post('/messages/fetch', [DB.ConnectToDB], Messages.FetchMessage);
router.post('/messages/fetch-all', [DB.ConnectToDB], Messages.FetchMessages);
router.post('/messages/fetch-all-grouped', [DB.ConnectToDB], Messages.FetchGroupedMessages);
router.post('/messages/update', [DB.ConnectToDB], Messages.UpdateMessage);
router.post('/messages/update-all', [DB.ConnectToDB], Messages.UpdateMessages);
 
export default router;
