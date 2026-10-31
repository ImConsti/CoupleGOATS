import { relations } from "drizzle-orm/relations";
import { breeds, animals, species, animalShelters, tags, animalsTags, interests, users, userFilters, animalPictures } from "./schema.js";

export const animalsRelations = relations(animals, ({one, many}) => ({
	breed: one(breeds, {
		fields: [animals.breedId],
		references: [breeds.id]
	}),
	species: one(species, {
		fields: [animals.speciesId],
		references: [species.id]
	}),
	animalShelter: one(animalShelters, {
		fields: [animals.animalShelterId],
		references: [animalShelters.id]
	}),
	animalsTags: many(animalsTags),
	interests: many(interests),
	animalPictures: many(animalPictures),
}));

export const breedsRelations = relations(breeds, ({one, many}) => ({
	animals: many(animals),
	species: one(species, {
		fields: [breeds.speciesId],
		references: [species.id]
	}),
	userFilters: many(userFilters),
}));

export const speciesRelations = relations(species, ({many}) => ({
	animals: many(animals),
	breeds: many(breeds),
	userFilters: many(userFilters),
}));

export const animalSheltersRelations = relations(animalShelters, ({many}) => ({
	animals: many(animals),
}));

export const animalsTagsRelations = relations(animalsTags, ({one}) => ({
	tag: one(tags, {
		fields: [animalsTags.tagId],
		references: [tags.id]
	}),
	animal: one(animals, {
		fields: [animalsTags.animalId],
		references: [animals.id]
	}),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	animalsTags: many(animalsTags),
}));

export const interestsRelations = relations(interests, ({one}) => ({
	animal: one(animals, {
		fields: [interests.animalId],
		references: [animals.id]
	}),
	user: one(users, {
		fields: [interests.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	interests: many(interests),
	userFilters: many(userFilters),
}));

export const userFiltersRelations = relations(userFilters, ({one}) => ({
	breed: one(breeds, {
		fields: [userFilters.animalBreedId],
		references: [breeds.id]
	}),
	species: one(species, {
		fields: [userFilters.animalSpeciesId],
		references: [species.id]
	}),
	user: one(users, {
		fields: [userFilters.userId],
		references: [users.id]
	}),
}));

export const animalPicturesRelations = relations(animalPictures, ({one}) => ({
	animal: one(animals, {
		fields: [animalPictures.animalId],
		references: [animals.id]
	}),
}));