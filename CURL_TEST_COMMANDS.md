# RESTful API curl 测试命令

## 前提条件
确保服务器正在运行：`node server.js`

## 获取 userId 的方法

### 方法1: 通过网页注册
1. 访问 `http://localhost:3000/register`
2. 注册一个新账户
3. 打开浏览器开发者工具（F12）> Application > Cookies
4. 或者查看 Network 标签中的请求

### 方法2: 通过 MongoDB 查询
```bash
# 连接到 MongoDB
mongosh "mongodb+srv://hang:Zyh2004125@cluster0.6xj1snn.mongodb.net/restaurant_booking"

# 查找用户
db.users.find().pretty()

# 复制 _id 字段作为 userId
```

---

## 完整测试流程

### 1. GET - 读取所有预约

```bash
curl -X GET http://localhost:3000/api/reservations
```

**带查询参数（可选）：**
```bash
# 按分店查询
curl -X GET "http://localhost:3000/api/reservations?branch=Ho%20Man%20Tin%20Branch"

# 按日期查询
curl -X GET "http://localhost:3000/api/reservations?date=2025-12-15"

# 按状态查询
curl -X GET "http://localhost:3000/api/reservations?status=active"

# 组合查询
curl -X GET "http://localhost:3000/api/reservations?branch=Ho%20Man%20Tin%20Branch&status=active"
```

---

### 2. POST - 创建预约

**基本命令：**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "branch": "Ho Man Tin Branch",
    "date": "2025-12-15",
    "time": "14:00",
    "adults": 2,
    "children": 1
  }'
```

**示例（替换 YOUR_USER_ID）：**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "67890abcdef1234567890123",
    "branch": "Ho Man Tin Branch",
    "date": "2025-12-15",
    "time": "14:00",
    "adults": 2,
    "children": 1
  }'
```

**成功响应示例：**
```json
{
  "_id": "新创建的预约ID",
  "userId": "...",
  "branch": "Ho Man Tin Branch",
  "date": "2025-12-15T00:00:00.000Z",
  "time": "14:00",
  "adults": 2,
  "children": 1,
  "status": "active"
}
```

**保存响应中的 `_id`，用于后续的 GET、PUT、DELETE 操作！**

---

### 3. GET - 读取单个预约

**基本命令：**
```bash
curl -X GET http://localhost:3000/api/reservations/RESERVATION_ID
```

**示例（替换 RESERVATION_ID 为步骤2返回的 _id）：**
```bash
curl -X GET http://localhost:3000/api/reservations/67890abcdef1234567890124
```

---

### 4. PUT - 更新预约

**基本命令：**
```bash
curl -X PUT http://localhost:3000/api/reservations/RESERVATION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "Mong Kok Branch",
    "time": "15:00",
    "adults": 3,
    "children": 0
  }'
```

**示例（替换 RESERVATION_ID）：**
```bash
curl -X PUT http://localhost:3000/api/reservations/67890abcdef1234567890124 \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "Mong Kok Branch",
    "time": "15:00",
    "adults": 3,
    "children": 0
  }'
```

**可以只更新部分字段：**
```bash
# 只更新时间
curl -X PUT http://localhost:3000/api/reservations/RESERVATION_ID \
  -H "Content-Type: application/json" \
  -d '{"time": "16:00"}'

# 只更新人数
curl -X PUT http://localhost:3000/api/reservations/RESERVATION_ID \
  -H "Content-Type: application/json" \
  -d '{"adults": 4, "children": 2}'
```

---

### 5. DELETE - 删除预约

**基本命令：**
```bash
curl -X DELETE http://localhost:3000/api/reservations/RESERVATION_ID
```

**示例（替换 RESERVATION_ID）：**
```bash
curl -X DELETE http://localhost:3000/api/reservations/67890abcdef1234567890124
```

**成功响应示例：**
```json
{
  "message": "Reservation deleted",
  "reservation": {
    "_id": "...",
    ...
  }
}
```

---

## 完整测试示例（一行命令）

### 1. 读取所有预约
```bash
curl -X GET http://localhost:3000/api/reservations
```

### 2. 创建预约（需要替换 YOUR_USER_ID）
```bash
curl -X POST http://localhost:3000/api/reservations -H "Content-Type: application/json" -d '{"userId":"YOUR_USER_ID","branch":"Ho Man Tin Branch","date":"2025-12-15","time":"14:00","adults":2,"children":1}'
```

### 3. 读取单个预约（需要替换 RESERVATION_ID）
```bash
curl -X GET http://localhost:3000/api/reservations/RESERVATION_ID
```

### 4. 更新预约（需要替换 RESERVATION_ID）
```bash
curl -X PUT http://localhost:3000/api/reservations/RESERVATION_ID -H "Content-Type: application/json" -d '{"branch":"Mong Kok Branch","time":"15:00","adults":3}'
```

### 5. 删除预约（需要替换 RESERVATION_ID）
```bash
curl -X DELETE http://localhost:3000/api/reservations/RESERVATION_ID
```

---

## 美化输出（使用 jq 或 python）

如果安装了 `jq`：
```bash
curl -X GET http://localhost:3000/api/reservations | jq
```

如果安装了 Python：
```bash
curl -X GET http://localhost:3000/api/reservations | python3 -m json.tool
```

---

## 测试检查清单

- [ ] GET /api/reservations - 返回预约列表
- [ ] POST /api/reservations - 成功创建预约并返回预约对象
- [ ] GET /api/reservations/:id - 返回指定预约
- [ ] PUT /api/reservations/:id - 成功更新预约
- [ ] DELETE /api/reservations/:id - 成功删除预约

---

## 常见错误

1. **404 Not Found**: 检查URL和ID是否正确
2. **400 Bad Request**: 检查JSON格式和必需参数
3. **500 Internal Server Error**: 检查服务器日志
4. **连接被拒绝**: 确保服务器正在运行

