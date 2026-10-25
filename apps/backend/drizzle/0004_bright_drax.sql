CREATE TABLE `__new_users`
(
    id               text                  not null
        constraint users_id_pk
            primary key,
    first_name       text                  not null,
    last_name        text                  not null,
    picture          blob,
    email            text                  not null
        constraint users_email_unique
            unique,
    password_hash    text                  not null,
    street_address   text                  not null,
    postal_code      text                  not null,
    city             text                  not null,
    is_admin         integer default false not null,
    house_type       text                  not null,
    has_garden       integer               not null,
    has_children     integer               not null,
    roaming_possible integer               not null,
    created_at       text                  not null,
    updated_at       text                  not null,
    constraint check_house_type
        check (house_type IN ('apartment', 'house')),
    CONSTRAINT "check_boolean_fields" CHECK (is_admin
                                                 IN (0, 1)
        AND has_garden IN (0, 1)
        AND has_children IN (0, 1)
        AND roaming_possible IN (0, 1))
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "first_name", "last_name", "picture", "email", "password_hash", "street_address",
                          "postal_code", "city", "is_admin", "house_type", "has_garden", "has_children",
                          "roaming_possible", "created_at", "updated_at")
SELECT "id",
       "first_name",
       "last_name",
       "picture",
       "email",
       "password_hash",
       "street_address",
       "postal_code",
       "city",
       "is_admin",
       "house_type",
       "has_garden",
       "has_children",
       "roaming_possible",
       "created_at",
       "updated_at"
FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE TABLE `__new_tags`
(
    id               text                  not null
        constraint tags_id_pk
            primary key,
    name             text                  not null
        constraint tags_name_unique
            unique,
    category         text                  NOT NULL,
    affects_matching integer DEFAULT false NOT NULL,
    is_critical      integer DEFAULT false NOT NULL,
    created_at       text                  NOT NULL,
    updated_at       text                  NOT NULL,
    CONSTRAINT "check_category" CHECK (category
        IN ('personality', 'energy level', 'training & experience', 'living environment', 'social behavior',
            'time & attention', 'special needs', 'lifestyle')),
    CONSTRAINT "check_boolean_fields" CHECK (affects_matching IN (0, 1)
        AND is_critical IN (0, 1)),
    CONSTRAINT "critical_requires_affects_matching" CHECK (is_critical = 0 OR affects_matching = 1)
);
--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;--> statement-breakpoint
CREATE TABLE `__new_user_filters`
(
    id               text not null
        constraint user_filters_id_pk
            primary key,
    user_id          text not null
        constraint user_filters_user_id__users_id__fk
            references users (id)
            on delete cascade,
    animal_species   text
        constraint user_filters_animal_species__species_id__fk
            references species (id)
            on delete cascade,
    animal_breed     text
        constraint user_filters_animal_breed__breeds_id__fk
            references breeds (id)
            on delete cascade,
    animal_min_age   integer,
    animal_max_age   integer,
    animal_gender    text,
    experience_level text,
    energy_level     text,
    created_at       text not null,
    updated_at       text not null,
    constraint user_filters_unique
        unique (animal_breed, animal_species, user_id),
    constraint check_experience_level
        check (experience_level IN ('beginner', 'experienced', 'expert')),
    constraint "check_energy_level"
        check (energy_level IN ('low', 'medium', 'high')),
    constraint check_animal_gender
        check (animal_gender IN ('male', 'female', 'unknown'))
);
--> statement-breakpoint
INSERT INTO `__new_user_filters`("id", "user_id", "animal_species", "animal_breed", "animal_min_age", "animal_max_age",
                                 "animal_gender", "experience_level", "created_at", "updated_at")
SELECT "id",
       "user_id",
       "animal_species",
       "animal_breed",
       "animal_min_age",
       "animal_max_age",
       "animal_gender",
       "experience_level",
       "created_at",
       "updated_at"
FROM `user_filters`;--> statement-breakpoint
DROP TABLE `user_filters`;--> statement-breakpoint
ALTER TABLE `__new_user_filters` RENAME TO `user_filters`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_filters_unique` ON `user_filters` (`animal_breed`, `animal_species`, `user_id`);--> statement-breakpoint
INSERT INTO `tags` (`id`, `name`, `category`, `affects_matching`, `is_critical`, `created_at`, `updated_at`)
VALUES
    -- personality
    ('f7052443-24b3-46c2-8fbe-fd2d61f1d1dd', 'Anhänglich', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('b978d1a4-6106-4341-8a89-aff03c0fa3ce', 'Verspielt', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('99b3c7b1-b578-4a86-b3b3-432f86a2abf4', 'Ruhig', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('e8eef8ab-9b89-4ffd-b739-bb7fdf81a928', 'Neugierig', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('f75f9bf5-885c-4d0a-9adc-3795ff394505', 'Schüchtern', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('f483c02d-3791-4189-ac43-181c2ac77506', 'Selbstbewusst', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('d5494309-206b-4958-bc35-ed7d2699aed2', 'Selbstständig', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('200a6527-e1a9-464a-b7d3-97a5c5312771', 'Freundlich', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('51999d4d-dc2d-4447-9dea-480224da8664', 'Sensibel', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('dcbfb2a7-7d27-4bbd-ab34-6bac4a63d306', 'Treu', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('11da8043-d3bc-4342-9ca1-8a4f0c544e66', 'Verschmust', 'personality', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- energy level
    ('27572162-8388-44e4-b4c3-82c0c8604695', 'Wenig Energie', 'energy level', 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('0100a921-792c-4464-bd96-b82b9695a9e0', 'Mittlere Energie', 'energy level', 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('99598af7-55f4-446c-bf67-e1214d9a9707', 'Viel Energie', 'energy level', 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- training & experience
    ('ee86d1b8-8783-403c-9000-4262d1fdf64c', 'Anfängerfreundlich', 'training & experience', 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('695bed00-ca0e-4692-ac37-a6412f32770c', 'Lernt schnell', 'training & experience', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('0c18fcf5-3de7-42a7-8b93-ebb14c1a963e', 'Gut erzogen', 'training & experience', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('2c75f5d8-09ed-419e-a60f-e61b4c5ce2c4', 'Braucht Training', 'training & experience', 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('bbf7c71e-d92b-4bc1-938e-82bf67b647cb', 'Erfahrene Halter erforderlich', 'training & experience', 1, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- living environment
    ('911f0c46-59ad-45ba-ae2c-f9228cfd0b2d', 'Wohnungsgeeignet', 'living environment', 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('61c2bf39-9e64-404d-9e04-7f5c6b5c74e7', 'Haus bevorzugt', 'living environment', 1, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('5efc8d64-d677-49d8-8948-9f100efdbcc3', 'Garten erforderlich', 'living environment', 1, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('e9262f78-a557-4ed9-b080-e230839471c1', 'Braucht viel Platz', 'living environment', 1, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- social behavior
    ('00590751-054c-4a20-aa4d-d7786407cd0a', 'Kinderfreundlich', 'social behavior', 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('7ecc394b-553f-4fdf-ac5e-f84dc76d78eb', 'Hundefreundlich', 'social behavior', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('98f18e3b-ca83-45a5-b2be-407a1075aa03', 'Katzenfreundlich', 'social behavior', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('ce51daef-234d-4272-9b4b-696a450a596c', 'Tierfreundlich', 'social behavior', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('d9da37b1-5580-4a40-a177-bf7f787ab684', 'Einzeltier', 'social behavior', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('19679d2a-c735-4beb-8f9f-83fa3f21f77d', 'Braucht Artgenossen', 'social behavior', 0, 0,strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- time & attention
    ('66be64fc-af29-4949-b1f4-841cbdef3878', 'Kann allein bleiben', 'time & attention', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('20868f92-a5ad-4716-b73b-59ba829a369d', 'Braucht Aufmerksamkeit', 'time & attention', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('cbe24b2c-6ff3-4470-9f72-ae57902fe975', 'Braucht Eingewöhnungszeit', 'time & attention', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- special needs
    ('5baa65a7-05fc-455a-ae70-6ffed9a89c20', 'Besondere Bedürfnisse', 'special needs', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('2ae1af06-470c-4c35-948e-7dbea06bccbf', 'Medizinische Versorgung nötig', 'special needs', 0, 0,strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('5b883e8e-6dff-42db-9a9c-9c1d08e8e5a6', 'Beeinträchtigung', 'special needs', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    -- lifestyle
    ('da6750a9-7dee-4905-a994-7cef708c67ab', 'Abenteuerbegleiter', 'lifestyle', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('757927e9-a441-4b88-b185-0b1f6e3278fb', 'Naturliebhaber', 'lifestyle', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('5fad2e99-2636-4883-9fd6-fa79968bd504', 'Familientier', 'lifestyle', 0, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));