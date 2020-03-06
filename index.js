"use strict";

const chromium = require("chrome-aws-lambda");

const DEFAULT_OPTIONS = {
  viewport: {
    width: 1920,
    height: 1080
  },
  format: "pdf"
};

module.exports.main = async (event, context, callback) => {
  let result = null;
  let browser = null;

  const options = {
    ...DEFAULT_OPTIONS,
    ...JSON.parse(Buffer.from(event.body, "base64").toString())
  };

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args.concat([
        "--allow-file-access-from-files",
        "--enable-local-file-accesses",
        `--window-size=${options.viewport.width}x${options.viewport.height}`,
        "--font-render-hinting=none"
      ]),
      defaultViewport: options.viewport,
      executablePath: await chromium.executablePath,
      headless: true
    });

    let page = await browser.newPage();
    await page.emulateMedia("screen");

    const url = options.html ? `data:text/html,${options.html}` : options.url;

    await page.goto(url, {
      waitUntil: "networkidle0"
    });

    if (options.format === "png") {
      result = await page.screenshot({
        encoding: "base64"
      });
    } else if (options.format === "pdf") {
      result = Buffer.from(await page.pdf()).toString("base64");
    } else {
      throw new Error("Invalid format specified.");
    }

    await browser.close();
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    callback(null, {
      statusCode: 500,
      body: error
    });
    return;
  }

  const contentType =
    options.format === "png" ? "image/png" : "application/pdf";

  callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: result,
    isBase64Encoded: true
  });
};
