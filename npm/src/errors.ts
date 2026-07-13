/** Base class for every WebForge error. */
export class WebForgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** The given URL was empty or not http(s). */
export class InvalidURLError extends WebForgeError {}

/** Chromium could not be launched (Puppeteer browser missing). */
export class BrowserNotInstalledError extends WebForgeError {}

/** Navigation, render, or screenshot failed. */
export class CaptureError extends WebForgeError {}
