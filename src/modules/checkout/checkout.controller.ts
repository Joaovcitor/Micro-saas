import { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/client";
import { generateCheckout } from "../../utils/stripe";

class CheckoutController {
  async createCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      const checkout = await generateCheckout(user.id, user.email);
      return res.status(200).json(checkout);
    } catch (e) {
      next(e);
    }
  }
}

export default new CheckoutController();
