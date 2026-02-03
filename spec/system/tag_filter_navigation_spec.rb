# frozen_string_literal: true

RSpec.describe "Tag filter navigation", system: true do
  fab!(:tag) { Fabricate(:tag, name: "important") }
  fab!(:topic) { Fabricate(:topic, tags: [tag]) }

  let!(:theme) { upload_theme_component }

  before do
    SiteSetting.tagging_enabled = true
    theme.update_setting(:first_tag_group_name, "Status")
    theme.update_setting(:first_group_tag, "important")
    theme.save!
  end

  it "navigates to tag page using canonical URL format" do
    visit("/latest")

    expect(page).to have_css(".custom-filters")

    find(".filter-tag-label", text: "important").click
    find(".custom-filters__button").click

    expect(page).to have_current_path("/tag/important/#{tag.id}")
  end
end
