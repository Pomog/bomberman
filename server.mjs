import * as http from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createReadStream, ReadStream } from "node:fs";
const __framework = "/framework"
const __dirname = dirname(fileURLToPath(import.meta.url));
const UIDir = join(__dirname, "frontend");
const indexPage = join(UIDir, "index.html");
const server = http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request
    .on("error", (err) => {
      console.error(err);
      response.statusCode = 400;
      response.end();
    })
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();
      // BEGINNING OF NEW STUFF
      response.on("error", (err) => {
        console.error(err);
      });
      response.statusCode = 200;
      if (url.endsWith(".js")) {
        response.setHeader("Content-Type", "text/javascript; charset=utf-8");
      } else if (url.endsWith(".css")) {
        response.setHeader("Content-Type", "text/css; charset=utf-8");
      } else {
        response.setHeader("Content-Type", "text/html; charset=utf-8");
      }
      //response.setHeader('Content-Type', 'application/json');
      const responseBody = { headers, method, url, body };
      // response.write(JSON.stringify(responseBody));
      // response.end();
      let path;
      //console.log(url)
      switch (true) {
        case url === "/":
          path = indexPage;
          break
        case url.startsWith(__framework):
          path = join(__dirname, url);
          break
        default:
          path = join(UIDir, url);
          break
      }

      const pageStream = createReadStream(path);
      pageStream.pipe(response);
    });
});
let port = 8080;
server.listen(port);
console.log(`Server listening on  http://localhost:${port}...`);
