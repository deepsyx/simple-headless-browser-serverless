![logo](https://github.com/deepsyx/simple-headless-browser-serverless/blob/master/examples/logo.png?raw=true)

The goal of this repo is to provide a basic example of how to get headless browser running on AWS at scale. 

How it works
===
AWS Lambda lets you run code without provisioning or managing servers. You pay only for the compute time you consume. Basically, you set the required hardware parameters of your code and upload the bundle to AWS and they handle the rest. Let's say one HTML to PDF takes 2 seconds to complete while using 100% CPU. If we upload our code to a single-core instance, we'll be limited to 1 render per 2 seconds and you'll be still paying for the instance time while idle. However, with AWS lambda you can run your code unlimited times simultaneously and it'll be executed in parallel. We'll be using the serverless framework to deploy our bundle - it makes the whole process as easy as executing a single command.

"Puppeteer is a Node library that provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium."

Since AWS Lambdas is running on Amazon Linux, we'll have to use a Chrome compiled for Amazon Linux, so we  use the `chrome-aws-lambda` package which is providing the ready-to-use binaries.

How to deploy this repo
=====

Setup your [AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/) then run:

    npm install serverless -g
    git clone git@github.com:deepsyx/serverlessdemo.git
    cd ./serverlessdemo
    yarn
    serverless deploy

And few should see something like:
![deploy image](https://github.com/deepsyx/simple-headless-browser-serverless/blob/master/examples/deploy_cli.png?raw=true)

Example
=====

	const https = require("https");
	const fs = require("fs");

	const data = JSON.stringify({ url: "https://example.com", format: "png" });

	const options = {
	  hostname: "5zxn2gg42h.execute-api.us-east-1.amazonaws.com",
	  port: 443,
	  path: "/dev/",
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Content-Length": data.length
	  }
	};

	const req = https.request(options, res => {
	  const buffer = [];

	  res.on("data", d => {
	    buffer.push(d);
	  });

	  res.on("end", d => {
	    const extension = res.headers["content-type"].includes("/pdf")
	      ? "pdf"
	      : "png";

	      const fileName = `./test.${extension}`;
	    fs.writeFileSync(fileName, Buffer.concat(buffer));
	    console.log(`Wrote file: ${fileName}`);
	  });
	});

	req.on("error", error => {
	  console.error(error);
	});

	req.write(data);
	req.end();

Request properties
======

| Property      | Type          | Example | Description
| ------------- |:-------------:| -----:| -----:|
| url      		| String	    | "https://example.com" | URl to be screenshoted 
| html      		| String	| "<html><body>Hello world!</body></html>" | If we don't want to screenshot a url, we can manually provide the html
| format        | String        | "pdf" or "png"     | Specifies the output format
| viewport      | Object (optional) | viewport: { width: 1920, height: 1080 } | Specifies the browser viewport 


Last words
======

Feel free to fork this repo and extend it with your own functionally, if you find it useful. Improvement pull requests are welcome, as long as they're well formatted and prettified with `yarn prettify`.
