import { findAllTags, type Tag } from "../repositories/tagRepository.js";
import { tagCategories } from "../validation/schemas.js";

type GroupedTag = {
  category: (typeof tagCategories)[number];
  tags: Tag[];
};

export async function getAllTagsGroupedByCategory(): Promise<GroupedTag[]> {
  const allTags = await findAllTags();
  return [...tagCategories]
    .sort((a, b) => a.localeCompare(b, "de"))
    .map((category) => ({
      category: category,
      tags: allTags.filter((tag) => tag.category === category).sort((a, b) => a.name.localeCompare(b.name, "de"))
    }))
    .filter((group) => group.tags.length > 0);
}
