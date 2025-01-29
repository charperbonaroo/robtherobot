import { YamlConfig } from "../../src/workflow/YamlConfig";

describe("YamlConfig", () => {
  let config: YamlConfig;

  beforeEach(() => {
    config = new YamlConfig("robots/test-robot.yml").readSync();
  });

  it("parses a YAML config", () => {
    expect(config.name).toEqual("Test Robot");
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
      }
    });
  });

  it("parses steps", () => {
    expect(config.steps).toEqual({
      home: {
        next: ["goodbye"],
        name: "home",
        type: "llm-gpt4o",
        instruction: "Say hello",
      },
      goodbye: {
        next: [],
        name: "goodbye",
        type: "llm-gpt4o",
        instruction: "Say goodbye"
      },
    });
  });
});
