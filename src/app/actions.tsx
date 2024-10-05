"use server"

import { db } from "@/db";
import { Customers, Invoices, Status } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq,and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { headers } from "next/headers";

// Define the schema
const formSchema = z.object({
  value: z.string(),
  description: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
});

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY));


export const createAction = async function (formData: FormData) {
  // Validate the form data against the schema
  const parsedData = formSchema.safeParse({
    value: formData.get("value"),
    description: formData.get("description"),
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsedData.success) {
    throw new Error("Invalid form data");
  }

  const { value, description, name, email } = parsedData.data;

  const Amount = Math.floor(Number.parseFloat(value) * 100);
  const Description = description ?? ""; // Optional, default to empty string if not provided
  const { userId, orgId } = auth();

  if (!userId) {
    return;
  }
  // Insert into Customers table
  const [customer] = await db
    .insert(Customers)
    .values({
      userId,
      name,
      email,
      organizationId: orgId || null,
    })
    .returning({
      id: Customers.id,
    });

  // Insert into Invoices table
  const results = await db
    .insert(Invoices)
    .values({
      Amount,
      userId,
      Description,
      CustomerId: customer.id,
      status: "open",
      OrganizationId: orgId || null,
    })
    .returning({
      id: Invoices.id,
    });

  return results;
};


export async function UpdateServerAction(formData:FormData) {
    const { userId} = auth();

    if (!userId) {
      return;
    }
    const id= formData.get('id') as string
    const status = formData.get('status') as Status
    
    const results= await db.update(Invoices).set({status}).where(and(eq(Invoices.id, parseInt(id)),eq(Invoices.userId,userId)))
    revalidatePath(`/invoices/${id}`,'page')
}
export async function DeleteServerAction(formData:FormData) {
    const { userId} = auth();

    if (!userId) {
      return;
    }
    const id= formData.get('id') as string
    
    const results= await db.delete(Invoices).where(and(eq(Invoices.id, parseInt(id)),eq(Invoices.userId,userId)))
    redirect('/dashboard')
}


export async function createPayment(formData:FormData) {
  const { userId } = auth();
  if ( !userId) return;


  const headerlist = headers()
  const origin=headerlist.get('origin')
  const id = Number.parseInt(formData.get("id") as string);

  const [result] = await db
  .select({
    status: Invoices.status,
    value: Invoices.Amount,
  })
  .from(Invoices)
  .where(eq(Invoices.id, id))
  .limit(1);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product: "prod_QyVfJ8HhfbaMSQ",
          unit_amount: result.value,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/invoices/${id}/payment?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/invoices/${id}/payment?status=canceled&session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.url) {
    throw new Error("Invalid Session");
  }

  redirect(session.url);
}