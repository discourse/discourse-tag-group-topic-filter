import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
export default class StatusTagsComponent extends Component {
  @tracked isChecked = this.args.selectedTags.includes(this.tagName);

  get idTagName() {
    return this.args.name + "-custom-tag";
  }

  get tagName() {
    return this.args.name;
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
