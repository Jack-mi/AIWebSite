# AI Website Analyzer

AI-powered website analysis platform that analyzes any website's functionality, tech stack, traffic patterns, and user experience using advanced AI models.

## Quick Start

### Prerequisites
- [Docker Desktop](https://docs.docker.com/get-docker/)

### Run the Application

```bash
# Clone and start
git clone https://github.com/Jack-mi/AIWebSite.git
cd AIWebSite
./run.sh
```

Access the application at:
- **App**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Try It Out
1. Open http://localhost:3000
2. Enter any website URL (e.g., `https://github.com`)
3. Click "Start Analysis"
4. Get AI-powered insights

## Features

- **🧠 AI Analysis**: Understand website purpose and user intentions
- **🔧 Tech Detection**: Identify frameworks, libraries, and tools
- **📊 Traffic Insights**: Analyze performance and user behavior
- **🎨 UX Evaluation**: Review design and user experience

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: FastAPI, Python, PostgreSQL
- **AI**: OpenRouter API with multiple models
- **Deployment**: Docker & Docker Compose

## Commands

```bash
# Start application
./run.sh

# View logs
make logs

# Stop services
make stop

# Run tests
make test

# Clean restart
make clean && ./run.sh
```

## Configuration

The app comes pre-configured and ready to use. For production deployment, update the environment variables in `.env`:

```env
# AI API (pre-configured for demo)
OPENROUTER_API_KEY=your-api-key

# Database
DATABASE_URL=postgresql://user:pass@localhost/dbname

# Optional: Authentication
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
```

## API Usage

```bash
# Analyze a website
curl -X POST http://localhost:8000/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Get analysis results
curl http://localhost:8000/api/v1/analysis/analyze/{analysis_id}
```

## Deployment

### Development
```bash
./run.sh  # Local development with Docker
```

### Production
- **Vercel/Netlify**: Frontend deployment
- **Railway/Render**: Backend + database
- **AWS/GCP**: Full infrastructure

## Troubleshooting

**Port conflicts?**
```bash
# Check what's using ports
lsof -i :3000,8000,5432

# Kill processes if needed
./run.sh  # Will handle port cleanup
```

**Services not starting?**
```bash
# Check Docker
docker info

# View detailed logs
docker-compose logs -f

# Reset everything
make clean && ./run.sh
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.