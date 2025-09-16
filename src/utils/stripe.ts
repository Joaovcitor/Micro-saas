import Stripe from "stripe";
import prisma from "../prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  httpClient: Stripe.createFetchHttpClient(),
});

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({
    email,
  });
  return customers.data[0];
};

export const createStripeCustomer = async (data: {
  email: string;
  name?: string;
}) => {
  const custumer = await getStripeCustomerByEmail(data?.email);
  if (custumer) {
    return custumer;
  }
  return stripe.customers.create({
    email: data?.email,
    name: data?.name,
  });
};

export const generateCheckout = async (userId: number, email: string) => {
  try {
    const customer = await createStripeCustomer({
      email,
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      client_reference_id: userId.toString(),
      customer: customer.id,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      line_items: [
        {
          price: process.env.STRIPE_ID_PLAIN,
          quantity: 1,
        },
      ],
    });
    return {
      url: session.url,
    };
  } catch (e: any) {
    console.log(e);
  }
};

export const handleCheckoutSessionCompleted = async (event: {
  data: { object: Stripe.Checkout.Session };
}) => {
  const idUser = event.data.object.client_reference_id as string;
  const stripeSubscriptionId = event.data.object.subscription as string;
  const stripeCustomerId = event.data.object.customer as string;
  const checkoutStatus = event.data.object.status;

  if (checkoutStatus !== "complete") return;

  if (!idUser || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error(
      "idUser, stripeSubscriptionId, stripeCustomerId is required"
    );
  }

  const userExist = await prisma.user.findFirst({
    where: { id: Number(idUser) },
  });

  if (!userExist) {
    throw new Error("user not found");
  }

  await prisma.user.update({
    where: {
      id: userExist.id,
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
    },
  });
};

export const handleSubscriptionSessionCompleted = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const stripeSubscriptionId = event.data.object.id as string;
  const stripeCustomerId = event.data.object.customer as string;
  const checkoutStatus = event.data.object.status;

  const userExist = await prisma.user.findFirst({
    where: { stripeCustomerId },
  });

  if (!userExist) {
    throw new Error("user not found");
  }

  await prisma.user.update({
    where: {
      id: userExist.id,
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionStatus: checkoutStatus,
    },
  });
};

export const handleCancelPlan = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const stripeCustomerId = event.data.object.customer as string;

  const userExist = await prisma.user.findFirst({
    where: { stripeCustomerId },
  });

  if (!userExist) {
    throw new Error("user stripeCustomerId not found");
  }

  await prisma.user.update({
    where: {
      id: userExist.id,
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionStatus: null,
    },
  });
};

export const handleCancelSubscription = async (idSubscriptions: string) => {
  const subscription = await stripe.subscriptions.update(idSubscriptions, {
    cancel_at_period_end: true,
  });

  return subscription;
};

export const createPortalCustomer = async (idCustomer: string) => {
  const subscription = await stripe.billingPortal.sessions.create({
    customer: idCustomer,
    return_url: "http://localhost:3000/",
  });

  return subscription;
};
