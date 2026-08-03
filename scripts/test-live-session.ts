import http from "http";
import https from "https";

async function testLiveSession() {
  const baseUrl = "https://voxdesk-ai.vercel.app";
  console.log(`Testing Live Session Start against ${baseUrl}...`);

  const url = `${baseUrl}/api/demo/session/start`;
  const postData = JSON.stringify({ scenario: "BOOKING" });

  const req = https.request(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    },
    (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        console.log(`HTTP Status: ${res.statusCode}`);
        console.log("Headers:", res.headers["set-cookie"]);
        console.log("Response Body:", body);

        if (res.statusCode === 200) {
          console.log(
            "\n✅ LIVE PRODUCTION SESSION START IS WORKING PERFECTLY! (HTTP 200 OK)",
          );
          process.exit(0);
        } else {
          console.error(`\n❌ SESSION START RETURNED STATUS ${res.statusCode}`);
          process.exit(1);
        }
      });
    },
  );

  req.on("error", (err) => {
    console.error("Request Error:", err);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

testLiveSession();
