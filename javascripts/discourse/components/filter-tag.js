import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { capitalize } from "@ember/string";
import { htmlSafe } from "@ember/template";
export default class StatusTagsComponent extends Component {
  @tracked isChecked = this.args.selectedTags.includes(this.tagName);
  filterPrimaryColor =
    this.args.primaryColor ||
    getComputedStyle(document.documentElement).getPropertyValue(
      "--primary-medium"
    );
  filterSecondaryColor =
    this.args.secondaryColor ||
    getComputedStyle(document.documentElement).getPropertyValue(
      "--primary-low"
    );

  get style() {
    if (this.filterPrimaryColor && this.filterSecondaryColor) {
      console.log("group style");
      const backgroundColor = this.isChecked
        ? this.filterPrimaryColor
        : this.filterSecondaryColor;

      const hoverColor = !this.isChecked
        ? this.filterPrimaryColor
        : this.filterSecondaryColor;

      return htmlSafe(
        `--hover-color: ${hoverColor}; --background-color: ${backgroundColor};`
      );
    }

    return "";
  }

  get idTagName() {
    return this.args.name + "-custom-tag";
  }
  get tagName() {
    return capitalize(this.args.name);
  }

  @action
  toggleTag() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.args.selectTag(this.tagName);
    } else {
      this.args.deselectTag(this.tagName);
    }
  }
}
