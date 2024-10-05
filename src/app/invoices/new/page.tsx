"use client";

import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAction } from "@/app/actions";
import { boolean } from "drizzle-orm/mysql-core";


// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Billing name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  value: z.string().min(1, {
    message: "Value is required.",
  }),
  description: z.string().min(6, {
    message: "Description is required at least 6 characters.",
  }),
});

// Infer the TypeScript type from the form schema
type FormSchemaType = z.infer<typeof formSchema>;

export default function BillingForm() {
  const [isdisable, setisdisabled] = useState<boolean>(false); // State to manage modal visibility
 const router=useRouter();
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      value: "",
      description: "",
    },
  });

  // Specify the type for 'data' based on the schema
  const onSubmit = (data: FormSchemaType) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("value", data.value);
    formData.append("description", data.description);

    setisdisabled(true);
    createAction(formData).then((result) => {
      if (result?.[0]?.id) {
        // Use client-side router to navigate
        router.push(`/invoices/${result[0].id}`);
      } else {
        console.error("Error: No result found.");
      }
    });
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Name</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder="Enter billing name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter the billing name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter the billing email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input id="value" placeholder="Enter value" {...field} />
                </FormControl>
                <FormDescription>Enter the value.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    id="description"
                    placeholder="Enter description"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Description for the billing.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isdisable}>
            {isdisable ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
