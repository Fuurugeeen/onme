# CLAUDE.md - OnMe Project Guidelines

## Project Overview

**OnMe** is an AI coaching service for students who struggle with time management due to social media and short-form video content. The service provides personalized coaching through AI conversation, helping users understand their strengths, weaknesses, and personal characteristics in a judgment-free environment.

### Core Philosophy
- **No comparisons** - Never compare users with others; only compare with their past self
- **Safe space** - A refuge from SNS comparison culture
- **Personalized AI** - The AI learns each user's "thinking patterns" and adapts coaching accordingly
- **Small, achievable tasks** - Tasks are designed to be "failure-proof" (e.g., "look at 10 English words" instead of "study English for 30 minutes")

## Technology Stack

### Frontend (`frontend/`)
| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui patterns |
| State (Server) | TanStack Query (React Query) |
| State (Client) | Zustand |
| HTTP Client | Axios |
| Auth | Firebase Auth SDK |
| Testing | Vitest + Testing Library |

### Backend (`backend/`)
| Category | Technology |
|----------|------------|
| Framework | FastAPI |
| Language | Python 3.11+ |
| ORM | SQLAlchemy 2.x (async) |
| DB Driver | asyncpg |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| AI | google-generativeai (Gemini API) |
| Auth Verification | firebase-admin |

### Infrastructure
| Category | Technology |
|----------|------------|
| Database | PostgreSQL (Cloud SQL in prod, Docker locally) |
| Deployment | Cloud Run |
| CI/CD | GitHub Actions |

## Directory Structure

```
onme/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # React components
│   │   │   ├── chat/        # Chat-related components
│   │   │   ├── goal/        # Goal-related components
│   │   │   ├── home/        # Home page components
│   │   │   ├── layouts/     # Layout components
│   │   │   └── ui/          # Reusable UI components (shadcn-style)
│   │   ├── lib/             # Utilities (axios, firebase, utils)
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand stores
│   │   ├── test/            # Test setup
│   │   └── types/           # TypeScript type definitions
│   ├── .eslintrc.cjs        # ESLint config
│   ├── .prettierrc          # Prettier config
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI route handlers
│   │   ├── core/            # Config, database, auth
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic services
│   ├── alembic/             # Database migrations
│   ├── pyproject.toml       # Ruff config + pytest config
│   └── requirements.txt
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD pipelines
├── docker-compose.yml        # Local development
└── Makefile                  # Development commands
```

## Code Conventions

### Frontend Conventions

#### Formatting (Prettier)
- No semicolons
- Single quotes
- 2-space indentation
- Trailing commas (ES5 style)
- 100 character line width

#### Component Patterns
- Use `forwardRef` for UI components that need ref forwarding
- Use `class-variance-authority` (cva) for component variants
- Use `cn()` utility (clsx + tailwind-merge) for className composition
- Components use named exports (except default App export)

```tsx
// Example UI component pattern
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('base-classes', {
  variants: { variant: {...}, size: {...} },
  defaultVariants: { variant: 'default', size: 'default' },
})

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
)
```

#### State Management
- **Zustand** for client state (auth, UI state)
- **TanStack Query** for server state (API data)

#### Path Aliases
- `@/` maps to `src/` (configured in vite/tsconfig)

#### Testing
- Use Vitest with Testing Library
- Test files: `*.test.tsx` alongside components
- Use `vi.fn()` for mocks, `userEvent` for interactions

### Backend Conventions

#### Formatting (Ruff)
- Line length: 88 characters
- Double quotes
- Space indentation
- isort-style import sorting

#### Architecture Pattern
```
API Route → Service → Model/Schema
```

- **Routes** (`app/api/`): Handle HTTP, call services
- **Services** (`app/services/`): Business logic, database operations
- **Models** (`app/models/`): SQLAlchemy ORM definitions
- **Schemas** (`app/schemas/`): Pydantic request/response models

#### Service Pattern
```python
class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
```

#### Route Pattern
```python
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_service = UserService(db)
    return await user_service.get_by_firebase_uid(current_user["uid"])
```

#### Type Hints
- Use `|` for union types (Python 3.10+): `str | None`
- Use `from_attributes = True` in Pydantic Config for ORM compatibility

## Development Workflow

### Quick Start
```bash
# 1. Start shared database
make infra

# 2. Start both frontend and backend
make app

# 3. View status
make status
```

### Available Make Commands

| Command | Description |
|---------|-------------|
| `make infra` | Start shared PostgreSQL database |
| `make app` | Start frontend + backend (auto port assignment) |
| `make backend` | Start backend only |
| `make frontend` | Start frontend only |
| `make app-down` | Stop app for current worktree |
| `make status` | Show all running instances |
| `make logs` | View all service logs |
| `make logs-backend` | View backend logs |
| `make logs-frontend` | View frontend logs |
| `make shell-backend` | Shell into backend container |
| `make shell-db` | PostgreSQL shell |
| `make migrate` | Run Alembic migrations |
| `make lint` | Run ruff check (backend) |
| `make lint-fix` | Run ruff check --fix |
| `make format` | Run ruff format |
| `make format-check` | Check ruff format |
| `make clean` | Stop current worktree app |
| `make clean-all` | Stop everything, remove volumes |

### Port Assignment
- Backend: 8080-8099 (auto-assigned)
- Frontend: 5173-5199 (auto-assigned)
- PostgreSQL: 5432 (fixed)

### Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/onme
GEMINI_API_KEY=your-key
FIREBASE_PROJECT_ID=your-project
GOOGLE_APPLICATION_CREDENTIALS=./firebase-adminsdk.json
SECRET_KEY=your-secret
ENVIRONMENT=development
MOCK_MODE=true  # Bypass external services
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:8080
VITE_MOCK_MODE=true  # Use mock auth
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

### Mock Mode
Both frontend and backend support `MOCK_MODE=true` to bypass Firebase auth and external services during development.

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)

**Frontend checks:**
1. `npm ci` - Install dependencies
2. `npm run lint` - ESLint
3. `npm run format:check` - Prettier
4. `npm run test:run` - Vitest
5. `npm run build` - TypeScript + Vite build

**Backend checks:**
1. `pip install -r requirements.txt`
2. `ruff check .` - Linting
3. `ruff format --check .` - Format check
4. `pytest -v` - Tests

### Pre-commit Hook
Runs `lint-staged` on frontend files:
- `.ts, .tsx` → ESLint fix + Prettier
- `.css, .json, .md` → Prettier

## Key Files to Know

### Configuration
- `frontend/vite.config.ts` - Vite configuration
- `frontend/tailwind.config.js` - Tailwind setup
- `frontend/tsconfig.json` - TypeScript config
- `backend/pyproject.toml` - Ruff + pytest config
- `backend/alembic.ini` - Alembic config

### Entry Points
- `frontend/src/main.tsx` - React app entry
- `frontend/src/App.tsx` - Root component with routing
- `backend/app/main.py` - FastAPI app entry

### Core Services
- `backend/app/services/gemini_service.py` - AI integration
- `backend/app/services/user_service.py` - User management
- `backend/app/services/conversation_service.py` - Chat logic
- `backend/app/core/auth.py` - Firebase auth verification

### State Management
- `frontend/src/stores/auth.ts` - Auth state (Zustand)
- `frontend/src/stores/conversation.ts` - Chat state
- `frontend/src/stores/goal.ts` - Goal state

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync Firebase user with DB |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update user profile |
| POST | `/api/conversation` | Start new conversation |
| POST | `/api/conversation/{id}/messages` | Send message |
| GET | `/api/tasks/today` | Get today's tasks |
| POST | `/api/tasks` | Create task |
| GET | `/health` | Health check |

## Database Models

### Core Models
- **User** - Firebase-linked user account
- **UserProfile** - Personality/behavior profile (JSON fields for thinking_style, motivation_drivers, etc.)
- **Conversation** - Chat sessions (onboarding, daily, reflection)
- **DailyTask** - Small, achievable daily tasks
- **CoachingInsight** - AI-learned coaching patterns

## AI Assistant Guidelines

### When Making Changes

1. **Run linting before committing:**
   ```bash
   # Backend
   cd backend && ruff check . && ruff format .

   # Frontend
   cd frontend && npm run lint && npm run format
   ```

2. **Follow existing patterns:**
   - Create services for business logic, not in routes
   - Use Pydantic schemas for API I/O
   - Use cva + cn() for styled components
   - Use Zustand for client state, TanStack Query for server state

3. **Test your changes:**
   ```bash
   # Frontend
   cd frontend && npm run test:run

   # Backend
   cd backend && pytest -v
   ```

4. **Database migrations:**
   ```bash
   cd backend
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

### Common Gotchas

1. **Async everywhere in backend** - Use `async/await` consistently; SQLAlchemy sessions are async
2. **Firebase UID as foreign key** - Users are identified by `firebase_uid`, not internal `id`
3. **Mock mode for dev** - Set `MOCK_MODE=true` to skip Firebase auth locally
4. **Path aliases** - Use `@/` prefix for imports in frontend
5. **Docker network** - Frontend/backend communicate via `onme-shared-network`

### Language Notes
- Code comments and variable names: English
- UI text and prompts: Japanese (学生向けAIコーチング)
- Documentation: Mixed (README in Japanese, code docs in English)

### Project Philosophy
When implementing features, remember:
- Never compare users with others
- Keep tasks small and "failure-proof"
- AI should be friendly and non-judgmental (フラットで親しみやすい)
- 5-minute daily interaction is the target
- Focus on self-understanding, not productivity metrics
