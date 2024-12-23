import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const articleRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      mdUrl: z.string(),
      tags: z.array(z.string()),
      authorId: z.string().uuid(),  // author must be extracted from token
      categoryId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Add auth app calls to store password
      return ctx.db.article.create({
        data: {
          title: input.title,
          description: input.description,
          mdUrl: input.mdUrl,
          tags: input.tags,
          authorId: input.authorId,
          categoryId: input.categoryId,
        },
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      title: z.string().optional(),
      description: z.string().optional(),
      mdUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      authorId: z.string().uuid().optional(),  // author must be extracted from token
      categoryId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const data: {
        title?: string;
        description?: string;
        mdUrl?: string;
        tags?: string[];
        authorId?: string;
        categoryId?: string;
      } = {};
      if (input.title) data.title = input.title;
      if (input.description) data.description = input.description;
      if (input.mdUrl) data.mdUrl = input.mdUrl;
      if (input.tags) data.tags = input.tags;
      if (input.authorId) data.authorId = input.authorId;
      if (input.categoryId) data.categoryId = input.categoryId;
      return ctx.db.article.update({
        where: {
          id: input.id,
        },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.article.delete({
        where: {
          id: input.id,
        },
      });
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.article.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  getPage: publicProcedure
    .input(z.object({
      offset: z.number().optional(),
      limit: z.number().optional(),
      search: z.array(
        z.object({
          field: z.enum(["title", "description"]),
          value: z.string(),
        })
      ).optional(),
      filter: z.array(
        z.object({
          field: z.enum(["authorId", "categoryId"]),
          value: z.string().uuid(),
        })
      ).optional(),
      tags: z.array(z.string()).optional(),
      order: z.array(
        z.object({
          field: z.enum(["likes", "visits", "createdAt", "updatedAt"]),
          direction: z.enum(["asc", "desc"]),
        })
      ).optional(),
    }))
    .query(({ ctx, input }) => {

      const where: {
        title?: { contains: string };
        description?: { contains: string };
        authorId?: string;
        categoryId?: string;
        tags?: { hasEvery: string[] };
      } = {};

      if (input.search) {
        for (const searchItem of input.search) {
          where[searchItem.field] = { contains: searchItem.value };
        }
      }
      if (input.filter) {
        for (const filterItem of input.filter) {
          where[filterItem.field] = filterItem.value;
        }
      }
      if (input.tags) {
        where.tags = {
          hasEvery: input.tags,
        };
      }

      const orderBy: {
        likes?: "asc" | "desc";
        visits?: "asc" | "desc";
        createdAt?: "asc" | "desc";
        updatedAt?: "asc" | "desc";
      } = {};

      if (input.order) {
        for (const orderItem of input.order) {
          orderBy[orderItem.field] = orderItem.direction;
        }
      }

      return ctx.db.article.findMany({
        where,
        orderBy
      });
    }),
});