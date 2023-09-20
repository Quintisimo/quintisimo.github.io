import { defineCollection, z } from "astro:content";

const firstLetterCapital = (str: string) =>
  str.charAt(0) === str.charAt(0).toUpperCase();

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z
        .string()
        .refine((val) => val.split(" ").every(firstLetterCapital), {
          message: "Use parcal case",
        }),
      description: z.string().refine(firstLetterCapital, {
        message: "First letter should be capital",
      }),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      heroImage: image(),
    }),
});

export const collections = { blog };
