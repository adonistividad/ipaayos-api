const express = require('express');
const router = express.Router({});

import TasksController from '../controllers/tasks';
import AuthMiddleware from '../middlewares/Auth';
import ConnectDB from '../middlewares/ConnectDB';

const Auth = new AuthMiddleware();
const DB = new ConnectDB();
const Tasks = new TasksController();

router.post('/tasks/fetch', [DB.ConnectToDB], Tasks.FetchTask);
router.post('/tasks/fetch-all', [DB.ConnectToDB], Tasks.FetchTasks);
router.post('/tasks/update', [DB.ConnectToDB], Tasks.UpdateTask);

router.post('/tasks/fetch-offer', [DB.ConnectToDB], Tasks.FetchTaskOffer);
router.post('/tasks/fetch-all-offers', [DB.ConnectToDB], Tasks.FetchTasksOffers);
router.post('/tasks/update-offer', [DB.ConnectToDB], Tasks.UpdateTasksOffer);

export default router;
