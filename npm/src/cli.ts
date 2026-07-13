#!/usr/bin/env node
import { capture, crawl } from "./capture";
import { slugFromUrl } from "./models";

const HELP = `WebForge — capture a website's visual blueprint for AI coding agents.

Usage:
  webforge <url> [options]

Options:
  -o, --output <path>   Output ZIP path (default: WebForge_<domain>.zip)
  --desktop             Desktop viewport only (skip tablet/mobile)
  --png                 Save PNG instead of JPEG
  --crawl               Crawl the whole domain
  --max <n>             Max pages when crawling (default 5)
  --no-headless         Run with a visible browser window
  --timeout <seconds>   Navigation timeout (default 15)
  -h, --help            Show this help
  -v, --version         Show version

Examples:
  webforge anthropic.com
  webforge example.com -o out.zip --desktop
  webforge example.com --crawl --max 10
`;

function parseArgs(argv: string[]) {
  const args: {
    url?: string;
    output?: string;
    desktop?: boolean;
    png?: boolean;
    crawl?: boolean;
    max?: number;
    headless?: boolean;
    timeout?: number;
    help?: boolean;
    version?: boolean;
  } = { headless: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-o":
      case "--output":
        args.output = argv[++i];
        break;
      case "--desktop":
        args.desktop = true;
        break;
      case "--png":
        args.png = true;
        break;
      case "--crawl":
        args.crawl = true;
        break;
      case "--max":
        args.max = parseInt(argv[++i], 10);
        break;
      case "--no-headless":
        args.headless = false;
        break;
      case "--timeout":
        args.timeout = parseFloat(argv[++i]);
        break;
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-v":
      case "--version":
        args.version = true;
        break;
      default:
        if (!a.startsWith("-") && !args.url) args.url = a;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.version) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("../package.json");
    console.log(`webforge ${pkg.version}`);
    return;
  }
  if (args.help || !args.url) {
    console.log(HELP);
    process.exit(args.url ? 0 : 1);
  }

  const imageFormat = args.png ? "png" : "jpeg";
  const out =
    args.output ?? `WebForge_${slugFromUrl(`https://${args.url}`)}.zip`;

  try {
    if (args.crawl) {
      console.error(`Crawling ${args.url} …`);
      const site = await crawl(args.url!, {
        maxPages: args.max ?? 5,
        imageFormat,
        headless: args.headless,
        timeout: args.timeout,
      });
      await site.toZip(out);
      console.error(`✓ ${site.pages.length} page(s) → ${out}`);
    } else {
      console.error(`Capturing ${args.url} …`);
      const result = await capture(args.url!, {
        mode: args.desktop ? "desktop" : "all",
        imageFormat,
        headless: args.headless,
        timeout: args.timeout,
      });
      await result.toZip(out);
      console.error(`✓ ${result.title} → ${out}`);
    }
  } catch (err) {
    console.error(`\n✗ ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
