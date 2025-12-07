import userController from "./user.controller";
import { Router } from "express";
const userRouter = Router();

userRouter.post("/", userController.create);
userRouter.post("/store", userController.createStoreUser);

export default userRouter;
