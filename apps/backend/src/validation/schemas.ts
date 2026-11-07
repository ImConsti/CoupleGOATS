import { z } from "zod";

export const interestStatus = [
  "user_liked",
  "user_disliked",
  "user_requested",
  "shelter_rejected",
  "shelter_accepted",
] as const;

export const houseTypes = ["apartment", "house"] as const;

export const experienceLevels = ["beginner", "experienced", "expert"] as const;

export const energyLevels = ["low", "medium", "high"] as const;

export const genders = ["male", "female", "unknown"] as const;

export const roles = ["admin", "user", "shelter"] as const;

export const tagCategories = [
  "personality",
  "energy level",
  "training & experience",
  "living environment",
  "social behavior",
  "time & attention",
  "special needs",
  "lifestyle",
] as const;

export const animalSortFields = ["name", "createdAt"] as const;

export const sortOrders = ["asc", "desc"] as const;

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const passwordSchema = z.string().min(8).max(72);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
  role: z.enum(roles).exclude(["admin"]),
});

export const createAnimalShelterSchema = z.object({
  name: z.string(),
  email: emailSchema,
  password: passwordSchema,
  streetAddress: z.string(),
  postalCode: z.string().regex(/^\d{5}$/),
  city: z.string(),
});

export const updateAnimalShelterSchema = createAnimalShelterSchema.partial();

const animalProfileFields = {
  name: z.string().trim().min(1).max(100),
  speciesId: z.uuid(),
  birthYear: z
    .int()
    .min(1900)
    .refine((year) => year <= new Date().getFullYear()),
  gender: z.enum(genders),
  requiredExperience: z.enum(experienceLevels),
  description: z.string().trim().min(1).max(2000),
};

const animalTagIdsSchema = z
  .array(z.uuid())
  .max(40)
  .refine((ids) => ids.every((id, index) => ids.indexOf(id) === index));

export const createAnimalProfileSchema = z.object({
  ...animalProfileFields,
  breedId: z.uuid().optional(),
  tagIds: animalTagIdsSchema.default([]),
});

export const updateAnimalProfileSchema = z
  .strictObject({
    ...animalProfileFields,
    breedId: z.uuid().nullable(),
    tagIds: animalTagIdsSchema,
  })
  .partial()
  .refine((fields) => Object.keys(fields).length > 0, {
    message: "At least one field must be provided",
  });

export const replaceAnimalTagsSchema = z.strictObject({
  tagIds: animalTagIdsSchema,
});

export const createTagSchema = z.object({
  name: z.string(),
  category: z.enum(tagCategories),
  affects_matching: z.boolean(),
  is_critical: z.boolean(),
});

export const updateTagSchema = createTagSchema;

export const createInterestSchema = z.object({
  animalId: z.uuid(),
  status: z.enum(interestStatus),
  appointmentAt: z.iso
    .datetime({ local: true })
    .transform((value) => new Date(value).toISOString())
    .nullish(),
});

export const updateInterestSchema = createInterestSchema.partial();

export const createBreedSchema = z.object({
  speciesId: z.uuid(),
  name: z.string(),
});

export const updateBreedSchema = createBreedSchema.partial();

export const createSpeciesSchema = z.object({ name: z.string() });

export const updateSpeciesSchema = createSpeciesSchema;

export const createUserFilterSchema = z.object({
  animalSpeciesId: z.uuid().nullish(),
  animalBreedId: z.uuid().nullish(),
  animalMinAge: z.int().nullish(),
  animalMaxAge: z.int().nullish(),
  animalGender: z.enum(genders).nullish(),
  experienceLevel: z.enum(experienceLevels).nullish(),
  energyLevel: z.enum(energyLevels).nullish(),
});

export const updateUserFilterSchema = createUserFilterSchema.partial();

export const createUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  picture: z.instanceof(Blob).optional(),
  email: emailSchema,
  password: passwordSchema,
  streetAddress: z.string(),
  postalCode: z.string().regex(/^\d{5}$/),
  city: z.string(),
  isAdmin: z.boolean().optional(),
  houseType: z.enum(houseTypes),
  hasGarden: z.boolean(),
  hasChildren: z.boolean(),
  roamingPossible: z.boolean(),
});

export const updateUserSchema = createUserSchema.partial();

export const registerUserSchema = createUserSchema.omit({
  isAdmin: true,
  picture: true,
});

export const createAnimalPicturesSchema = z.object({
  animalId: z.uuid(),
  showOnCard: z.boolean(),
  picture: z.instanceof(Blob),
});

export const updateAnimalPictureSchema = createAnimalPicturesSchema.partial();
