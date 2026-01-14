# InsightEye - Quick Start Guide

## 🚀 One-Click Setup & Run

### Step 1: Prerequisites
Install **Docker Desktop**:
- [Mac](https://docs.docker.com/desktop/install/mac-install/)
- [Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Linux](https://docs.docker.com/engine/install/)

### Step 2: Run InsightEye

**Option A: One Command (Recommended)**
```bash
curl -sSL https://raw.githubusercontent.com/your-repo/icai/main/run.sh | bash
```

**Option B: Clone & Run**
```bash
git clone <repository-url>
cd icai
./run.sh
```

**Option C: Alternative Methods**
```bash
# Using Make
make start

# Using npm
npm start

# Manual Docker
docker-compose up -d
```

### Step 3: Access & Test

1. **Open**: http://localhost:3000
2. **Login**: Click "Login" (demo mode)
3. **Analyze**: Enter any website URL (e.g., `https://github.com`)
4. **Wait**: AI analysis takes 30-60 seconds
5. **Explore**: View insights, tech stack, and user intent analysis

## 🎯 What You Get

- **🧠 AI Intent Analysis**: Understand what users want from any website
- **🔧 Tech Stack Detection**: See what technologies power any site
- **📊 Traffic Insights**: Get traffic estimates and source analysis
- **🎨 UX Analysis**: Evaluate navigation, content, and user experience

## ⚡ Quick Commands

```bash
# View logs
make logs

# Stop everything
make stop

# Restart
make restart

# Run tests
make test

# Clean reset
make clean
```

## 🔧 Access Points

- **Main App**: http://localhost:3000
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

## 🆘 Troubleshooting

**Not working?**
```bash
# Check Docker
docker info

# Check ports
lsof -i :3000,8000,5432,6379

# View logs
docker-compose logs

# Reset everything
make clean && ./run.sh
```

**Still stuck?** Check the full [README.md](README.md) for detailed troubleshooting.

---

**That's it! 🎉 InsightEye is now analyzing websites with AI.**