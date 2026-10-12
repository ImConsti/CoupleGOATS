create table animal_shelters
(
    id             text not null
        constraint animal_shelters_id_pk
            primary key,
    name           text not null,
    email          text not null
        constraint animal_shelters_email_unique
            unique,
    password_hash  text not null,
    street_address text not null,
    postal_code    text not null,
    city           text not null,
    created_at     text not null,
    updated_at     text not null
);
--> statement-breakpoint
create table animals
(
    id                  text    not null
        constraint animals_id_pk
            primary key,
    animal_shelter_id   text    not null
        constraint animals_animal_type__animal_shelter_id__fk
            references animal_shelters (id)
            on delete cascade,
    name                text    not null,
    species             text    not null
        constraint animals_species__species_id__fk
            references species (id)
            on delete cascade,
    breed               text    not null
        constraint animals_breed__breeds_id__fk
            references breeds (id)
            on delete cascade,
    birth_year          INTEGER not null,
    gender              text    not null,
    required_experience text    not null,
    description         text    not null,
    created_at          text    not null,
    updated_at          text    not null,
    constraint check_required_experience
        check (required_experience IN ('beginner', 'experienced', 'expert')),
    constraint check_gender
        check (gender IN ('male', 'female', 'unknown'))
);
--> statement-breakpoint
create table tags
(
    id         text not null
        constraint tags_id_pk
            primary key,
    name       text not null
        constraint tags_name_unique
            unique,
    created_at text not null,
    updated_at text not null
);
--> statement-breakpoint
create table species
(
    id         text not null
        constraint species_id_pk
            primary key,
    name       text not null
        constraint species_name_unique
            unique,
    created_at text not null,
    updated_at text not null
);
--> statement-breakpoint
create table breeds
(
    id         text not null
        constraint breeds_id_pk
            primary key,
    species    text not null
        constraint breeds_species__species_id__fk
            references species (id)
            on delete cascade,
    name       text not null,
    created_at text not null,
    updated_at text not null,
    constraint breeds_species_name_unique
        unique (species, name)
);
--> statement-breakpoint
create table animals_tags
(
    animal_id  text not null
        constraint animals_tags_animal_id__animals_id__fk
            references animals (id)
            on delete cascade,
    tag_id     text not null
        constraint animals_tags_tag_id__tag_id__fk
            references tags (id)
            on delete cascade,
    created_at text not null,
    updated_at text not null,
    constraint animals_tags_pk
        primary key (animal_id, tag_id)
);
--> statement-breakpoint
create table users
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
        check (house_type IN ('apartment', 'house'))
);
--> statement-breakpoint
create table interests
(
    user_id        text not null
        constraint interests_user_id__users_id__fk
            references users (id)
            on delete cascade,
    animal_id      text not null
        constraint interests_animal_id__animals_id__fk
            references animals (id)
            on delete cascade,
    status         text not null,
    appointment_at text,
    created_at     text not null,
    updated_at     text not null,
    constraint interests_pk
        primary key (animal_id, user_id),
    constraint check_status
        check (status IN ('user_liked',
                          'user_disliked',
                          'user_requested',
                          'shelter_deadline',
                          'shelter_completed'))
);
--> statement-breakpoint
create table user_filters
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
    created_at       text not null,
    updated_at       text not null,
    constraint user_filters_unique
        unique (animal_breed, animal_species, user_id),
    constraint check_experience_level
        check (experience_level IN ('beginner', 'experienced', 'expert')),
    constraint check_animal_gender
        check (animal_gender IN ('male', 'female', 'unknown'))
);
--> statement-breakpoint
create table animal_pictures
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
    updated_at   text    not null
);