import { click, render } from "@ember/test-helpers";
import { setupRenderingTest } from "ember-qunit";
import { module, test } from "qunit";
import FilterTag from "../../discourse/components/filter-tag";

module("Integration | Component | filter-tag", function (hooks) {
  setupRenderingTest(hooks);

  test("renders and toggles tags", async function (assert) {
    this.set("tagName", "exampleTag");
    this.set("selectedTags", []);
    this.set("selectTag", (tag) => this.selectedTags.push(tag));
    this.set("deselectTag", (tag) =>
      this.set(
        "selectedTags",
        this.selectedTags.filter((t) => t !== tag)
      )
    );

    await render(
      <template>
        <FilterTag
          @name={{this.tagName}}
          @selectedTags={{this.selectedTags}}
          @selectTag={{this.selectTag}}
          @deselectTag={{this.deselectTag}}
        />
      </template>
    );

    assert.dom("label").hasText("exampleTag");
    assert.dom('input[type="checkbox"]').isNotChecked();

    await click('input[type="checkbox"]');
    assert.dom('input[type="checkbox"]').isChecked();
    assert.deepEqual(this.selectedTags, ["exampleTag"]);

    await click('input[type="checkbox"]');
    assert.dom('input[type="checkbox"]').isNotChecked();
    assert.deepEqual(this.selectedTags, []);
  });
});
