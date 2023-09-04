import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { TrackedArray } from "@ember-compat/tracked-built-ins";
import { tracked } from "@glimmer/tracking";
import DiscourseURL from "discourse/lib/url";

export default class CustomFilter extends Component {
  @service siteSettings;
  @service router;

  @tracked selectedTags = new TrackedArray();
  category = {};

  constructor() {
    super(...arguments);
    this._initializeSelectedTags();
  }

  _initializeSelectedTags() {
    const currentRoute = this.router.currentRoute;
    if (currentRoute.name == "tags.intersection") {
      this.selectedTags = [
        currentRoute.attributes?.tag.id,
        ...currentRoute.attributes?.additionalTags,
      ];
    }
    this.category = currentRoute.attributes?.category
      ? currentRoute.attributes?.category
      : { id: currentRoute.queryParams.category };
  }

  get tagGroups() {
    return [
      {
        name: settings.first_tag_group_name,
        tags: settings.first_group_tag.split("|"),
        primaryColor: settings.first_group_tag_primary_color,
        secondaryColor: settings.first_group_tag_secondary_color,
      },
      {
        name: settings.second_tag_group_name,
        tags: settings.second_group_tag.split("|"),
        primaryColor: settings.second_group_tag_primary_color,
        secondaryColor: settings.second_group_tag_secondary_color,
      },
      {
        name: settings.third_tag_group_name,
        tags: settings.third_group_tag.split("|"),
        primaryColor: settings.third_group_tag_primary_color,
        secondaryColor: settings.third_group_tag_secondary_color,
      },
    ];
  }

  @service router;

  get shouldShowBlock() {
    const currentRoute = this.router.currentRoute;
    const { params } = this.args;
    const { displayInSpecificCategories, displayOnHomepage } = params || {};
    const category = currentRoute.attributes?.category;
    const categories = displayInSpecificCategories?.split(",").map(Number);
    const onHomepage =
      currentRoute.name === "discovery.latest" ||
      currentRoute.name === "discovery.top";

    return (
      Boolean(displayOnHomepage && onHomepage) ||
      categories?.includes(category?.id) ||
      (displayOnHomepage === undefined &&
        displayInSpecificCategories === undefined)
    );
  }

  @action
  selectTag(tag) {
    this.selectedTags.push(tag);
  }

  @action
  deselectTag(tag) {
    this.selectedTags = this.selectedTags.filter((t) => t !== tag);
  }

  @action
  applyFilters() {
    console.log("transition");
    const tagsPath = this.selectedTags.join("/");
    const category = this.category;
    const transitionURL = category
      ? `/tags/intersection/${tagsPath}?category=${category.id}`
      : `/tags/intersection/${tagsPath}`;
    DiscourseURL.routeTo(transitionURL, { queryParams: { category: 4 } });
  }
}
