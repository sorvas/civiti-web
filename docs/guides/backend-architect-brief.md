# Backend Architect Brief - Civica Platform

## Mission Statement

As the backend-architect agent, your mission is to analyze the existing Civica frontend application (Angular with mock services) and design a comprehensive backend architecture using .NET 9 Minimal API, Supabase Auth, and PostgreSQL on Railway. You will create a detailed implementation plan for the csharp-expert agent to build a backend that seamlessly integrates with the existing frontend.

## Critical Prerequisites

**MANDATORY**: Before starting your analysis, you MUST:
1. Read `CLAUDE.md` for complete project context
2. Review `docs/project/Implementation.md` for mandatory implementation standards
3. Study `docs/design/ux.md` for user journey specifications
4. Examine the frontend codebase structure and mock services

## Project Context

### Application Overview
**Civica** is a civic engagement platform for Romanian citizens to collectively pressure local authorities through coordinated email campaigns. The frontend is feature-complete with mock services and ready for backend integration.

### Existing Frontend Features (Currently Mocked)
- User Registration System (Google OAuth and email/password)
- Issue Creation Workflow (multi-step wizard)
- AI-Enhanced Descriptions for issue text generation
- Gamification System (points, badges, achievements)
- Admin Approval Interface for issue moderation
- Email campaign tracking
- User profiles and dashboards

### Technical Stack
```
Frontend: Angular + NG-ZORRO + NgRx (READY)
Auth: Supabase Auth (auth only)
Backend: .NET 9 Minimal API (TO BE BUILT)
Database: PostgreSQL on Railway
Deployment: Railway (from GitHub)
```

## Analysis Requirements

### 1. Frontend Service Analysis

Analyze each Angular service in the `src/app/services/` directory:

```typescript
// Example structure to analyze:
- auth.service.ts (login, register, OAuth flows)
- issue.service.ts (CRUD operations for civic issues)
- user.service.ts (profile management, gamification)
- admin.service.ts (approval workflows)
- email-campaign.service.ts (tracking email sends)
- ai.service.ts (AI description generation - external API)
```

For each service, document:
- **Service Name & Purpose**
- **Mock Data Structure** (interfaces/types)
- **Methods & Operations** (with parameters and return types)
- **Business Logic** embedded in the service
- **State Management** interactions (NgRx)
- **Error Scenarios** currently handled

### 2. Data Model Extraction

From the mock data, extract and design:

#### Core Entities
```csharp
// Expected entities based on Civica features:
- User (with gamification properties)
- Issue (civic problems reported by users)
- EmailCampaign (tracking coordinated emails)
- Achievement (gamification badges)
- AdminAction (approval/rejection logs)
- Authority (local authorities receiving emails)
```

#### Relationships
- User -> Issues (one-to-many)
- Issue -> EmailCampaigns (one-to-many)
- User -> Achievements (many-to-many)
- Issue -> AdminActions (one-to-many)

### 3. API Endpoint Design

Design RESTful endpoints matching Angular service calls:

```http
# Authentication (Supabase integrated)
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

# Issues
GET    /api/issues?status={pending|approved|rejected}&page={n}&size={n}
POST   /api/issues
GET    /api/issues/{id}
PUT    /api/issues/{id}
DELETE /api/issues/{id}

# Email Campaigns
POST   /api/issues/{id}/email-sent
GET    /api/issues/{id}/email-stats

# User Management
GET    /api/user/profile
PUT    /api/user/profile
GET    /api/user/achievements
POST   /api/user/achievements/{id}/claim

# Admin Operations
GET    /api/admin/pending-issues
PUT    /api/admin/issues/{id}/approve
PUT    /api/admin/issues/{id}/reject
GET    /api/admin/statistics

# AI Integration (proxy)
POST   /api/ai/enhance-description
```

### 4. Architecture Decisions

Document key architectural decisions:

#### Authentication Strategy
- Supabase JWT validation middleware
- Role-based authorization (User, Admin)
- Secure token refresh mechanism

#### Database Design
- PostgreSQL with Entity Framework Core
- Migration strategy for schema evolution
- Indexing strategy for performance
- Romanian text support (UTF-8)

#### API Patterns
```csharp
// Minimal API pattern with dependency injection
app.MapPost("/api/issues", 
    [Authorize] async (CreateIssueDto dto, IIssueService service) =>
    {
        var result = await service.CreateAsync(dto);
        return Results.Created($"/api/issues/{result.Id}", result);
    })
    .WithName("CreateIssue")
    .WithOpenApi()
    .RequireAuthorization();
```

#### Error Handling
- Global exception middleware
- Standardized error responses
- Logging strategy (structured logging)
- Romanian error messages

### 5. Integration Points

#### Supabase Auth Integration
```csharp
// Configuration needed
- JWT validation setup
- User sync strategy
- Role management
- OAuth provider configuration
```

#### External Services
- AI service for description enhancement
- Email service for notifications
- File storage for issue attachments

## Deliverables

### 1. Database Schema
```sql
-- Complete PostgreSQL schema with:
- Tables with proper data types
- Relationships and foreign keys
- Indexes for performance
- Constraints and validations
- Initial seed data
```

### 2. API Specification
```yaml
# OpenAPI 3.0 specification including:
- All endpoints with request/response schemas
- Authentication requirements
- Validation rules
- Error responses
- Example payloads
```

### 3. Implementation Roadmap

#### Phase 1: Foundation (Week 1)
- [ ] Project setup and configuration
- [ ] Supabase Auth integration
- [ ] Database context and migrations
- [ ] Core entity models
- [ ] Basic CRUD endpoints

#### Phase 2: Core Features (Week 2)
- [ ] Issue management system
- [ ] User profile and gamification
- [ ] Admin approval workflow
- [ ] Email campaign tracking

#### Phase 3: Integration (Week 3)
- [ ] Frontend integration testing
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Railway deployment setup

### 4. Service Layer Design
```csharp
// Service interfaces and implementations
public interface IIssueService
{
    Task<PagedResult<IssueDto>> GetAllAsync(IssueFilter filter);
    Task<IssueDto> GetByIdAsync(Guid id);
    Task<IssueDto> CreateAsync(CreateIssueDto dto, Guid userId);
    Task<IssueDto> UpdateAsync(Guid id, UpdateIssueDto dto);
    Task DeleteAsync(Guid id);
    Task<EmailStatsDto> TrackEmailSentAsync(Guid issueId, Guid userId);
}
```

### 5. Configuration Requirements
```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=...;Database=civica;Username=...;Password=..."
  },
  "Supabase": {
    "Url": "https://xxx.supabase.co",
    "AnonKey": "xxx",
    "ServiceKey": "xxx"
  },
  "Railway": {
    "Environment": "production"
  }
}
```

## Critical Considerations

### Security
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- Rate limiting
- CORS configuration for Angular app

### Performance
- Pagination for all list endpoints
- Eager loading strategies
- Caching where appropriate
- Database query optimization
- Response compression

### Maintainability
- Clean architecture principles
- SOLID principles
- Comprehensive XML documentation
- Consistent naming conventions
- No unit tests (as specified)

## Documentation Requirements

As backend-architect, you must create/update:
1. `docs/api/api-design.md` - Complete API specification
2. `docs/api/database-schema.md` - Database design documentation
3. `docs/technical/backend-architecture.md` - Architecture decisions
4. `docs/api/integration-guide.md` - Frontend integration guide
5. Update `Implementation.md` with architectural decisions

## Success Criteria

Your architecture is successful when:
1. All frontend mock services have corresponding real endpoints
2. Database schema supports all current and anticipated features
3. API design is RESTful and consistent
4. Integration plan is clear and actionable
5. csharp-expert can implement without ambiguity
6. Performance considerations are addressed
7. Security is built-in, not bolted-on
8. Documentation is comprehensive

## Next Steps

1. **Analyze** the frontend application thoroughly
2. **Extract** all data models from mock services
3. **Design** the complete backend architecture
4. **Document** all decisions and rationale
5. **Create** actionable tasks for csharp-expert
6. **Validate** that your design supports all frontend features

Remember: The frontend is ready and waiting. Your architecture must serve it perfectly while allowing for future growth. The csharp-expert depends on your clear, detailed plan to build a backend that seamlessly replaces the mock services.