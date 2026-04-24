import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Tải biến môi trường
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images) từ thư mục gốc
app.use(express.static(__dirname));

// Tạo Route linh hoạt map vào thư mục api (Giả lập Vercel Serverless Function)
app.use('/api/:route', async (req, res) => {
  try {
    const routeName = req.params.route;
    const filePath = path.join(__dirname, 'api', `${routeName}.js`);
    
    // Kiểm tra xem file có tồn tại không
    if (fs.existsSync(filePath)) {
      // Dynamic import cho module ES
      const module = await import(`file://${filePath}`);
      const handler = module.default;
      
      // Gọi hàm handler như Vercel làm
      if (typeof handler === 'function') {
        return handler(req, res);
      }
    }
    
    res.status(404).json({ error: 'API route not found' });
  } catch (err) {
    console.error(`API Error on Route /api/${req.params.route}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
