import { Configuration, OpenAIApi } from "openai";

let cached = global.openai;

export default async function connect() {
    if (!cached)
        cached = new OpenAIApi(
            new Configuration({ apiKey: config.OPENAI_KEY })
        );
    return cached;
}
