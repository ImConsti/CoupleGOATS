CREATE TABLE `__new_animals`
(
    id                  text    not null
        constraint animals_id_pk
            primary key,
    animal_shelter_id   text    not null
        constraint animals_animal_shelter_id__animal_shelter_id__fk
            references animal_shelters (id)
            on delete cascade,
    name                text    not null,
    species_id          text    not null
        constraint animals_species_id__species_id__fk
            references species (id)
            on delete cascade,
    breed_id            text
        constraint animals_breed_id__breeds_id__fk
            references breeds (id)
            on delete set null,
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
INSERT INTO `__new_animals`("id", "animal_shelter_id", "name", "species_id", "breed_id", "birth_year", "gender",
                            "required_experience", "description", "created_at", "updated_at")
SELECT "id",
       "animal_shelter_id",
       "name",
       "species",
       "breed",
       "birth_year",
       "gender",
       "required_experience",
       "description",
       "created_at",
       "updated_at"
FROM `animals`;--> statement-breakpoint
DROP TABLE `animals`;--> statement-breakpoint
ALTER TABLE `__new_animals` RENAME TO `animals`;--> statement-breakpoint
CREATE TABLE `__new_breeds`
(
    id         text not null
        constraint breeds_id_pk
            primary key,
    species_id text not null
        constraint breeds_species_id__species_id__fk
            references species (id)
            on delete cascade,
    name       text not null,
    created_at text not null,
    updated_at text not null,
    constraint breeds_species_name_unique
        unique (species_id, name)

);
--> statement-breakpoint
INSERT INTO `__new_breeds`("id", "species_id", "name", "created_at", "updated_at")
SELECT "id", "species", "name", "created_at", "updated_at"
FROM `breeds`;--> statement-breakpoint
DROP TABLE `breeds`;--> statement-breakpoint
ALTER TABLE `__new_breeds` RENAME TO `breeds`;--> statement-breakpoint
CREATE TABLE `__new_user_filters`
(
    id                text not null
        constraint user_filters_id_pk
            primary key,
    user_id           text not null
        constraint user_filters_user_id__users_id__fk
            references users (id)
            on delete cascade,
    animal_species_id text
        constraint user_filters_animal_species_id__species_id__fk
            references species (id)
            on delete cascade,
    animal_breed_id   text
        constraint user_filters_animal_breed_id__breeds_id__fk
            references breeds (id)
            on delete cascade,
    animal_min_age    integer,
    animal_max_age    integer,
    animal_gender     text,
    experience_level  text,
    energy_level      text,
    created_at        text not null,
    updated_at        text not null,
    constraint user_filters_unique
        unique (animal_breed_id, animal_species_id, user_id),
    constraint check_experience_level
        check (experience_level IN ('beginner', 'experienced', 'expert')),
    constraint "check_energy_level"
        check (energy_level IN ('low', 'medium', 'high')),
    constraint check_animal_gender
        check (animal_gender IN ('male', 'female', 'unknown'))
);
--> statement-breakpoint
INSERT INTO `__new_user_filters`("id", "user_id", "animal_species_id", "animal_breed_id", "animal_min_age",
                                 "animal_max_age", "animal_gender", "experience_level", "energy_level", "created_at",
                                 "updated_at")
SELECT "id",
       "user_id",
       "animal_species",
       "animal_breed",
       "animal_min_age",
       "animal_max_age",
       "animal_gender",
       "experience_level",
       "energy_level",
       "created_at",
       "updated_at"
FROM `user_filters`;--> statement-breakpoint
DROP TABLE `user_filters`;--> statement-breakpoint
ALTER TABLE `__new_user_filters` RENAME TO `user_filters`;--> statement-breakpoint
INSERT INTO species (id, name, created_at, updated_at) VALUES
                                                           ('bed7395e-007f-4333-ae11-21ec7aa30059', 'Hund', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('892cd85c-3c90-456b-b0cc-20c6cb09bba8', 'Katze', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('07b19d36-4285-4c26-9112-cae76c39c55c', 'Kaninchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('d787695c-cfa7-4e23-9bd7-ce1b65ee8e1b', 'Meerschweinchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('f1b3fac7-11d7-403b-8299-fafc6a341feb', 'Hamster', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('5a3136dd-b8f2-4190-a074-e562add620b0', 'Kleinnager', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('f6234e7d-d038-4260-b8fd-6e0b73ca7161', 'Vogel', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('55e6a4db-720b-42a5-ab9d-dc1ca691097e', 'Fisch', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('5795f164-9143-4e88-bca0-61e075c96be5', 'Schildkröte', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('42b77226-b29b-495e-9b3b-09439d968605', 'Reptil', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('50be8a3e-636f-4cf0-8b20-9d816e5decda', 'Amphibie', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('bd36a8fd-4330-44d4-8262-5add72e99fa8', 'Huhn', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('cbb409b9-1786-4880-bf57-d43f4500619f', 'Ziege', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('1c3fad5b-2ea8-4ce3-b7c6-968e8f546ce6', 'Schwein', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('088c4d4d-5ab6-4e33-99b8-547160075dab', 'Pferd', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                           ('72b5f57f-c586-4f2e-8da3-c3297e539f1d', 'Biber', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
--> statement-breakpoint
INSERT INTO breeds (id, species_id, name, created_at, updated_at) VALUES
                                                                      ('0ee58578-c3e4-42e3-8b4d-8e3166b828ba', (SELECT id FROM species WHERE name = 'Hund'), 'Labrador', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('2d775ff0-900a-402c-ab17-8c393d3b2592', (SELECT id FROM species WHERE name = 'Hund'), 'Golden Retriever', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('6ba474a0-e281-46c7-ace0-639ef471c604', (SELECT id FROM species WHERE name = 'Hund'), 'Deutscher Schäferhund', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('0f5cfa46-a8e9-49f2-8ba9-c1056bfb7f41', (SELECT id FROM species WHERE name = 'Hund'), 'Belgischer Schäferhund', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('4013ea29-a06d-4a4c-950e-53d58c9e2624', (SELECT id FROM species WHERE name = 'Hund'), 'Border Collie', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('715a41d2-5355-4aa9-8d0e-91d33b43f589', (SELECT id FROM species WHERE name = 'Hund'), 'Australian Shepherd', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('da8df3ce-eaf9-4752-9767-c6785752e580', (SELECT id FROM species WHERE name = 'Hund'), 'Siberian Husky', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('334d1013-3b64-442f-bd35-9481aff9cde3', (SELECT id FROM species WHERE name = 'Hund'), 'Berner Sennenhund', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('f21399df-a5a3-4b93-8794-747977119132', (SELECT id FROM species WHERE name = 'Hund'), 'Rottweiler', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('cb27b8d0-4603-4918-b525-9e69aa34f81b', (SELECT id FROM species WHERE name = 'Hund'), 'Dobermann', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('8c61f588-93c4-4d6a-989c-42b62660fa64', (SELECT id FROM species WHERE name = 'Hund'), 'Boxer', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('548afe32-4e66-4091-9873-44a4ac8313b7', (SELECT id FROM species WHERE name = 'Hund'), 'Dalmatiner', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('19229f03-92d0-4975-a3d9-8633bdc9a355', (SELECT id FROM species WHERE name = 'Hund'), 'Beagle', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('c4e12fb8-ba00-4705-836f-73779a40bd60', (SELECT id FROM species WHERE name = 'Hund'), 'Podenco', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('e4379f48-f802-4f67-8b12-a4db3331f19b', (SELECT id FROM species WHERE name = 'Hund'), 'Dackel', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('36e6d758-cdd4-47d7-bf75-a30a07c19529', (SELECT id FROM species WHERE name = 'Hund'), 'Jack Russell Terrier', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b1c5c09d-dac1-448d-92e5-3c83016c2896', (SELECT id FROM species WHERE name = 'Hund'), 'Yorkshire Terrier', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b6706a07-4354-4f36-bac7-fc19b50c48f3', (SELECT id FROM species WHERE name = 'Hund'), 'Staffordshire Bull Terrier', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('575a125a-f8e6-408d-bea5-987239ded5c3', (SELECT id FROM species WHERE name = 'Hund'), 'Französische Bulldogge', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('9a6820b4-8da5-47ed-ad84-73bde1c077bc', (SELECT id FROM species WHERE name = 'Hund'), 'Englische Bulldogge', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('8bbff5da-c7bd-47d3-a6dd-b3a237f68116', (SELECT id FROM species WHERE name = 'Hund'), 'Mops', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('623eb087-4659-447d-9b90-caefc03046db', (SELECT id FROM species WHERE name = 'Hund'), 'Cocker Spaniel', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('99a49068-1cb9-4383-8664-9337325ebd3d', (SELECT id FROM species WHERE name = 'Hund'), 'Pudel', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('f778484e-9a96-45bc-926d-7868efef14c0', (SELECT id FROM species WHERE name = 'Hund'), 'Zwergschnauzer', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('552ebebe-564a-45f4-83da-062bea4cc03b', (SELECT id FROM species WHERE name = 'Hund'), 'Zwergspitz', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('77689815-280e-4a67-a51d-0fbf887e1a7c', (SELECT id FROM species WHERE name = 'Hund'), 'Chihuahua', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('af6c8605-349b-448c-b725-24999f74d40c', (SELECT id FROM species WHERE name = 'Hund'), 'Malteser', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('cdf4503a-22e9-43d7-80ce-9b7dad00d0fb', (SELECT id FROM species WHERE name = 'Hund'), 'Mischling', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('6fcb6a2e-28f9-4870-910d-19544cbb7f79', (SELECT id FROM species WHERE name = 'Hund'), 'Corgi', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('fdc23b30-2334-4ac6-8a5e-a9c45aa4dae7', (SELECT id FROM species WHERE name = 'Katze'), 'Europäisch Kurzhaar', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('c2d180e2-7e6b-4e7a-a2d4-ac8a035ea826', (SELECT id FROM species WHERE name = 'Katze'), 'Britisch Kurzhaar', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('3758c48f-5b16-4a23-b5f9-01b101dcbebb', (SELECT id FROM species WHERE name = 'Katze'), 'Maine Coon', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('a9791e8a-a23d-4e0a-aa20-4143cf64c320', (SELECT id FROM species WHERE name = 'Katze'), 'Norwegische Waldkatze', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('0a8f5c04-a376-4571-967b-2d2c83a5ad19', (SELECT id FROM species WHERE name = 'Katze'), 'Ragdoll', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('3173a12a-1b66-4331-9b2b-814858253098', (SELECT id FROM species WHERE name = 'Katze'), 'Perserkatze', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('2aafac2b-7ede-4e92-9a47-2690145c8e73', (SELECT id FROM species WHERE name = 'Katze'), 'Exotic Shorthair', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('98e12a90-d57a-48ba-85db-964638635d16', (SELECT id FROM species WHERE name = 'Katze'), 'Siamkatze', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('05676e8e-245c-4898-9e1c-9853e694a985', (SELECT id FROM species WHERE name = 'Katze'), 'Burmakatze', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('438d8bff-d6eb-4e19-8779-de85375de626', (SELECT id FROM species WHERE name = 'Katze'), 'Heilige Birma', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('90e67ad0-7a16-41b3-82ad-ccebf8b281c1', (SELECT id FROM species WHERE name = 'Katze'), 'Bengalkatze', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('993b85d9-66a8-43db-a9e3-080732f04e04', (SELECT id FROM species WHERE name = 'Katze'), 'Sphynx', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('ffa44e0f-8d39-4c9b-bc54-76b313a721dc', (SELECT id FROM species WHERE name = 'Katze'), 'Devon Rex', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('9fda4dc7-c44a-4245-9d4f-75044514aca3', (SELECT id FROM species WHERE name = 'Katze'), 'Russisch Blau', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('6f5d6495-5b05-4443-8fb3-35ba15034594', (SELECT id FROM species WHERE name = 'Katze'), 'Abessinier', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b736029d-84ba-4904-8a34-4a9fb06d8c00', (SELECT id FROM species WHERE name = 'Katze'), 'Türkisch Angora', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('548e68aa-d328-4fe8-9fa9-599b15424b1b', (SELECT id FROM species WHERE name = 'Katze'), 'Schottische Faltohrkatze', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('674bddfd-10d5-41c9-83be-f4e1afe9e44e', (SELECT id FROM species WHERE name = 'Katze'), 'Hauskatze (Mischling)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('0896660d-9d0e-49ab-abaa-fe52769bdade', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Zwergkaninchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('edbc5c84-e704-4b44-8d37-fd84181fc55b', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Zwergwidder', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('da55ae80-1ca2-4bb4-a31b-be17ceef76e7', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Löwenkopfkaninchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('236b0058-be2a-47fc-b336-691d48ada802', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Farbenzwerg', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('38e4ac3f-8ae6-4dad-8f51-c6b47f40ce81', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Widderkaninchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('aad8f9fb-4868-4fdf-be54-9a2db44936c6', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Rexkaninchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('c15b4712-ba96-473e-ba82-ea89f9f2108c', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Deutscher Riese', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('a34af22e-1e03-4f48-ba96-c59a36eb431d', (SELECT id FROM species WHERE name = 'Kaninchen'), 'Mischling', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('1f6923e3-5b75-4593-8df3-d771c09fccca', (SELECT id FROM species WHERE name = 'Meerschweinchen'), 'Glatthaar-Meerschweinchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('e67f4df8-6463-4344-9384-62e136ef5c8e', (SELECT id FROM species WHERE name = 'Meerschweinchen'), 'Rosetten-Meerschweinchen (Abessinier)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('5e6df676-e6e4-4b04-b48b-9ef2ba0f52c8', (SELECT id FROM species WHERE name = 'Meerschweinchen'), 'Peruaner', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('698dac9f-28ad-407b-ae20-edf34ef1c6c8', (SELECT id FROM species WHERE name = 'Meerschweinchen'), 'Teddy', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('ba78efd7-ee55-4520-95a8-b0f5b47bfb20', (SELECT id FROM species WHERE name = 'Meerschweinchen'), 'Skinny Pig (Nacktmeerschweinchen)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('bc7bd78a-eda3-44c9-9750-694726a32df7', (SELECT id FROM species WHERE name = 'Meerschweinchen'), 'Mischling', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b0d6d3a7-f2df-4770-8bfb-093586bd5165', (SELECT id FROM species WHERE name = 'Hamster'), 'Goldhamster (Syrischer Hamster)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('ac1cffe5-8486-4929-8aa8-4cb8cbb4a112', (SELECT id FROM species WHERE name = 'Hamster'), 'Teddyhamster (Langhaar-Goldhamster)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('ce945729-42fd-4bc2-b33b-9cda4ce2cfc9', (SELECT id FROM species WHERE name = 'Hamster'), 'Dsungarischer Zwerghamster', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('50a79e46-63e6-4de2-8899-521e79a58191', (SELECT id FROM species WHERE name = 'Hamster'), 'Campbell-Zwerghamster', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('d3bf91c2-0b9b-4a92-ae7f-cecf3b88bf6f', (SELECT id FROM species WHERE name = 'Hamster'), 'Roborowski-Zwerghamster', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('921ad7ff-e1fc-4b06-ad38-aa1ca084684a', (SELECT id FROM species WHERE name = 'Kleinnager'), 'Farbmaus', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('e754c7c0-1841-46f7-8db4-c3dc135b434b', (SELECT id FROM species WHERE name = 'Kleinnager'), 'Farbratte', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('0464b519-1b47-4622-827e-a2b4b4b95bce', (SELECT id FROM species WHERE name = 'Kleinnager'), 'Mongolische Rennmaus', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('e7255f10-bb96-4660-929a-5274178a68cd', (SELECT id FROM species WHERE name = 'Kleinnager'), 'Chinchilla', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b0a3d726-c584-45cf-9439-2cfe35e3e338', (SELECT id FROM species WHERE name = 'Kleinnager'), 'Degu', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b56908e7-1dc4-49aa-a5f3-1b9ae27e2dc3', (SELECT id FROM species WHERE name = 'Kleinnager'), 'Sibirisches Streifenhörnchen', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('cac7a484-7607-4dd5-8632-cd4f774ddaec', (SELECT id FROM species WHERE name = 'Vogel'), 'Wellensittich', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('84781911-7a87-41b5-901d-1a061ce07690', (SELECT id FROM species WHERE name = 'Vogel'), 'Nymphensittich', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('0bc5b130-7aaa-4d08-ac09-66dd8c872164', (SELECT id FROM species WHERE name = 'Vogel'), 'Unzertrennliche (Agaporniden)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('58b72b9e-1e9c-454d-9ef4-ea69f18f9358', (SELECT id FROM species WHERE name = 'Vogel'), 'Halsbandsittich', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('e7edc5b6-cd19-4813-80a4-651d28c47ae0', (SELECT id FROM species WHERE name = 'Vogel'), 'Graupapagei', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('5c1f2d28-b12f-4a77-98a0-e19e77ecd266', (SELECT id FROM species WHERE name = 'Vogel'), 'Amazone', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('38190cd0-3264-45e1-a1c8-38333b093e00', (SELECT id FROM species WHERE name = 'Vogel'), 'Ara', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('656c867c-c428-4a03-a785-905406e994a8', (SELECT id FROM species WHERE name = 'Vogel'), 'Gelbhaubenkakadu', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('5e39c967-bd5f-434f-b584-6ef6088a2ddf', (SELECT id FROM species WHERE name = 'Vogel'), 'Kanarienvogel', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('536b8cc2-82bd-40b6-9888-32595ee72b70', (SELECT id FROM species WHERE name = 'Vogel'), 'Zebrafink', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('552be7cc-67dd-4bbb-9e9f-7a7d2a4c50b9', (SELECT id FROM species WHERE name = 'Fisch'), 'Guppy', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('31beebad-704e-417a-9f7b-b97cd5870577', (SELECT id FROM species WHERE name = 'Fisch'), 'Platy', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('62e0d6c6-f5b7-4f1b-b59a-bafc59d72561', (SELECT id FROM species WHERE name = 'Fisch'), 'Neonsalmler', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('96382118-a3e3-49f4-9df2-8182d57b78ec', (SELECT id FROM species WHERE name = 'Fisch'), 'Skalar', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('cbed435b-7a32-43d2-bcbe-41336049a630', (SELECT id FROM species WHERE name = 'Fisch'), 'Kampffisch (Betta)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('15931faf-e026-463b-b9c0-ef1dc8f2d70e', (SELECT id FROM species WHERE name = 'Fisch'), 'Panzerwels', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('8aad38da-8e25-487e-a830-47c7166b1117', (SELECT id FROM species WHERE name = 'Fisch'), 'Goldfisch', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('95c78091-5542-43d4-875c-635c434dc846', (SELECT id FROM species WHERE name = 'Schildkröte'), 'Griechische Landschildkröte', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('59c00af0-687b-43f0-8055-10f2b90929f8', (SELECT id FROM species WHERE name = 'Schildkröte'), 'Maurische Landschildkröte', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('c89bc2d3-b6b4-4120-b495-241bf17b88c0', (SELECT id FROM species WHERE name = 'Schildkröte'), 'Russische Landschildkröte (Steppenschildkröte)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('f4f8d6bd-968d-4c54-980c-70f615b01267', (SELECT id FROM species WHERE name = 'Schildkröte'), 'Rotwangen-Schmuckschildkröte', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('9687aedc-c2cd-47a1-bdd0-08bc40d656ea', (SELECT id FROM species WHERE name = 'Reptil'), 'Bartagame', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('d42c5842-4e01-43e9-8b8f-bc5691c8b972', (SELECT id FROM species WHERE name = 'Reptil'), 'Leopardgecko', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('1ccc8a5e-5616-4a39-9573-ea3ec34495aa', (SELECT id FROM species WHERE name = 'Reptil'), 'Kronengecko', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('3033a2ef-4d3b-444f-a350-060e8232f36e', (SELECT id FROM species WHERE name = 'Reptil'), 'Jemenchamäleon', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('4a0922f4-b136-4a8a-9c97-b2884e6448c7', (SELECT id FROM species WHERE name = 'Reptil'), 'Kornnatter', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('7aa6388a-f692-4128-a6c1-794c4f29c873', (SELECT id FROM species WHERE name = 'Reptil'), 'Königspython', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('9670e089-6082-470b-9c2d-49832942c34d', (SELECT id FROM species WHERE name = 'Amphibie'), 'Axolotl', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('3420d493-8913-4144-b9c5-d4487b5349b3', (SELECT id FROM species WHERE name = 'Amphibie'), 'Tigersalamander', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('1f668010-ffd5-4d72-8a28-1656836cb676', (SELECT id FROM species WHERE name = 'Amphibie'), 'Rotaugenlaubfrosch', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('c0ce86f0-0218-4e5b-a886-76c658585e0f', (SELECT id FROM species WHERE name = 'Amphibie'), 'Färberfrosch (Pfeilgiftfrosch)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('7880a9c1-4654-4e13-a5d7-25e376b9af17', (SELECT id FROM species WHERE name = 'Amphibie'), 'Afrikanischer Krallenfrosch', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('f3643ad5-5483-4f52-82a6-3df8c63a3b1e', (SELECT id FROM species WHERE name = 'Huhn'), 'Legehybride (Lohmann Brown)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('1820ba83-2d99-4b15-9137-2ceb1b5794b3', (SELECT id FROM species WHERE name = 'Huhn'), 'Sussex', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b3440db9-eb5a-4676-b4e2-bf6aefb88b75', (SELECT id FROM species WHERE name = 'Huhn'), 'Orpington', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('ad8f6411-07cc-4107-ba0c-5cff4fcdc7d1', (SELECT id FROM species WHERE name = 'Huhn'), 'Seidenhuhn', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('5a47fef5-51fa-49de-9c94-1bd33e9c5cb1', (SELECT id FROM species WHERE name = 'Huhn'), 'Zwerg-Cochin', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('6651273f-021f-4f61-b1dc-db81947086b5', (SELECT id FROM species WHERE name = 'Huhn'), 'Mischling', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('ba4e234a-abdc-4037-b85e-76375a1eae25', (SELECT id FROM species WHERE name = 'Ziege'), 'Afrikanische Zwergziege', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('15ab857c-3ed4-4a93-8d58-ded0057c862d', (SELECT id FROM species WHERE name = 'Ziege'), 'Bunte Deutsche Edelziege', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('43b544fc-6b27-4d80-a51b-0f278ab1ea60', (SELECT id FROM species WHERE name = 'Ziege'), 'Mischling', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('8dbe9352-ed82-40cc-8d98-d96a44a18856', (SELECT id FROM species WHERE name = 'Schwein'), 'Hängebauchschwein', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b88da1cd-694b-4fd1-80c3-dca2349fcb06', (SELECT id FROM species WHERE name = 'Schwein'), 'Minischwein', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('b468a2eb-9af2-4b84-91f3-f2806887889a', (SELECT id FROM species WHERE name = 'Schwein'), 'Mischling', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('6eec7a2c-7e9b-42d5-b696-7449633d4857', (SELECT id FROM species WHERE name = 'Pferd'), 'Shetlandpony', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('4f0e9fde-aa80-4485-b2bf-a1b7f8acb7c9', (SELECT id FROM species WHERE name = 'Pferd'), 'Islandpferd', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('0e82ccca-d3d8-456b-a9d4-024105a36bf9', (SELECT id FROM species WHERE name = 'Pferd'), 'Haflinger', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                                                                      ('34c7d3a6-f200-4855-87cc-f8767b98879d', (SELECT id FROM species WHERE name = 'Pferd'), 'Mischling', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));