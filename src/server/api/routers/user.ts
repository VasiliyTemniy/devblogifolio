import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      phone: z.string().optional(),
      username: z.string(),
      email: z.string().email(),
      avatarUrl: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Add auth app calls to store password
      return ctx.db.user.create({
        data: {
          phone: input.phone,
          username: input.username,
          email: input.email,
          avatarUrl: input.avatarUrl,
        },
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      phone: z.string().optional(),
      username: z.string().optional(),
      email: z.string().email().optional(),
      avatarUrl: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Add auth app calls to update stored password
      const data: {
        phone?: string;
        username?: string;
        email?: string;
        avatarUrl?: string;
      } = {};
      if (input.phone) data.phone = input.phone;
      if (input.username) data.username = input.username;
      if (input.email) data.email = input.email;
      if (input.avatarUrl) data.avatarUrl = input.avatarUrl;
      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data
      });
    }),

  remove: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }),

  restore: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          deletedAt: null,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.delete({
        where: {
          id: input.id,
        },
      });
    }),

  block: publicProcedure
    .input(z.object({ id: z.string().uuid(), blockReason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          blockReason: input.blockReason,
          blockedAt: new Date(),
        },
      });
    }),

  unblock: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          blockReason: null,
          blockedAt: null,
        },
      });
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  getBy: publicProcedure
    .input(z.object({
      email: z.string().email().optional(),
      username: z.string().optional(),
      phone: z.string().optional()
    }))
    .query(({ ctx, input }) => {
      const where: { email?: string; username?: string; phone?: string } = {};
      if (!input.email && !input.username && !input.phone) return null;
      if (input.email) where.email = input.email;
      if (input.username) where.username = input.username;
      if (input.phone) where.phone = input.phone;
      return ctx.db.user.findFirst({
        where,
      });
    }),

  // update this if needed
  getPage: publicProcedure
    .input(z.object({
      offset: z.number().optional(),
      limit: z.number().optional(),
      search: z.array(
        z.object({
          field: z.enum(["email", "username", "phone"]),
          value: z.string(),
        })
      ).optional(),
      filter: z.array(
        z.object({
          field: z.enum(["email", "username", "phone"]),
          value: z.string(),
        })
      ),
      order: z.array(
        z.object({
          field: z.enum(["email", "username", "phone", "createdAt", "updatedAt"]),
          direction: z.enum(["asc", "desc"]),
        })
      ).optional(),
    }))
    .query(({ ctx, input }) => {

      const where: {
        email?: string | { contains: string };
        username?: string | { contains: string };
        phone?: string | { contains: string };
      } = {};

      if (input.filter) {
        for (const filterItem of input.filter) {
          where[filterItem.field] = filterItem.value;
        }
      }
      if (input.search) {
        for (const searchItem of input.search) {
          // Skip search for fields that are filtered
          if (where[searchItem.field]) {
            continue;
          }
          where[searchItem.field] = { contains: searchItem.value };
        }
      }

      const orderBy: {
        email?: "asc" | "desc";
        username?: "asc" | "desc";
        phone?: "asc" | "desc";
        createdAt?: "asc" | "desc";
        updatedAt?: "asc" | "desc";
      } = {};
      if (input.order) {
        input.order.forEach((orderItem) => {
          orderBy[orderItem.field] = orderItem.direction;
        });
      }
      return ctx.db.user.findMany({
        skip: input.offset ?? 0,
        take: input.limit ?? 10,
        where,
        orderBy
      });
    }),
});
