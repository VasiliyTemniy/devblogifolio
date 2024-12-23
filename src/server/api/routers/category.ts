import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(128),
      description: z.string(),
      parentId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({
        data: {
          title: input.title,
          description: input.description,
          parentId: input.parentId
        },
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(128).optional(),
      description: z.string().optional(),
      parentId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          parentId: input.parentId
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Delete all articles in this category? delete / restrict?
      return ctx.db.category.delete({
        where: {
          id: input.id,
        },
      });
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.category.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  // Hope there wont be too many of them
  getAll: publicProcedure
    .query(({ ctx }) => {
      return ctx.db.category.findMany();
    }),
});