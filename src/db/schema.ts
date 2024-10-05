import { integer,text, pgEnum, pgTable, serial,timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { AVAILABLE_STATUSES } from '@/data/invoice';

export type Status = typeof AVAILABLE_STATUSES[number]["id"];

const statuses= AVAILABLE_STATUSES.map(({id})=>id) as Array<Status>

export const statusEnum= pgEnum(
    "status",
   statuses as [Status,...Array<Status>]
)

export const Invoices= pgTable('Invoices',{
    id:serial('id').notNull().primaryKey(),
    CreatedAt: timestamp("CreatedAt").defaultNow().notNull(),
    Amount: integer("Amount").notNull(),
    Description: text("Description").notNull(),
    OrganizationId: text("OrganizationId"),
    userId: text("userId").notNull(),
    status: statusEnum('status').notNull(),
    CustomerId: integer('CustomerId').notNull().references(()=>Customers.id),
})

export const Customers= pgTable('customers',{
    id: serial("id").primaryKey().notNull(),
    createTs: timestamp("createTs").defaultNow().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    userId: text("userId").notNull(),
    organizationId: text("organizationId"),
})