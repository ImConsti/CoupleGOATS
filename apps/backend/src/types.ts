import type { Request } from "express";
import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { db } from "./db/db.js";
import type { animals, breeds, species, tags } from "./db/schema.js";
import type {
  createAnimalProfileSchema,
  loginSchema,
  roles,
  tagCategories,
  updateAnimalProfileSchema,
} from "./validation/schemas.js";


export type DbOrTrx =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DbError = {
  cause: {
    rawCode: number;
  };
};


export type Role = (typeof roles)[number];

export type JwtPayloadInput = {
  sub: string;
  role: Role;
};

export type JwtPayloadOutput = JwtPayloadInput & {
  exp: number;
  iat: number;
};

export type AuthRequest = Request & {
  auth?: JwtPayloadOutput;
};

export type LoginInput = z.infer<typeof loginSchema>;

export type Account = {
  id: string;
  passwordHash: string;
  role: Role;
};

export type AuthResult = {
  id: string;
  role: Role;
  token: string;
};


export type Species = Omit<
  InferSelectModel<typeof species>,
  "createdAt" | "updatedAt"
>;

export type Breed = Omit<
  InferSelectModel<typeof breeds>,
  "createdAt" | "updatedAt"
>;

export type TagCategory = (typeof tagCategories)[number];

export type Tag = Omit<InferSelectModel<typeof tags>, "createdAt" | "updatedAt">;

export type GroupedTag = {
  category: TagCategory;
  tags: Tag[];
};


export type Animal = InferSelectModel<typeof animals>;

export type CreateAnimalProfileInput = z.infer<typeof createAnimalProfileSchema>;

export type UpdateAnimalProfileInput = z.infer<typeof updateAnimalProfileSchema>;

export type AnimalCreateFields = Omit<CreateAnimalProfileInput, "tagIds">;

export type AnimalUpdateFields = Omit<UpdateAnimalProfileInput, "tagIds">;

export type AnimalProfileRelations = {
  species: Species;
  breed: Omit<Breed, "speciesId"> | null;
  tags: Tag[];
};

export type AnimalProfile = Omit<Animal, "breedId" | "speciesId"> &
  AnimalProfileRelations;
