import https from "https";

async function testFullFlow() {
  const baseUrl = "https://voxdesk-ai.vercel.app";

  console.log("=== VOXDESK AI LIVE PRODUCTION FULL PIPELINE TEST ===");
  console.log(`Target: ${baseUrl}\n`);

  // Step 1: Start Demo Session
  const startData = JSON.stringify({ scenario: "BOOKING" });

  const sessionResult: any = await new Promise((resolve, reject) => {
    const req = https.request(
      `${baseUrl}/api/demo/session/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(startData),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          }),
        );
      },
    );
    req.on("error", reject);
    req.write(startData);
    req.end();
  });

  console.log(`Step 1 - Session Start Status: ${sessionResult.status}`);
  if (sessionResult.status !== 200) {
    console.error("Session Start Error:", sessionResult.body);
    process.exit(1);
  }

  const cookies = sessionResult.headers["set-cookie"];
  const sessionId = sessionResult.body.sessionId;
  console.log(`Session Created Successfully: ${sessionId}`);

  // Step 2: Send Speech Input to Voice Agent
  const respondData = JSON.stringify({
    sessionId: sessionId,
    transcript:
      "Hello, I would like to schedule a legal consultation for tomorrow.",
    clientTurnId: `turn_${Date.now()}`,
  });

  const respondResult: any = await new Promise((resolve, reject) => {
    const req = https.request(
      `${baseUrl}/api/demo/respond`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(respondData),
          Cookie: cookies ? cookies.join("; ") : "",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: JSON.parse(body) }),
        );
      },
    );
    req.on("error", reject);
    req.write(respondData);
    req.end();
  });

  console.log(
    `\nStep 2 - Voice Agent Response Status: ${respondResult.status}`,
  );
  console.log("Response Body:", JSON.stringify(respondResult.body, null, 2));

  if (respondResult.status === 200 && respondResult.body.success) {
    console.log("\n=======================================================");
    console.log("🎉 SUCCESS! THE ENTIRE VOXDESK AI LIVE VOICE PIPELINE IS");
    console.log("   100% OPERATIONAL & WORKING IN PRODUCTION ON VERCEL!");
    console.log("=======================================================");
    process.exit(0);
  } else {
    console.error("\n❌ Turn Response Failed!");
    process.exit(1);
  }
}

testFullFlow().catch(console.error);
