export class AIProvider {
  async generateText() {
    throw new Error("generateText() must be implemented by the provider.");
  }

  async generateJson() {
    throw new Error("generateJson() must be implemented by the provider.");
  }
}