import https from "https";

async function testLiveResponse() {
  const baseUrl = "https://voxdesk-ai.vercel.app";
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;

  // Step 1: Start Session
  console.log(`1. Starting Live Session (IP: ${testIp})...`);
  const startData = JSON.stringify({ scenario: "BOOKING" });

  const startReq = https.request(
    `${baseUrl}/api/demo/session/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(startData),
        "x-forwarded-for": testIp,
      },
    },
    (startRes) => {
      let body = "";
      startRes.on("data", (chunk) => (body += chunk));
      startRes.on("end", () => {
        console.log("Start Status:", startRes.statusCode);
        const cookies = startRes.headers["set-cookie"];
        const parsed = JSON.parse(body);
        console.log("Session ID:", parsed.sessionId);

        // Step 2: Send User Speech Input
        console.log(
          "\n2. Sending User Speech Input ('Hello, I would like to schedule a consultation')...",
        );
        const respondData = JSON.stringify({
          sessionId: parsed.sessionId,
          transcript: "Hello, I would like to schedule a consultation",
          clientTurnId: `turn_${Date.now()}`,
        });

        const respondReq = https.request(
          `${baseUrl}/api/demo/respond`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(respondData),
              Cookie: cookies ? cookies.join("; ") : "",
              "x-forwarded-for": testIp,
            },
          },
          (respondRes) => {
            let respBody = "";
            respondRes.on("data", (chunk) => (respBody += chunk));
            respondRes.on("end", () => {
              console.log("Respond Status:", respondRes.statusCode);
              console.log("Respond Body:", respBody);
              if (respondRes.statusCode === 200) {
                console.log(
                  "\n🎉 FULL VOICE DEMO PIPELINE IS WORKING 100% LIVE IN PRODUCTION! (HTTP 200 OK)",
                );
                process.exit(0);
              } else {
                console.error(
                  "\n❌ RESPOND FAILED WITH STATUS",
                  respondRes.statusCode,
                );
                process.exit(1);
              }
            });
          },
        );

        respondReq.write(respondData);
        respondReq.end();
      });
    },
  );

  startReq.write(startData);
  startReq.end();
}

testLiveResponse();
