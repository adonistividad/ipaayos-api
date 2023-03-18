const express = require("express");
const router = express.Router({});

import CommonTablesController from "../controllers/common_tables";

// import AuthMiddleware from "../middlewares/Auth";
// import VerifyPermissionsMiddleware from "../middlewares/VerifyPermissions";

const CommonTables = new CommonTablesController();
// const Auth = new AuthMiddleware();
// const Permissions = new VerifyPermissionsMiddleware();

// import AuthMiddleware from "../middlewares/Auth";
// import VerifyPermissionsMiddleware from "../middlewares/VerifyPermissions";
import ConnectDB from '../middlewares/ConnectDB';

// const Auth = new AuthMiddleware();
const DB = new ConnectDB();
// const Permissions = new VerifyPermissionsMiddleware();

////// router.post('/common/fetch-categories', [Auth.VerifyAuthToken], CommonTables.CreateCommonTables);

router.post("/common/fetch-categories", [DB.ConnectToDB], CommonTables.FetchCategories);
// router.post("/common/fetch-categories", CommonTables.FetchCategories);

export default router;
