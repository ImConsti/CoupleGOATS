CREATE TABLE `__new_animal_pictures`
(
    id           text    not null
        constraint animal_pictures_id_pk
            primary key,
    animal_id    text    not null
        constraint animal_pictures_animal_id__animals_id__fk
            references animals (id)
            on delete cascade,
    show_on_card INTEGER not null,
    picture      blob    not null,
    created_at   text    not null,
    updated_at   text    not null,
    CONSTRAINT "check_boolean_fields" CHECK ( show_on_card
        IN (0, 1))
);
--> statement-breakpoint
INSERT INTO `__new_animal_pictures`("id", "animal_id", "show_on_card", "picture", "created_at", "updated_at")
SELECT "id", "animal_id", "show_on_card", "picture", "created_at", "updated_at"
FROM `animal_pictures`;--> statement-breakpoint
DROP TABLE `animal_pictures`;--> statement-breakpoint
ALTER TABLE `__new_animal_pictures` RENAME TO `animal_pictures`;--> statement-breakpoint
CREATE TABLE `__new_users`
(
    id               text              not null
        constraint users_id_pk
            primary key,
    first_name       text              not null,
    last_name        text              not null,
    picture          blob,
    email            text              not null
        constraint users_email_unique
            unique,
    password_hash    text              not null,
    street_address   text              not null,
    postal_code      text              not null,
    city             text              not null,
    is_admin         integer default 0 not null,
    is_smoker        integer           not null,
    house_type       text              not null,
    has_garden       integer           not null,
    has_children     integer           not null,
    roaming_possible integer           not null,
    created_at       text              not null,
    updated_at       text              not null,
    constraint check_house_type
        check (house_type IN ('apartment', 'house')),
    CONSTRAINT "check_boolean_fields" CHECK (is_admin
                                                 IN (0, 1)
        AND is_smoker IN (0, 1)
        AND has_garden IN (0, 1)
        AND has_children IN (0, 1)
        AND roaming_possible IN (0, 1))
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "first_name", "last_name", "picture", "email", "password_hash", "street_address",
                          "postal_code", "city", "is_admin", "is_smoker", "house_type", "has_garden", "has_children",
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
       "is_smoker",
       "house_type",
       "has_garden",
       "has_children",
       "roaming_possible",
       "created_at",
       "updated_at"
FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`