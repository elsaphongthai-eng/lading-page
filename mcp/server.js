import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc config từ file .env ở thư mục gốc
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = 3001;

// Khởi tạo MCP Server
const server = new McpServer({
  name: "cham-hanh-trinh-mcp",
  version: "1.0.0"
});

// Helper fetch từ KV Database
async function fetchFromKV(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Missing KV API Config");
  
  const res = await fetch(`${url}/lrange/${key}/0/10000`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  
  return (data.result || []).map(item => {
    if (typeof item === 'object') return item;
    try { return JSON.parse(item); } catch(e) { return null; }
  }).filter(Boolean);
}

// Tool 1: get_daily_sales_summary
server.tool(
  "get_daily_sales_summary",
  "Lấy báo cáo tổng số đơn đăng ký mới, số đơn đã thanh toán và doanh thu theo ngày",
  {
    date: z.string().optional().describe("Ngày cần lấy báo cáo (YYYY-MM-DD). Mặc định là hôm nay.")
  },
  async ({ date }) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const [orders, customers] = await Promise.all([
        fetchFromKV('orders'),
        fetchFromKV('customers')
      ]);

      const todayOrders = orders.filter(o => o.time && o.time.startsWith(targetDate) && o.status === 'paid');
      const todayCustomers = customers.filter(c => c.time && c.time.startsWith(targetDate));

      const totalRevenue = todayOrders.reduce((sum, o) => sum + (parseInt(o.amount) || 0), 0);

      const report = `Báo cáo ngày ${targetDate}:
- Số form đăng ký mới: ${todayCustomers.length}
- Số đơn đã thanh toán: ${todayOrders.length}
- Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VND`;

      return {
        content: [{ type: "text", text: report }]
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `Lỗi khi lấy báo cáo: ${e.message}` }]
      };
    }
  }
);

// Tool 2: lookup_customer_status
server.tool(
  "lookup_customer_status",
  "Tìm kiếm thông tin khách hàng và trạng thái đơn hàng qua email, tên hoặc mã đơn",
  {
    search_term: z.string().describe("Từ khóa tìm kiếm (email, tên, hoặc mã đơn CHAM...)")
  },
  async ({ search_term }) => {
    try {
      const term = search_term.toLowerCase();
      const [orders, customers] = await Promise.all([
        fetchFromKV('orders'),
        fetchFromKV('customers')
      ]);

      const foundCustomer = customers.find(c => 
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.code && c.code.toLowerCase().includes(term))
      );

      const foundOrder = orders.find(o => 
        (o.code && o.code.toLowerCase().includes(term)) ||
        (foundCustomer && o.code === foundCustomer.code)
      );

      if (!foundCustomer && !foundOrder) {
        return { content: [{ type: "text", text: `Không tìm thấy dữ liệu cho: ${search_term}` }] };
      }

      let report = `Kết quả tìm kiếm cho "${search_term}":\n`;
      if (foundCustomer) {
        report += `- Tên: ${foundCustomer.name || 'N/A'}\n`;
        report += `- Email: ${foundCustomer.email || 'N/A'}\n`;
        report += `- Số ĐT: ${foundCustomer.phone || 'N/A'}\n`;
        report += `- Mã đơn: ${foundCustomer.code || 'N/A'}\n`;
      }
      
      if (foundOrder) {
        report += `- Trạng thái thanh toán: ${foundOrder.status === 'paid' ? 'ĐÃ THANH TOÁN ✅' : 'CHƯA THANH TOÁN ⏳'}\n`;
        report += `- Số tiền: ${foundOrder.amount ? parseInt(foundOrder.amount).toLocaleString('vi-VN') + ' VND' : 'N/A'}\n`;
        report += `- Nội dung CK: ${foundOrder.content || 'N/A'}\n`;
        report += `- Thời gian ghi nhận: ${foundOrder.time ? new Date(foundOrder.time).toLocaleString('vi-VN') : 'N/A'}\n`;
      } else if (foundCustomer && foundCustomer.code) {
        report += `- Trạng thái thanh toán: CHƯA THANH TOÁN ⏳ (Chưa có log webhook)\n`;
      }

      return { content: [{ type: "text", text: report }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Lỗi khi tra cứu: ${e.message}` }] };
    }
  }
);

// Tool 3: manually_approve_order
server.tool(
  "manually_approve_order",
  "Duyệt đơn hàng thủ công bằng mã đơn, cập nhật trạng thái đã thanh toán và gửi email xác nhận",
  {
    order_code: z.string().describe("Mã đơn hàng cần duyệt (ví dụ: CHAM1234)")
  },
  async ({ order_code }) => {
    try {
      const code = order_code.toUpperCase();
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;
      if (!url || !token) throw new Error("Missing KV API Config");

      // 1. Cập nhật trạng thái
      await fetch(`${url}/set/order_${code}/paid`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Thêm vào danh sách orders
      const order = {
        code: code,
        amount: 990000,
        content: "Duyệt tay qua Telegram (MCP)",
        time: new Date().toISOString(),
        status: 'paid'
      };

      await fetch(`${url}/lpush/orders/${encodeURIComponent(JSON.stringify(order))}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Lấy email khách hàng và gửi thư
      const customers = await fetchFromKV('customers');
      const customer = customers.find(c => c.code && c.code.toUpperCase() === code);

      let emailStatus = "Không tìm thấy email khách hàng để gửi.";
      if (customer && customer.email) {
        const response = await fetch(`https://www.elsaphuong.com/api/send-order-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: customer.email,
            name: customer.name,
            code: code,
            amount: order.amount,
            product: 'Chạm Hành Trình Vươn Mình Rực Rỡ'
          })
        });
        
        if (response.ok) {
          emailStatus = `Đã gửi email xác nhận thành công tới ${customer.email}.`;
        } else {
          emailStatus = `Lỗi gửi email: HTTP ${response.status}.`;
        }
      }

      return { 
        content: [{ 
          type: "text", 
          text: `Duyệt đơn ${code} THÀNH CÔNG ✅\n- Trạng thái: Đã cập nhật database.\n- Trạng thái Email: ${emailStatus}` 
        }] 
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Lỗi duyệt đơn: ${e.message}` }] };
    }
  }
);

let transport;

// Route 1: Khởi tạo kết nối SSE
app.get("/sse", async (req, res) => {
  console.log("Client connected via SSE");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
  
  res.on("close", () => {
    console.log("Client disconnected");
    transport = undefined;
  });
});

// Route 2: Nhận tin nhắn (lệnh) từ client
app.post("/message", async (req, res) => {
  if (!transport) {
    return res.status(400).send("No active SSE transport");
  }
  await transport.handlePostMessage(req, res);
});

// Start Server
app.listen(port, "127.0.0.1", () => {
  console.log(`🚀 MCP Server đang chạy tại http://127.0.0.1:${port}`);
  console.log(`📡 SSE Endpoint: http://127.0.0.1:${port}/sse`);
  console.log(`Database (KV) URL is ${process.env.KV_REST_API_URL ? 'CONFIGURED' : 'MISSING'}`);
});
