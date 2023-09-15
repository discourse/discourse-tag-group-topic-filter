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
  @tracked or_filter = false;
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
      : { slug: currentRoute.queryParams.category };

    this.or_filter = this.router.currentRoute.queryParams.hasOwnProperty(
      "match_all_tags"
    )
      ? !this.router.currentRoute.queryParams.or_filter
      : false;
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
  toggleTag() {
    this.or_filter = !this.or_filter;
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
    const tagsPath = this.selectedTags.join("/");
    const category = this.category;

    let transitionURL = "";

    if (this.selectedTags.length > 1) {
      transitionURL = `/tags/intersection/${tagsPath}`;
    } else {
      transitionURL = `/tag/${tagsPath}`;
    }

    let params = [];

    if (category.slug) {
      params.push(`category=${category.slug}`);
    }
    if (this.or_filter) {
      params.push(`match_all_tags=${!this.or_filter}`);
    }

    transitionURL = `${transitionURL}?${params.join("&")}`;

    DiscourseURL.routeTo(transitionURL);
  }
}
