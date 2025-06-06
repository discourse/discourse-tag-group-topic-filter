import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { Input } from "@ember/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import concatClass from "discourse/helpers/concat-class";

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

  <template>
    <label
      for={{this.idTagName}}
      class={{concatClass
        "custom_tag filter-tag-label"
        (if this.isChecked "checked")
      }}
    >
      <Input
        {{on "change" this.toggleTag}}
        @checked={{this.isChecked}}
        @type="checkbox"
        id={{this.idTagName}}
        class="filter-tag-input"
      />
      {{this.tagName}}
    </label>
  </template>
}
