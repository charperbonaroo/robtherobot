import { YamlConfig } from "../../src/workflow/YamlConfig";

describe("YamlConfig", () => {
  let config: YamlConfig;

  beforeEach(() => {
    config = new YamlConfig("robots/xml-feed-reader.yml").readSync();
  });

  it("parses a YAML config", () => {
    expect(config.name).toEqual("XML feed reader");
  });

  it("parses entrypoint", () => {
    expect(config.entrypoint).toEqual("home");
  });

  it("parses variables", () => {
    expect(config.variables).toEqual({
      xml_feed_url: {
        name: "xml_feed_url",
        type: "string",
        description: "The URL to load XML data from"
      },
      xml_feed_file: {
        name: "xml_feed_file",
        type: "string",
        description: "A filename relative to the working directory to store the raw XML feed in.\n",
      },
      config_description: {
        name: "config_description",
        type: "string",
        description: "Description of the XML feed's structure",
      },
    });
  });

  it("parses steps", () => {
    expect(config.steps).toEqual({
      home: {
        next: ["load-xml"],
        name: "home",
        type: "llm-gpt4o",
        instruction: `
          If there is no xml_feed_url yet, ask the user. If there
          is, continue to the next step. Don't forget to assign a xml_feed_file
          variable.
        `.replace(/\s+/g, " ").trim() + "\n",
      },
      "load-xml": {
        next: [],
        name: "load-xml",
        type: "llm-gpt4o",
        instruction: `
          Load the xml_feed_url's contents to xml_feed_file.
          When completed, continue to the next step.
        `.replace(/\s+/g, " ").trim() + "\n"
      },
      "describe-xml": {
        next: [],
        name: "describe-xml",
        type: "llm-gpt4o",
        instruction: `
          Describe the XML file's structure, let us know what
          properties to read to get a unique ID, title, location, hours and job
          type.
        `.replace(/\s+/g, " ").trim() + "\n",
      }
    });
  });
});
