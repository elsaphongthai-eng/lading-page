import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function runTests() {
  console.log("Connecting to MCP Server via SSE...");
  const transport = new SSEClientTransport(new URL("http://127.0.0.1:3001/sse"));
  const client = new Client({ name: "test-client", version: "1.0.0" }, { capabilities: {} });
  
  await client.connect(transport);
  console.log("Connected successfully!");

  console.log("\n--- Testing get_daily_sales_summary ---");
  try {
    const res1 = await client.callTool({
      name: "get_daily_sales_summary",
      arguments: {}
    });
    console.log(JSON.stringify(res1.content, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }

  console.log("\n--- Testing lookup_customer_status ---");
  try {
    // Tìm kiếm với từ khóa random để xem nó báo "Không tìm thấy"
    const res2 = await client.callTool({
      name: "lookup_customer_status",
      arguments: { search_term: "nonexistent@gmail.com" }
    });
    console.log("Result (non-existent):", JSON.stringify(res2.content, null, 2));

    // Tìm kiếm với từ khóa trống hoặc thử 1 từ khóa khác
    const res3 = await client.callTool({
      name: "lookup_customer_status",
      arguments: { search_term: "phuong" }
    });
    console.log("Result (phuong):", JSON.stringify(res3.content, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }

  console.log("\n--- Testing manually_approve_order ---");
  try {
    const res4 = await client.callTool({
      name: "manually_approve_order",
      arguments: { order_code: "TEST_MCP_123" }
    });
    console.log(JSON.stringify(res4.content, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }

  console.log("\nTests complete. Exiting...");
  process.exit(0);
}

runTests().catch(e => {
  console.error("Fatal error:", e);
  process.exit(1);
});
