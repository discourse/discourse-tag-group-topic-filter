import { getOwner } from "@ember/owner";
import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { cloneJSON } from "discourse/lib/object";
import discoveryFixture from "discourse/tests/fixtures/discovery-fixtures";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Custom Filter | tag route", function (needs) {
  needs.settings({ tagging_enabled: true });

  needs.pretender((server, helper) => {
    server.get("/tag/1/l/latest.json", () => {
      return helper.response(
        cloneJSON(discoveryFixture["/tag/important/l/latest.json"])
      );
    });
    server.get("/tag/important/info.json", () => {
      return helper.response({
        tag_info: {
          id: 1,
          name: "important",
          slug: "important",
          description: "Important topics for discussion",
          topic_count: 5,
          pm_only: false,
        },
      });
    });
  });

  test("tag route provides tag name in route attributes", async function (assert) {
    await visit("/tag/important");

    const router = getOwner(this).lookup("service:router");
    const tagName = router.currentRoute.attributes?.tag?.name;

    assert.strictEqual(
      tagName,
      "important",
      "tag.name is available in route attributes"
    );
  });
});
