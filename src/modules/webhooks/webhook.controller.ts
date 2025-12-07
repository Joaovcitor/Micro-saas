import prisma from "../../prisma/client";
import {
  createStripeCustomer,
  handleCancelPlan,
  handleCheckoutSessionCompleted,
  handleSubscriptionSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  stripe,
} from "../../utils/stripe";
import { NextFunction, Request, Response } from "express";

class WebhookController {
  async webhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const signature = req.headers["stripe-signature"] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(event);
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event);
          break;
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event);
          break;
        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event);
          break;
        case "customer.subscription.trial_will_end":
          await this.handleTrialWillEnd(event);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  // Novo handler para pagamento de fatura bem-sucedido
  private async handleInvoicePaymentSucceeded(event: any) {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer;

    if (!subscriptionId) return;

    try {
      // Buscar assinatura no banco
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (subscription) {
        // Atualizar status da assinatura para ativa
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            lastPaymentDate: new Date(),
          },
        });

        // Log do pagamento bem-sucedido
        console.log(`Payment succeeded for subscription ${subscriptionId}`);
      }
    } catch (error) {
      console.error('Error handling invoice payment succeeded:', error);
      throw error;
    }
  }

  // Novo handler para falha no pagamento
  private async handleInvoicePaymentFailed(event: any) {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer;

    if (!subscriptionId) return;

    try {
      // Buscar assinatura no banco
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        include: { store: true },
      });

      if (subscription) {
        // Atualizar status da assinatura
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'PAST_DUE',
          },
        });

        // Aqui você pode implementar notificações por email
        console.log(`Payment failed for subscription ${subscriptionId} - Store: ${subscription.store.name}`);
        
        // TODO: Implementar notificação por email para o proprietário da loja
      }
    } catch (error) {
      console.error('Error handling invoice payment failed:', error);
      throw error;
    }
  }

  // Novo handler para aviso de fim de trial
  private async handleTrialWillEnd(event: any) {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;

    try {
      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        include: { 
          store: { 
            include: { 
              owner: true 
            } 
          } 
        },
      });

      if (dbSubscription) {
        console.log(`Trial will end soon for subscription ${subscriptionId} - Store: ${dbSubscription.store.name}`);
        
        // TODO: Implementar notificação por email sobre fim do trial
        // Você pode enviar um email para dbSubscription.store.owner.email
      }
    } catch (error) {
      console.error('Error handling trial will end:', error);
      throw error;
    }
  }
}

export default new WebhookController();
