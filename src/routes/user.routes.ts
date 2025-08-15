import userController from "../controllers/user.controller";
import { Router } from "express";
const userRouter = Router();

userRouter.post("/", userController.create);

export default userRouter;
