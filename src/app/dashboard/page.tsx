import React from "react";
import { Badge } from "@/components/ui/badge";
import BillingForm from "../invoices/new/page";
import { CirclePlus } from "lucide-react";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Container from "@/components/Container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { Invoices } from "@/db/schema";
import { Customers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const {userId}= auth();

  if (!userId){
    return;
  }


  const datas = await db.select().from(Invoices).innerJoin(Customers, eq(Invoices.CustomerId, Customers.id)).where(eq(Invoices.userId,userId))


  const data = datas?.map(({ Invoices,customers})=>{
    return {
      ...Invoices,
      customers: customers
    }
  })
  return (
    <>
      <main className="h-full">
        <Container>
          <div className="flex justify-between mb-6">
            <h1 className="text-3xl font-semibold">Invoices</h1>
            <Dialog>
              <DialogTrigger>
                <Button
                  className="inline-flex gap-2 border-solid bg-slate-100"
                  variant="outline"
                >
                  <CirclePlus className="h-4 w-4 mb-0.5" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>
                    Create invoice to register your new invoice
                  </DialogDescription>
                </DialogHeader>
                <BillingForm />
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] p-4">Date</TableHead>
                <TableHead className="p-4">Customer</TableHead>
                <TableHead className="p-4">Email</TableHead>
                <TableHead className="text-center p-4">Status</TableHead>
                <TableHead className="text-right p-4">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((result) => {
                return (
                  <TableRow key={result.id} >
                    <TableCell className="font-medium text-left p-0">
                      <Link
                        href={`/invoices/${result.id}`}
                        className="block p-4 font-semibold"
                      >
                        {new Date(result.CreatedAt).toLocaleDateString()}
                      </Link>
                    </TableCell>
                    <TableCell className="text-left ml-1">
                      <Link
                        href={`/invoices/${result.id}`}
                        className="block p-4 font-semibold"
                      >
                        {result.customers.id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-left p-0">
                      <Link
                        className="block p-4"
                        href={`/invoices/${result.id}`}
                      >
                        {result.customers.email}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center p-0">
                      <Link
                        className="block p-4"
                        href={`/invoices/${result.id}`}
                      >
                        <Badge
                          className={cn(
                            "rounded-full capitalize",
                            result.status === "open" && "bg-blue-500",
                            result.status === "paid" && "bg-green-600",
                            result.status === "void" && "bg-zinc-700",
                            result.status === "uncollectible" && "bg-red-600",
                          )}
                        >
                          {result.status}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right p-0">
                      <Link
                        href={`/invoices/${result.id}`}
                        className="block p-4 font-semibold"
                      >
                        ${(result.Amount / 100).toFixed(2)}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Container>
      </main>
    </>
  );
}
