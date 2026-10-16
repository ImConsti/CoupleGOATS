import {sqliteTable, text, blob, integer, primaryKey, unique, check} from "drizzle-orm/sqlite-core"
import * as crypto from "node:crypto";
import {sql} from "drizzle-orm";

export const animalShelters = sqliteTable("animal_shelters", {
    id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
    name: text().notNull(),
    email: text().notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    streetAddress: text("street_address").notNull(),
    postalCode: text("postal_code").notNull(),
    city: text().notNull(),
    createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
    updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
});

export const animals = sqliteTable("animals", {
        id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
        animalShelterId: text("animal_shelter_id").notNull().references(() => animalShelters.id, {onDelete: "cascade"}),
        name: text().notNull(),
        species: text().notNull().references(() => species.id, {onDelete: "cascade"}),
        breed: text().notNull().references(() => breeds.id, {onDelete: "cascade"}),
        birthYear: integer("birth_year").notNull(),
        gender: text("gender").notNull(),
        requiredExperience: text("required_experience").notNull(),
        description: text().notNull(),
        createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
        updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
    },
    () => [
        check(
            "check_required_experience",
            sql`required_experience
            IN ('beginner', 'experienced', 'expert')`
        ),
        check(
            "check_gender",
            sql`gender
            IN ('male', 'female', 'unknown')`
        )
    ]);

export const tags = sqliteTable("tags", {
    id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
    name: text().notNull().unique(),
    createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
    updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
});

export const species = sqliteTable("species", {
    id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
    name: text().notNull().unique(),
    createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
    updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
});

export const breeds = sqliteTable("breeds", {
        id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
        species: text().notNull().references(() => species.id, {onDelete: "cascade"}),
        name: text().notNull(),
        createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
        updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
    },
    (table) => [
        unique("breeds_species_name_unique").on(table.species, table.name),
    ]);

export const animalsTags = sqliteTable("animals_tags", {
        animalId: text("animal_id").notNull().references(() => animals.id, {onDelete: "cascade"}),
        tagId: text("tag_id").notNull().references(() => tags.id, {onDelete: "cascade"}),
        createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
        updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
    },
    (table) => [
        primaryKey({
            columns: [table.animalId, table.tagId],
            name: "animals_tags_pk"
        })
    ]);

export const users = sqliteTable("users", {
        id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
        firstName: text("first_name").notNull(),
        lastName: text("last_name").notNull(),
        picture: blob(),
        email: text().notNull().unique(),
        passwordHash: text("password_hash").notNull(),
        streetAddress: text("street_address").notNull(),
        postalCode: text("postal_code").notNull(),
        city: text().notNull(),
        isAdmin: integer("is_admin").default(0).notNull(),
        isSmoker: integer("is_smoker").notNull(),
        houseType: text("house_type").notNull(),
        hasGarden: integer("has_garden").notNull(),
        hasChildren: integer("has_children").notNull(),
        roamingPossible: integer("roaming_possible").notNull(),
        createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
        updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
    },
    () => [
        check(
            "check_house_type",
            sql`house_type
            IN ('apartment', 'house')`
        ),
        check(
            "check_boolean_fields",
            sql`is_admin
            IN (0, 1)
        AND is_smoker IN (0, 1)
        AND has_garden IN (0, 1)
        AND has_children IN (0, 1)
        AND roaming_possible IN (0, 1)`
        )
    ]);

export const interests = sqliteTable("interests", {
        userId: text("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
        animalId: text("animal_id").notNull().references(() => animals.id, {onDelete: "cascade"}),
        status: text().notNull(),
        appointmentAt: text("appointment_at"),
        createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
        updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
    },
    (table) => [
        primaryKey({columns: [table.animalId, table.userId], name: "interests_pk"}),
        check(
            "check_status",
            sql`status
            IN ('user_liked', 'user_disliked', 'user_requested', 'shelter_rejected', 'shelter_accepted')`
        )
    ]);

export const userFilters = sqliteTable("user_filters", {
        id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
        userId: text("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
        animalSpecies: text("animal_species").references(() => species.id, {onDelete: "cascade"}),
        animalBreed: text("animal_breed").references(() => breeds.id, {onDelete: "cascade"}),
        animalMinAge: integer("animal_min_age"),
        animalMaxAge: integer("animal_max_age"),
        animalGender: text("animal_gender"),
        experienceLevel: text("experience_level"),
        createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
        updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
    },
    (table) => [
        unique("user_filters_unique").on(
            table.animalBreed,
            table.animalSpecies,
            table.userId,
        ),
        check(
            "check_experience_level",
            sql`experience_level
            IN ('beginner', 'experienced', 'expert')`
        ),
        check(
            "check_animal_gender",
            sql`animal_gender
            IN ('male', 'female', 'unknown')`
        )
    ],
);
export const animalPictures = sqliteTable("animal_pictures", {
    id: text().primaryKey().notNull().$default(() => crypto.randomUUID()),
    animalId: text("animal_id").notNull().references(() => animals.id, {onDelete: "cascade"}),
    showOnCard: integer("show_on_card").notNull(),
    picture: blob().notNull(),
    createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
    updatedAt: text("updated_at").$default(() => new Date().toISOString()).$onUpdate(() => new Date().toISOString()).notNull(),
}, () => [
    check(
        "check_boolean_fields",
        sql` show_on_card
        IN (0, 1)`
    )
]);

