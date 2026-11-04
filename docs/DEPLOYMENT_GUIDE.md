# HomeServe Technologies – Production Deployment Guide

## 1. Architecture Overview
- **Frontend**: Single Page Application built with Vite/React, deployed on **Netlify Edge CDN**.
- **Backend**: High-performance asynchronous API server built with **FastAPI**, deployed as a Web Service on **Render**.
- **Database**: Cloud-managed MySQL 8.0 instance (e.g., Aiven, PlanetScale, AWS RDS, DigitalOcean Managed MySQL).
- **Object Storage**: Cloudinary Media CDN for user avatars, verification documents, and service photos.
- **Payment Processing**: Razorpay Payment Gateway.

---

## 2. Cloud MySQL Database Setup

1. Provision a MySQL 8.0+ instance on your cloud provider (e.g. Aiven, AWS RDS, or DigitalOcean).
2. Configure SSL connection requirements (`ssl_mode=REQUIRED`).
3. Set your connection string format:
   ```env
   DATABASE_URL=mysql+pymysql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_NAME>?ssl_mode=REQUIRED
   ```
4. For local testing or environments without a live MySQL instance, SQLite is automatically supported:
   ```env
   DATABASE_URL=sqlite:///./homeserve.db
   ```

---

## 3. Render Backend Deployment

1. **Create Web Service**:
   - Push your code to GitHub.
   - Go to Render Dashboard -> **New Web Service**.
   - Select your GitHub repository.
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt && alembic upgrade head`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables on Render**:
   - `APP_ENV`: `production`
   - `DATABASE_URL`: Your Cloud MySQL connection URL
   - `SECRET_KEY`: Random 64-character hex key
   - `JWT_SECRET_KEY`: Random 64-character hex key
   - `JWT_ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
   - `REFRESH_TOKEN_EXPIRE_DAYS`: `7`
   - `CORS_ORIGINS`: Your Netlify frontend domain (e.g. `https://homeserve-tech.netlify.app`)
   - `FRONTEND_URL`: `https://homeserve-tech.netlify.app`
   - `RAZORPAY_KEY_ID`: `rzp_test_...`
   - `RAZORPAY_KEY_SECRET`: `your_razorpay_secret`
   - `RAZORPAY_WEBHOOK_SECRET`: `your_webhook_secret`
   - `CLOUDINARY_CLOUD_NAME`: `your_cloud_name`
   - `CLOUDINARY_API_KEY`: `your_api_key`
   - `CLOUDINARY_API_SECRET`: `your_api_secret`

3. **Verify Deployment**:
   - Visit `https://your-service.onrender.com/api/v1/health`
   - Visit `https://your-service.onrender.com/docs` to inspect interactive Swagger documentation.

---

## 4. Netlify Frontend Deployment

1. **Import Project into Netlify**:
   - Connect your GitHub repository.
   - Base Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `frontend/dist`

2. **Environment Variables on Netlify**:
   - `VITE_API_BASE_URL`: `https://your-service.onrender.com/api/v1`

3. **Single Page Application Routing**:
   The included `frontend/netlify.toml` automatically handles SPA routing:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
