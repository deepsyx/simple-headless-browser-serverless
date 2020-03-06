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
