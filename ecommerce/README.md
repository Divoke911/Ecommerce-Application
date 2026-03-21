# Flipkart E-Commerce Backend

Spring Boot + MySQL + Redis e-commerce backend with JWT auth and OTP verification.

## Tech Stack
- Java 21
- Spring Boot 3.5.11
- MySQL
- Redis
- JWT (JJWT 0.12.6)
- MapStruct
- Swagger / OpenAPI

## Prerequisites
- Java 21
- Maven
- MySQL
- Redis (Docker)
- Gmail account with App Password

## Setup

### 1. Clone the project
```bash
git clone <repo-url>
cd ecommerce
```

### 2. Start Redis
```bash
docker run -d --name redis-ecommerce -p 6379:6379 redis:latest
```

### 3. Create MySQL database
```sql
CREATE DATABASE ecommerce;
```

### 4. Configure environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 5. Run the application
```bash
./mvnw spring-boot:run
```

### 6. Access Swagger UI
```
http://localhost:8080/swagger-ui.html
```

## Environment Variables

| Variable | Description |
|---|---|
| DB_URL | MySQL connection URL |
| DB_USERNAME | MySQL username |
| DB_PASSWORD | MySQL password |
| REDIS_HOST | Redis host |
| REDIS_PORT | Redis port |
| REDIS_PASSWORD | Redis password (optional) |
| MAIL_USERNAME | Gmail address |
| MAIL_PASSWORD | Gmail App Password |
| JWT_SECRET | Base64 encoded secret |
| JWT_EXPIRY_MS | Access token expiry (ms) |
| JWT_REFRESH_EXPIRY_MS | Refresh token expiry (ms) |

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/verify-email | Verify email OTP | Public |
| POST | /api/auth/resend-otp | Resend OTP | Public |
| POST | /api/auth/login | Login (sends OTP) | Public |
| POST | /api/auth/verify-login-otp | Verify login OTP | Public |
| POST | /api/auth/forgot-password | Forgot password | Public |
| POST | /api/auth/reset-password | Reset password | Public |
| POST | /api/auth/refresh | Refresh token | Public |
| POST | /api/auth/logout | Logout | Auth |

### Products
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/products | List all products | Public |
| GET | /api/products/{id} | Get product | Public |
| GET | /api/products/search | Search products | Public |
| GET | /api/products/category/{id} | By category | Public |
| POST | /api/products | Create product | SELLER |
| PUT | /api/products/{id} | Update product | SELLER |
| DELETE | /api/products/{id} | Delete product | SELLER |

### Orders
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/orders | Place order | Auth |
| GET | /api/orders | My orders | Auth |
| GET | /api/orders/{id} | Get order | Auth |
| PUT | /api/orders/{id}/cancel | Cancel order | Auth |
| GET | /api/orders/{id}/delivery | Delivery info | Auth |
| GET | /api/orders/{id}/transaction | Payment info | Auth |

### Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/admin/dashboard | Stats | ADMIN |
| GET | /api/admin/users | All users | ADMIN |
| PUT | /api/admin/users/{id}/activate | Activate user | ADMIN |
| PUT | /api/admin/users/{id}/deactivate | Deactivate user | ADMIN |
| GET | /api/admin/orders | All orders | ADMIN |
| PUT | /api/admin/orders/{id}/status | Update status | ADMIN |
| POST | /api/admin/coupons | Create coupon | ADMIN |
| GET | /api/admin/coupons | List coupons | ADMIN |