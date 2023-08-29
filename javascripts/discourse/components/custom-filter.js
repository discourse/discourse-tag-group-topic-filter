import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";

export default class CustomFilter extends Component {
  @service siteSettings;
  @service router;

  selectedTags = [];
  category = 0;

  constructor() {
    super(...arguments);
    this._initializeSelectedTags();
  }

  _initializeSelectedTags() {
    const currentRoute = this.router.currentRoute;
    const { params } = currentRoute;
    if (params.intersection) {
      const selectedTags = params.intersection.split("/");
      this.selectedTags = selectedTags;
    }
    this.category = currentRoute.attributes?.category;
  }

  get tagGroups() {
    debugger;
    return [
      {
        name: settings.first_tag_group_name,
        tags: settings.first_group_tag.split("|"),
      },
      {
        name: settings.second_tag_group_name,
        tags: settings.second_group_tag.split("|"),
      },
      {
        name: settings.third_tag_group_name,
        tags: settings.third_group_tag.split("|"),
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
    const tagsPath = this.selectedTags.join('/');
    this.router.transitionTo({ queryParams: { intersection: tagsPath } });
  }
}
