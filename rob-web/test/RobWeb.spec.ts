import { RobWeb } from "../src";

describe("RobWeb", () => {
  it("exports KEYS", () => {
    expect(RobWeb.KEYS).toContain("cwd");
  });
});
