import { db } from "@/db";
import { auth} from "@clerk/nextjs/server"
import { Invoices, Status, Customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import {UpdateServerAction, DeleteServerAction} from "@/app/actions";
import { Check, CreditCard,ChevronDown,Ellipsis,Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AVAILABLE_STATUSES } from "@/data/invoice";


export default async function InvoicePage({
    params,
  }: { params: { invoiceId: string } }) {


    const {userId}= auth();
    
    if (!userId){
        return;
    }
 


    const InvoiceId=Number.parseInt(params.invoiceId)

    
  if (Number.isNaN(InvoiceId)) {
    throw new Error("Invalid Invoice ID");
  }

  const [invoices] = await db.select().from(Invoices).innerJoin(Customers, eq(Invoices.CustomerId, Customers.id)).where(eq(Invoices.id,InvoiceId)).limit(1)
  if (!invoices){
     notFound();
  }

  const invoice ={
    ...invoices.Invoices,
    Customer: invoices.customers
  }

return(
<>
<main className="flex items-center justify-center w-full h-full">
  <div className="grid items-center grid-cols-2 gap-8 w-full max-w-4xl p-8 border border-gray-950 rounded-xl">
    <div className="w-full ml-8">
      <div className="flex mb-8 justify-between gap-64">
        <div className="flex items-center gap-4 text-3xl font-semibold ">
             Invoice&nbsp;{invoice.id}
         <Badge
            className={cn(
              "rounded-full capitalize",
              invoice.status === "open" && "bg-blue-500",
              invoice.status === "paid" && "bg-green-600",
              invoice.status === "void" && "bg-zinc-700",
              invoice.status === "uncollectible" && "bg-rose-600"
            )}
          >
            {invoice.status}
          </Badge>
        </div>
        <div className="flex gap-4 ml-12">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center gap-2 rounded-2xl"
                  variant="outline"
                  type="button"
                  >
                  Change Status
                  <ChevronDown className="w-4 h-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {AVAILABLE_STATUSES.map((status) => {
                    return (
                        <DropdownMenuItem key={status.id}>
                      <form action={UpdateServerAction}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <input type="hidden" name="status" value={status.id} />
                        <button type="submit">{status.label}</button>
                      </form>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex items-center gap-2"
                    variant="outline"
                    type="button"
                  >
                    <span className="sr-only">More Options</span>
                    <Ellipsis className="w-4 h-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Button className="flex items-center gap-2 text-green-500"  variant="ghost" >

                    <Link
                      href={`/invoices/${invoice.id}/payment`}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-auto" />
                      Pay Invoice
                    </Link>
                      </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem  >
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 text-red-500" type="submit" variant="ghost">
                        <Trash2 className="w-4 h-auto" />
                        Delete Invoice
                      </Button>
                    </DialogTrigger>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    Delete Invoice?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your invoice and remove your data from our servers.
                  </DialogDescription>
                  <DialogFooter>
                    <form
                      className="flex justify-center"
                      action={DeleteServerAction}
                    >
                      <input type="hidden" name="id" value={invoice.id} />
                      <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                        type="submit"
                      >
                        <Trash2 className="w-4 h-auto" />
                        Delete Invoice
                      </Button>
                    </form>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
        </div>

   </div>
      <p className="text-3xl mb-3">${(invoice.Amount / 100).toFixed(2)}</p>
      <p className="text-lg mb-8">{invoice.Description}</p>
    </div>
            
    <div>
      {invoice.status === "paid" && (
        <p className="flex gap-2 items-center text-xl font-bold">
          <Check className="w-8 h-auto bg-green-500 rounded-full text-white p-1" />
          Invoice Paid
        </p>
      )}
      
    </div>

  <div className="w-full max-w-4xl p-8">
    <h2 className="font-bold text-lg mb-4">Billing Details</h2>

    <ul className="grid gap-2">
      <li className="flex gap-4">
        <strong className="block w-28 flex-shrink-0 font-medium text-sm">
          Invoice ID
        </strong>
        <span>{invoice.id}</span>
      </li>
      <li className="flex gap-4">
        <strong className="block w-28 flex-shrink-0 font-medium text-sm">
          Invoice Date
        </strong>
        <span>{new Date(invoice.CreatedAt).toLocaleDateString()}</span>
      </li>
      <li className="flex gap-4">
        <strong className="block w-28 flex-shrink-0 font-medium text-sm">
          Billing Name
        </strong>
        <span>{invoice.Customer.name}</span>
      </li>
      <li className="flex gap-4">
        <strong className="block w-28 flex-shrink-0 font-medium text-sm">
          Billing Email
        </strong>
        <span>{invoice.Customer.email}</span>
      </li>
    </ul>
  </div>
 
  </div>
</main>


</>
)
};
{/* <h2 className="text-xl font-bold mb-4">Manage Invoice</h2> */}
{/* {invoice.status === "open" && (
  <form >
    <input type="hidden" name="id" value={invoice.id} />
    <Button className="flex gap-2 font-bold bg-green-700">
      <CreditCard className="w-5 h-auto" />
      Pay Invoice
    </Button>
  </form>
)} */}