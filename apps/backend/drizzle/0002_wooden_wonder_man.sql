CREATE TABLE `__new_interests`
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
        check (status IN ('user_liked', 'user_disliked', 'user_requested', 'shelter_rejected', 'shelter_accepted'))
);
--> statement-breakpoint
INSERT INTO `__new_interests`("user_id", "animal_id", "status", "appointment_at", "created_at", "updated_at")
SELECT "user_id", "animal_id", "status", "appointment_at", "created_at", "updated_at"
FROM `interests`;--> statement-breakpoint
DROP TABLE `interests`;--> statement-breakpoint
ALTER TABLE `__new_interests` RENAME TO `interests`;