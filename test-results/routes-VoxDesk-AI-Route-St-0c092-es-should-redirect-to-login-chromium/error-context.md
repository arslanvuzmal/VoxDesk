# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: routes.spec.ts >> VoxDesk AI Route Structure & Authentication E2E Tests >> Unauthenticated requests to dashboard routes should redirect to login
- Location: tests\e2e\routes.spec.ts:25:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "/login"
Received string:    "http://localhost:3000/dashboard"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]:
    - text: ⚠ DEMONSTRATION DATA — every figure, company, and activity on these screens is fabricated. This dashboard is not connected to Titan-OS. See
    - code [ref=e3]: docs/audits/FINAL-PRODUCTION-VERIFICATION.md
    - text: .
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - generic [ref=e6]:
        - link "TITAN OS Enterprise AI Engine" [ref=e7] [cursor=pointer]:
          - /url: /dashboard
          - generic [ref=e11]:
            - generic [ref=e12]:
              - text: TITAN
              - generic [ref=e13]: OS
            - generic [ref=e14]: Enterprise AI Engine
        - button "Collapse Sidebar" [ref=e15]
      - navigation [ref=e18]:
        - link "Command Center" [ref=e19] [cursor=pointer]:
          - /url: /dashboard
        - link "AI Operations" [ref=e27] [cursor=pointer]:
          - /url: /dashboard/operations
        - link "Intelligence" [ref=e32] [cursor=pointer]:
          - /url: /dashboard/intelligence
        - link "Approval Center" [ref=e44] [cursor=pointer]:
          - /url: /dashboard/approvals
        - link "Knowledge Base" [ref=e49] [cursor=pointer]:
          - /url: /dashboard/knowledge
        - link "Integrations" [ref=e53] [cursor=pointer]:
          - /url: /dashboard/integrations
        - link "Audit Logs" [ref=e57] [cursor=pointer]:
          - /url: /dashboard/audit
        - link "Analytics" [ref=e62] [cursor=pointer]:
          - /url: /dashboard/analytics
        - link "Settings" [ref=e66] [cursor=pointer]:
          - /url: /dashboard/settings
      - generic [ref=e72]:
        - generic [ref=e73]: JD
        - generic [ref=e74]:
          - paragraph [ref=e75]: John Doe
          - paragraph [ref=e76]: Live Agent Worker
    - generic [ref=e78]:
      - banner [ref=e79]:
        - generic [ref=e81]:
          - textbox "Search AI agents, tasks, telemetry traces, approval queues..." [ref=e85]
          - generic [ref=e86]: ⌘K
        - generic [ref=e87]:
          - generic [ref=e88]: System Healthy
          - generic [ref=e93]: Live Demo Active
          - button "Notifications" [ref=e98]
          - button "Help & Documentation" [ref=e103]
      - main [ref=e107]:
        - generic [ref=e108]:
          - complementary [ref=e109]:
            - generic [ref=e110]:
              - link "TITAN OS Enterprise AI Engine" [ref=e111] [cursor=pointer]:
                - /url: /dashboard
                - generic [ref=e115]:
                  - generic [ref=e116]:
                    - text: TITAN
                    - generic [ref=e117]: OS
                  - generic [ref=e118]: Enterprise AI Engine
              - button "Collapse Sidebar" [ref=e119]
            - navigation [ref=e122]:
              - link "Command Center" [ref=e123] [cursor=pointer]:
                - /url: /dashboard
              - link "AI Operations" [ref=e131] [cursor=pointer]:
                - /url: /dashboard/operations
              - link "Intelligence" [ref=e136] [cursor=pointer]:
                - /url: /dashboard/intelligence
              - link "Approval Center" [ref=e148] [cursor=pointer]:
                - /url: /dashboard/approvals
              - link "Knowledge Base" [ref=e153] [cursor=pointer]:
                - /url: /dashboard/knowledge
              - link "Integrations" [ref=e157] [cursor=pointer]:
                - /url: /dashboard/integrations
              - link "Audit Logs" [ref=e161] [cursor=pointer]:
                - /url: /dashboard/audit
              - link "Analytics" [ref=e166] [cursor=pointer]:
                - /url: /dashboard/analytics
              - link "Settings" [ref=e170] [cursor=pointer]:
                - /url: /dashboard/settings
            - generic [ref=e176]:
              - generic [ref=e177]: JD
              - generic [ref=e178]:
                - paragraph [ref=e179]: John Doe
                - paragraph [ref=e180]: Live Agent Worker
          - generic [ref=e182]:
            - generic [ref=e183]:
              - generic [ref=e185]:
                - textbox "Search AI agents, tasks, telemetry traces, approval queues..." [ref=e189]
                - generic [ref=e190]: ⌘K
              - generic [ref=e191]:
                - generic [ref=e192]: System Healthy
                - generic [ref=e197]: Live Demo Active
                - button "Notifications" [ref=e202]
                - button "Help & Documentation" [ref=e207]
            - main [ref=e211]:
              - generic [ref=e212]:
                - generic [ref=e213]:
                  - generic [ref=e214]:
                    - generic [ref=e215]:
                      - heading "Command Center" [level=1] [ref=e216]
                      - generic [ref=e217]: v2.4 Live
                    - paragraph [ref=e220]: Real-time multi-agent execution telemetry and governance platform
                  - generic [ref=e221]:
                    - button "Filter" [ref=e222]
                    - button "Export Logs" [ref=e225]
                    - button "Dispatch Workflow" [ref=e229]
                - generic [ref=e233]:
                  - generic [ref=e234]:
                    - generic [ref=e236]:
                      - paragraph [ref=e237]: Active Workflow Executions
                      - heading "24" [level=3] [ref=e238]
                    - generic [ref=e242]:
                      - generic [ref=e246]: +14.2%
                      - generic [ref=e247]: vs last 7 days
                  - generic [ref=e248]:
                    - generic [ref=e250]:
                      - paragraph [ref=e251]: Pending HITL Approvals
                      - heading "7" [level=3] [ref=e252]
                    - generic [ref=e257]:
                      - generic [ref=e261]: "-2.5%"
                      - generic [ref=e262]: vs last 7 days
                  - generic [ref=e263]:
                    - generic [ref=e265]:
                      - paragraph [ref=e266]: Agent Execution Success
                      - heading "98.4%" [level=3] [ref=e267]
                    - generic [ref=e272]:
                      - generic [ref=e276]: +1.1%
                      - generic [ref=e277]: vs last 7 days
                  - generic [ref=e278]:
                    - generic [ref=e280]:
                      - paragraph [ref=e281]: Active LangGraph Nodes
                      - heading "5" [level=3] [ref=e282]
                    - generic [ref=e287]:
                      - generic [ref=e289]: Stable
                      - generic [ref=e290]: vs last 7 days
                - generic [ref=e291]:
                  - generic [ref=e293]:
                    - generic [ref=e294]:
                      - generic [ref=e295]:
                        - heading "AI Execution & Agent Telemetry Volume" [level=3] [ref=e296]
                        - paragraph [ref=e299]: Real-time daily agent workflow processing rate
                      - generic [ref=e300]:
                        - generic [ref=e301]: Executions
                        - generic [ref=e303]: Active Agents
                    - img [ref=e308]:
                      - generic [ref=e312]:
                        - generic [ref=e313]: Mon
                        - generic [ref=e315]: Tue
                        - generic [ref=e317]: Wed
                        - generic [ref=e319]: Thu
                        - generic [ref=e321]: Fri
                        - generic [ref=e323]: Sat
                        - generic [ref=e325]: Sun
                      - generic [ref=e328]:
                        - generic [ref=e329]: "0"
                        - generic [ref=e331]: "400"
                        - generic [ref=e333]: "800"
                        - generic [ref=e335]: "1200"
                        - generic [ref=e337]: "1600"
                  - generic [ref=e352]:
                    - generic [ref=e353]:
                      - generic [ref=e366]:
                        - heading "Autonomous AI Insights" [level=3] [ref=e367]
                        - paragraph [ref=e368]: Predictive recommendations by TITAN Core
                      - generic [ref=e369]: 98.4% Confidence
                    - generic [ref=e372]:
                      - generic [ref=e373]:
                        - generic [ref=e374]:
                          - generic [ref=e375]: Outreach Velocity Spike
                          - generic [ref=e379]: +34% Efficiency
                        - paragraph [ref=e380]: SalesSDR agent identified 14 high-intent enterprise targets in SaaS sector with 92% match score.
                      - generic [ref=e381]:
                        - generic [ref=e382]:
                          - generic [ref=e383]: Governance Review
                          - generic [ref=e386]: 1 Action Pending
                        - paragraph [ref=e387]: FinanceBot flagged a $45,000 wire transfer exceeding standard threshold. Requires human authorization.
                    - link "View Full AI Intelligence Matrix" [ref=e389] [cursor=pointer]:
                      - /url: /dashboard/intelligence
                - generic [ref=e392]:
                  - generic [ref=e393]:
                    - generic [ref=e394]:
                      - heading "Active Agent Execution Traces" [level=3] [ref=e395]
                      - paragraph [ref=e396]: Real-time task dispatch log across multi-agent nodes
                    - link "View All Traces" [ref=e397] [cursor=pointer]:
                      - /url: /dashboard/operations
                  - table [ref=e402]:
                    - rowgroup [ref=e403]:
                      - row [ref=e404]:
                        - columnheader "Trace ID" [ref=e405]
                        - columnheader "Task Workflow" [ref=e406]
                        - columnheader "Assigned Agent" [ref=e407]
                        - columnheader "Status" [ref=e408]
                        - columnheader "Duration" [ref=e409]
                        - columnheader "Timestamp" [ref=e410]
                    - rowgroup [ref=e411]:
                      - row [ref=e412]:
                        - cell [ref=e413]:
                          - link "#demo-task-1" [ref=e414] [cursor=pointer]:
                            - /url: /dashboard/operations/demo-task-1
                        - 'cell "Qualify & Enrich Inbound Lead: Acme Corp" [ref=e415]'
                        - cell "SalesSDR" [ref=e416]
                        - cell "COMPLETED" [ref=e421]
                        - cell "1.2s" [ref=e426]
                        - cell "5 mins ago" [ref=e427]
                      - row [ref=e428]:
                        - cell [ref=e429]:
                          - link "#demo-task-2" [ref=e430] [cursor=pointer]:
                            - /url: /dashboard/operations/demo-task-2
                        - cell "Wire Transfer HITL Governance Check ($45k)" [ref=e431]
                        - cell "FinanceBot" [ref=e432]
                        - cell "PENDING APPROVAL" [ref=e437]
                        - cell "0.4s" [ref=e441]
                        - cell "12 mins ago" [ref=e442]
                      - row [ref=e443]:
                        - cell [ref=e444]:
                          - link "#demo-task-3" [ref=e445] [cursor=pointer]:
                            - /url: /dashboard/operations/demo-task-3
                        - 'cell "RAG Knowledge Indexing: 15 PDF Documents" [ref=e446]'
                        - cell "KnowledgeAssistant" [ref=e447]
                        - cell "RUNNING" [ref=e452]
                        - cell "4.8s" [ref=e457]
                        - cell "18 mins ago" [ref=e458]
                      - row [ref=e459]:
                        - cell [ref=e460]:
                          - link "#demo-task-4" [ref=e461] [cursor=pointer]:
                            - /url: /dashboard/operations/demo-task-4
                        - cell "Zero-Trust Network Intercept Diagnostics" [ref=e462]
                        - cell "SecOpsBot" [ref=e463]
                        - cell "COMPLETED" [ref=e468]
                        - cell "0.9s" [ref=e473]
                        - cell "45 mins ago" [ref=e474]
                      - row [ref=e475]:
                        - cell [ref=e476]:
                          - link "#demo-task-5" [ref=e477] [cursor=pointer]:
                            - /url: /dashboard/operations/demo-task-5
                        - cell "Weekly Revenue & Pipeline Analytics Sync" [ref=e478]
                        - cell "BIEngineer" [ref=e479]
                        - cell "FAILED" [ref=e484]
                        - cell "2.1s" [ref=e488]
                        - cell "1 hour ago" [ref=e489]
  - alert [ref=e490]
  - generic [ref=e491]: "0"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("VoxDesk AI Route Structure & Authentication E2E Tests", () => {
  4  |   test("Public routes should return HTTP 200", async ({ page }) => {
  5  |     const publicPaths = [
  6  |       "/",
  7  |       "/features",
  8  |       "/industries",
  9  |       "/architecture",
  10 |       "/demo",
  11 |       "/demo/story",
  12 |       "/docs",
  13 |       "/status",
  14 |       "/privacy",
  15 |       "/terms",
  16 |       "/login",
  17 |     ];
  18 | 
  19 |     for (const path of publicPaths) {
  20 |       const response = await page.goto(path);
  21 |       expect(response?.status()).toBe(200);
  22 |     }
  23 |   });
  24 | 
  25 |   test("Unauthenticated requests to dashboard routes should redirect to login", async ({
  26 |     page,
  27 |   }) => {
  28 |     const dashboardPaths = [
  29 |       "/dashboard",
  30 |       "/dashboard/live",
  31 |       "/dashboard/calls",
  32 |       "/dashboard/appointments",
  33 |       "/dashboard/leads",
  34 |       "/dashboard/agents",
  35 |       "/dashboard/knowledge",
  36 |       "/dashboard/escalations",
  37 |       "/dashboard/analytics",
  38 |       "/dashboard/providers",
  39 |       "/dashboard/phone-numbers",
  40 |       "/dashboard/integrations",
  41 |       "/dashboard/team",
  42 |       "/dashboard/audit",
  43 |       "/dashboard/settings",
  44 |     ];
  45 | 
  46 |     for (const path of dashboardPaths) {
  47 |       await page.goto(path);
> 48 |       expect(page.url()).toContain("/login");
     |                          ^ Error: expect(received).toContain(expected) // indexOf
  49 |     }
  50 |   });
  51 | 
  52 |   test("Unknown routes should return 404 and render custom not-found page", async ({
  53 |     page,
  54 |   }) => {
  55 |     const response = await page.goto("/this-route-does-not-exist");
  56 |     expect(response?.status()).toBe(404);
  57 |     await expect(page.locator("h1")).toContainText("Page not found");
  58 |   });
  59 | });
  60 | 
```