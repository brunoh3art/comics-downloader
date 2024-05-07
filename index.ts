import { parseArgs, type ParseArgsConfig } from "node:util";
import { Pattern, match } from "ts-pattern";

import { comicsDownloader } from "./run/run-dex";
import { $ } from "bun";

const options: Pick<ParseArgsConfig, "options">["options"] = {
  url: {
    type: "string",
    short: "u",
  },
  help: {
    type: "boolean",
    short: "h",
  },
  version: {
    type: "boolean",
    short: "v",
  },
};
const { values } = parseArgs({
  args: Bun.argv,
  options,
  strict: true,
  allowPositionals: true,
});

match(values)
  .with({ url: Pattern.string }, async ({ url }) => {
    // regex get the uuid from the url
    const regex = /\/(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/g;
    const uuid = regex.exec(url)?.[1] as string;
    if (!uuid) {
      console.log("Invalid url");
      return;
    }

    await comicsDownloader({ mangaId: uuid });
  })
  .with({ help: true }, async () => {
    await $`echo "Help: Comics Downloader
    
     Use: -u, --url <url>: The url of the manga.
     Use: -h, --help: Show this help message.
     Use: -v, --version: Show the version.
    "`;
  })
  .with({ version: true }, async () => {
    const { version } = await import("./package.json");

    await $`echo "Version: ${version}"`;
  })
  .otherwise(async () => {
    await $`echo "Usage: index -u <url>"`;
  });
