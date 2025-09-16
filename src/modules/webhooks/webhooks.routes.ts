import webhookController from "./webhook.controller";
import { NextFunction, Request, Response, Router, raw } from "express";
class WebhookRoute {
  public static create(router: Router) {
    router.post(
      "/webhook",
      raw({ type: "application/json" }),
      (req: Request, res: Response, next: NextFunction) => {
        webhookController.webhook(req, res, next);
      }
    );
  }
}

export { WebhookRoute };
