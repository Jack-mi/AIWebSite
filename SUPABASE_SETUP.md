# InsightEye Supabase Integration

This guide explains how to migrate your InsightEye backend from local PostgreSQL to Supabase, a powerful backend-as-a-service platform.

## 🌟 Benefits of Supabase Integration

- **Managed Database**: No need to manage PostgreSQL infrastructure
- **Real-time Subscriptions**: Live updates for analysis progress
- **Built-in Authentication**: Supabase Auth with Row Level Security
- **Storage**: File storage for reports and screenshots
- **Edge Functions**: Serverless functions for custom logic
- **Automatic Backups**: Built-in database backups and point-in-time recovery
- **Global CDN**: Fast worldwide access to your data
- **Dashboard**: Web interface for database management

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **Python 3.8+**: Required for running the backend
4. **Docker**: For containerized deployment (optional)

## 🚀 Quick Setup

### Step 1: Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings > API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon/public key**
   - **service_role key** (keep this secret!)
5. Navigate to **Settings > Database**
6. Copy your **database password**

### Step 2: Configure Environment

1. Copy the environment template:
   ```bash
   cp .env.supabase.example .env
   ```

2. Edit `.env` and fill in your Supabase credentials:
   ```env
   USE_SUPABASE=true
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_DB_PASSWORD=your-database-password
   ```

### Step 3: Run Setup Script

```bash
./scripts/setup_supabase.sh
```

This script will:
- Install required dependencies
- Test your Supabase connection
- Guide you through schema setup
- Optionally migrate existing data
- Configure your environment

### Step 4: Start Your Application

```bash
# Start the backend
cd backend
python -m uvicorn app.main:app --reload

# In another terminal, start the frontend
cd frontend
npm run dev
```

## 🔧 Manual Setup (Alternative)

If you prefer manual setup or the automated script doesn't work:

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

### 3. Configure Environment

Create a `.env` file with your Supabase credentials (see Step 2 above).

### 4. Migrate Existing Data (Optional)

If you have existing data in a local PostgreSQL database:

```bash
python scripts/migrate_to_supabase.py
```

## 🚀 Running the Application

### Development Mode

Start the backend and frontend separately for development:

```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Production Mode

For production deployment:

```bash
# Backend (production server)
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (build and serve)
cd frontend
npm run build
npm start
```

### Background Services

If using Celery for background tasks, start it separately:

```bash
# Terminal 3: Start Celery worker
cd backend
celery -A app.core.celery worker --loglevel=info
```

## 🔐 Authentication

The integration supports both Auth0 and Supabase Auth:

### Supabase Auth (Recommended)

- Native integration with Row Level Security
- Built-in user management
- Social login providers
- Email verification

### Hybrid Auth (Auth0 + Supabase)

- Keep existing Auth0 setup
- Sync users to Supabase for RLS
- Gradual migration path

## 🗃️ Database Schema

The following tables are created in Supabase:

- **users** - User profiles and authentication
- **websites** - Website analysis targets
- **analyses** - Analysis results and metadata
- **technology_stacks** - Detected technologies
- **traffic_data** - Website traffic metrics
- **competitors** - Competitor relationships
- **reports** - Generated reports

### Row Level Security (RLS)

All tables have RLS policies that:
- Allow authenticated users to access data
- Restrict access based on user permissions
- Allow service role to perform admin operations

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `USE_SUPABASE` | Enable Supabase mode | Yes |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Public API key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes |
| `SUPABASE_DB_PASSWORD` | Database password | Yes |

### Advanced Configuration

```python
# app/core/config.py
class Settings(BaseSettings):
    # Supabase Configuration
    USE_SUPABASE: bool = False
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
```

## 🚀 Advanced Features

### Real-time Subscriptions

```python
from app.core.supabase_client import supabase_service

# Subscribe to analysis updates
await supabase_service.setup_realtime_subscription(
    "analyses",
    lambda payload: print(f"Analysis updated: {payload}")
)
```

### File Storage

```python
# Upload analysis reports
result = await supabase_service.upload_file(
    "reports",
    "analysis-123.pdf",
    pdf_data
)

# Get public URL
url = await supabase_service.get_file_url("reports", "analysis-123.pdf")
```

### Edge Functions

```python
# Invoke custom serverless function
result = await supabase_service.invoke_edge_function(
    "analyze-website",
    {"url": "https://example.com"}
)
```

## 🔍 Monitoring and Debugging

### Health Checks

```bash
curl http://localhost:8000/health
```

### Database Connection Test

```python
from app.core.supabase_client import check_supabase_connection

status = await check_supabase_connection()
print(status)
```

### Logs

```bash
# View backend logs
./scripts/docker_supabase.sh logs backend

# View all logs
./scripts/docker_supabase.sh logs
```

## 🔄 Migration from Local PostgreSQL

### Automatic Migration

```bash
python scripts/migrate_to_supabase.py
```

### Manual Migration

1. Export data from local PostgreSQL:
   ```bash
   pg_dump insighteye > backup.sql
   ```

2. Import to Supabase:
   ```bash
   psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" < backup.sql
   ```

### Verification

The migration script includes verification:
- Row count comparison
- Data integrity checks
- Foreign key validation

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your Supabase credentials
   - Verify database password
   - Ensure project is not paused

2. **RLS Policies Blocking Access**
   - Check user authentication
   - Verify RLS policies
   - Use service role for admin operations

3. **Migration Errors**
   - Check foreign key constraints
   - Verify data types match
   - Run schema setup first

### Debug Mode

Enable debug logging:

```env
# .env
LOG_LEVEL=DEBUG
```

### Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Project Issues](https://github.com/your-repo/issues)

## 📚 Additional Resources

- [Supabase Python Client](https://github.com/supabase/supabase-py)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 🎯 Next Steps

After successful setup:

1. **Test Your Application**: Verify all features work with Supabase
2. **Set Up Monitoring**: Configure alerts and monitoring
3. **Optimize Performance**: Review query performance and indexing
4. **Security Review**: Audit RLS policies and access controls
5. **Backup Strategy**: Configure automated backups
6. **Production Deployment**: Deploy to your hosting platform

---

**Need Help?** If you encounter issues during setup, please check the troubleshooting section or create an issue in the project repository.