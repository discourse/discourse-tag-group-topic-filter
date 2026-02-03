import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { Input } from "@ember/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import concatClass from "discourse/helpers/concat-class";
import DiscourseURL from "discourse/lib/url";
import { i18n } from "discourse-i18n";
import FilterTag from "./filter-tag";

export default class CustomFilter extends Component {
  @service router;
  @service site;

  @tracked orFilter = false;
  selectedTagNames = [];
  category = {};
  tagCache = new Map();

  constructor() {
    super(...arguments);
    this._initializeSelectedTags();
    this._loadTagsFromSite();
  }

  _initializeSelectedTags() {
    const currentRoute = this.router.currentRoute;
    if (currentRoute.name === "tag.show") {
      const tag = currentRoute.attributes?.tag;
      if (tag) {
        this.selectedTagNames = [tag.name];
        this.tagCache.set(tag.name, tag);
      }
    }
    if (currentRoute.name === "tags.intersection") {
      const tag = currentRoute.attributes?.tag;
      if (tag) {
        this.tagCache.set(tag.name, tag);
      }
      this.selectedTagNames = [
        currentRoute.attributes.tag.name,
        ...currentRoute.attributes.additionalTags,
      ];
    }

    this.category = currentRoute.attributes?.category
      ? currentRoute.attributes?.category
      : { slug: currentRoute.queryParams.category };

    this.orFilter = this.router.currentRoute.queryParams.hasOwnProperty(
      "match_all_tags"
    )
      ? !this.router.currentRoute.queryParams.orFilter
      : false;
  }

  _loadTagsFromSite() {
    const siteTags = this.site.navigation_menu_site_top_tags || [];
    siteTags.forEach((tag) => {
      if (tag.name && !this.tagCache.has(tag.name)) {
        this.tagCache.set(tag.name, tag);
      }
    });
  }

  _getTagByName(tagName) {
    return this.tagCache.get(tagName) || null;
  }

  _getTagUrl(tagName) {
    const tag = this._getTagByName(tagName);
    if (tag?.url) {
      return tag.url;
    }
    if (tag?.id && tag?.slug) {
      return `/tag/${tag.slug}/${tag.id}`;
    }
    // Fallback to legacy format if tag not found
    return `/tag/${tagName}`;
  }

  _getCategoryTagUrl(categorySlug, tagName) {
    const tag = this._getTagByName(tagName);
    if (tag?.id && tag?.slug) {
      return `/tags/c/${categorySlug}/${tag.slug}/${tag.id}`;
    }
    // Fallback to legacy format
    return `/tags/c/${categorySlug}/${tagName}`;
  }

  get tagGroups() {
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
  selectTag(tagName) {
    this.selectedTagNames.push(tagName);
  }

  @action
  deselectTag(tagName) {
    this.selectedTagNames = this.selectedTagNames.filter((t) => t !== tagName);
  }

  @action
  applyFilters() {
    let transitionURL = "";

    if (this.selectedTagNames.length > 1) {
      // Intersection routes still use tag names
      const tagsPath = this.selectedTagNames.join("/");
      transitionURL = `/tags/intersection/${tagsPath}`;
    } else if (this.selectedTagNames.length === 0) {
      transitionURL = this.category.slug
        ? `/c/${this.category.slug}`
        : "/latest";
      DiscourseURL.routeTo(transitionURL);
      return;
    } else {
      const tagName = this.selectedTagNames[0];
      transitionURL = this.category.slug
        ? this._getCategoryTagUrl(this.category.slug, tagName)
        : this._getTagUrl(tagName);
    }

    let params = [];

    if (this.category.slug) {
      params.push(`category=${this.category.slug}`);
    }
    if (this.orFilter) {
      params.push(`match_all_tags=${!this.orFilter}`);
    }

    if (params.length > 0) {
      transitionURL = `${transitionURL}?${params.join("&")}`;
    }
    DiscourseURL.routeTo(transitionURL);
  }

  <template>
    {{#if this.shouldShowBlock}}
      <div class="custom-filters">
        <div class="custom-filters__body">
          <h3>{{i18n (themePrefix "custom_filters.title")}}</h3>
          <label
            for="custom-filter-logic-selector"
            class={{concatClass
              "btn custom-filter-logic-selector"
              (if this.orFilter "checked")
            }}
          >
            {{i18n (themePrefix "custom_filters.or")}}
            <Input
              {{on "change" this.toggleTag}}
              @checked={{this.orFilter}}
              @type="checkbox"
              id="custom-filter-logic-selector"
              class="custom-filter-logic-selector filter-tag-input"
            />
          </label>

          <ul class="custom-filters__tags">
            {{#each this.tagGroups as |tagGroup|}}
              {{#if tagGroup.name}}
                <li class="custom-filters__group">
                  <h2>{{tagGroup.name}}</h2>
                  <div class="custom-filters__list">
                    {{#each tagGroup.tags as |tag|}}
                      <FilterTag
                        @name={{tag}}
                        @selectTag={{this.selectTag}}
                        @deselectTag={{this.deselectTag}}
                        @selectedTags={{this.selectedTagNames}}
                      />
                    {{/each}}
                  </div>
                </li>
              {{/if}}
            {{/each}}
          </ul>

          <DButton
            {{on "click" this.applyFilters}}
            @translatedLabel={{i18n (themePrefix "apply_filters")}}
            class="custom-filters__button"
          />
        </div>
      </div>
    {{/if}}
  </template>
}
