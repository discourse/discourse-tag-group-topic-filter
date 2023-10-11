import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import DiscourseURL from "discourse/lib/url";

export default class CustomFilter extends Component {
  @service siteSettings;
  @service router;

  @tracked orFilter = false;
  selectedTags = [];
  category = {};

  constructor() {
    super(...arguments);
    this._initializeSelectedTags();
  }

  _initializeSelectedTags() {
    const currentRoute = this.router.currentRoute;
    if (currentRoute.name === "tag.show") {
      this.selectedTags = [currentRoute.attributes?.tag.id];
    }
    if (currentRoute.name === "tags.intersection") {
      this.selectedTags = [
        currentRoute.attributes?.tag.id,
        ...currentRoute.attributes?.additionalTags,
      ];
    }

    this.category = currentRoute.attributes?.category
      ? currentRoute.attributes?.category
      : { slug: currentRoute.queryParams.category };

    this.orFilter = this.router.currentRoute.queryParams.hasOwnProperty(
      "match_all_tags",
    )
      ? !this.router.currentRoute.queryParams.orFilter
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
    this.orFilter = !this.orFilter;
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

    let transitionURL = "";
    if (this.selectedTags.length > 1) {
      transitionURL = `/tags/intersection/${tagsPath}`;
    } else if (this.selectedTags.length === 0) {
      transitionURL = this.category.slug
        ? `/c/${this.category.slug}`
        : "/latest";
      DiscourseURL.routeTo(transitionURL);
    } else {
      transitionURL = this.category.slug
        ? `/tags/c/${this.category.slug}/${tagsPath}`
        : `/tag/${tagsPath}`;
    }

    let params = [];

    if (this.category.slug) {
      params.push(`category=${this.category.slug}`);
    }
    if (this.orFilter) {
      params.push(`match_all_tags=${!this.orFilter}`);
    }

    transitionURL = `${transitionURL}?${params.join("&")}`;
    DiscourseURL.routeTo(transitionURL);
  }
}
