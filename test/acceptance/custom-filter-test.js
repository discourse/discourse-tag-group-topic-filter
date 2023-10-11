// tests/integration/components/custom-filter-test.js

import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, click, visit } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

module("Integration | Component | custom-filter", function (hooks) {
  setupRenderingTest(hooks);

  test("it renders and triggers actions", async function (assert) {
    // Render the component.
    debugger;
    await render(hbs`<CustomFilter />`);

    // Check if the component renders correctly.
    assert.dom(".custom-filters").exists();
    assert.dom("h3").containsText("Custom Filters");

    // Check the initial state of the "or" checkbox.
    assert.dom("#custom-filter-logic-selector").isNotChecked();

    // Click the "or" checkbox.
    await click("#custom-filter-logic-selector");

    // Check if the "or" checkbox toggles.
    assert.dom("#custom-filter-logic-selector").isChecked();

    // Trigger the applyFilters action.
    await click(".custom-filters__button");

    // You can add more assertions based on your component's behavior.
  });
});
