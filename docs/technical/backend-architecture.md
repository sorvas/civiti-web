# Civica Backend Architecture

## 🎯 Architecture Overview

The Civica backend is built with .NET 9 Minimal API architecture, designed for high performance, scalability, and maintainability. It seamlessly integrates with Supabase Auth and provides a RESTful API that replaces Angular mock services.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Angular + NG-ZORRO)                │
│                         Production Ready                         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS/REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Railway (Platform)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              .NET 9 Minimal API Application               │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   API       │  │  Business   │  │    Data     │      │  │
│  │  │ Endpoints   │  │  Services   │  │   Access    │      │  │
│  │  │             │  │             │  │             │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │                             │
                    │                             │
                    ▼                             ▼
┌─────────────────────────────┐     ┌───────────────────────────────┐
│      Supabase Auth          │     │    PostgreSQL Database        │
│                             │     │        (Railway)               │
│  • User Authentication      │     │                               │
│  • JWT Token Management     │     │  • User Profiles              │
│  • OAuth Providers          │     │  • Issues & Photos            │
│  • Session Management       │     │  • Gamification Data          │
│  • Row Level Security       │     │  • Admin Workflows            │
└─────────────────────────────┘     └───────────────────────────────┘
```

## 🏗️ Core Architecture Principles

### 1. Clean Architecture
- **Domain Layer**: Core business entities and interfaces
- **Application Layer**: Business logic and use cases  
- **Infrastructure Layer**: External concerns (database, auth, external APIs)
- **Presentation Layer**: API endpoints and request/response handling

### 2. Minimal API Pattern
- **Lightweight**: Reduced boilerplate compared to traditional MVC
- **Performance**: Faster startup and request processing
- **Simplicity**: Easy to understand and maintain
- **Flexibility**: Easy to extend and modify

### 3. Domain-Driven Design (DDD)
- **Bounded Contexts**: Clear separation between domains (User, Issues, Admin, Gamification)
- **Entities**: Rich domain models with business logic
- **Value Objects**: Immutable objects representing concepts
- **Services**: Domain services for complex business operations

### 4. CQRS (Command Query Responsibility Segregation)
- **Commands**: Operations that change state (Create, Update, Delete)
- **Queries**: Operations that read data (Get, List, Search)
- **Separation**: Different models for read vs write operations

## 📦 Project Structure Deep Dive

### Civica.Api (Main Project)

```
Civica.Api/
├── Program.cs                     # Application entry point
├── appsettings.json              # Configuration
├── appsettings.Production.json   # Production config
│
├── Endpoints/                    # Minimal API endpoints
│   ├── AuthEndpoints.cs         # Authentication routes
│   ├── IssueEndpoints.cs        # Issue CRUD operations  
│   ├── UserEndpoints.cs         # User profile management
│   ├── AdminEndpoints.cs        # Admin workflows
│   └── GamificationEndpoints.cs # Points, badges, achievements
│
├── Services/                    # Business logic layer
│   ├── Interfaces/              # Service contracts
│   │   ├── IAuthService.cs
│   │   ├── IIssueService.cs
│   │   ├── IUserService.cs
│   │   ├── IAdminService.cs
│   │   ├── IGamificationService.cs
│   │   └── ISupabaseService.cs
│   │
│   ├── AuthService.cs           # Authentication business logic
│   ├── IssueService.cs          # Issue management logic
│   ├── UserService.cs           # User profile logic
│   ├── AdminService.cs          # Admin workflow logic
│   ├── GamificationService.cs   # Points and badges logic
│   └── SupabaseService.cs       # Supabase integration
│
├── Models/                      # Data models and DTOs
│   ├── Domain/                  # Core business entities
│   │   ├── User.cs
│   │   ├── Issue.cs
│   │   ├── IssuePhoto.cs
│   │   ├── Badge.cs
│   │   ├── Achievement.cs
│   │   └── AdminAction.cs
│   │
│   ├── Requests/                # API request DTOs
│   │   ├── Auth/
│   │   │   ├── CreateUserProfileRequest.cs
│   │   │   └── UpdateUserProfileRequest.cs
│   │   ├── Issues/
│   │   │   ├── CreateIssueRequest.cs
│   │   │   ├── GetIssuesRequest.cs
│   │   │   └── TrackEmailRequest.cs
│   │   └── Admin/
│   │       ├── ApprovalDecisionRequest.cs
│   │       └── BulkApproveRequest.cs
│   │
│   └── Responses/               # API response DTOs
│       ├── Auth/
│       │   └── UserProfileResponse.cs
│       ├── Issues/
│       │   ├── IssueListResponse.cs
│       │   ├── IssueDetailResponse.cs
│       │   └── CreateIssueResponse.cs
│       └── Common/
│           ├── PagedResult.cs
│           └── ApiResponse.cs
│
├── Data/                        # Data access layer
│   ├── CivicaDbContext.cs      # EF Core context
│   ├── Configurations/          # Entity configurations
│   │   ├── UserConfiguration.cs
│   │   ├── IssueConfiguration.cs
│   │   ├── IssuePhotoConfiguration.cs
│   │   ├── BadgeConfiguration.cs
│   │   └── AchievementConfiguration.cs
│   └── Migrations/             # EF Core migrations
│       └── [Generated migrations]
│
└── Infrastructure/             # Cross-cutting concerns
    ├── Middleware/
    │   ├── ErrorHandlingMiddleware.cs
    │   ├── RequestLoggingMiddleware.cs
    │   └── RateLimitingMiddleware.cs
    │
    ├── Extensions/
    │   ├── ServiceCollectionExtensions.cs
    │   ├── WebApplicationExtensions.cs
    │   └── StringExtensions.cs
    │
    ├── Validators/
    │   ├── AuthValidators.cs
    │   ├── IssueValidators.cs
    │   └── UserValidators.cs
    │
    └── Constants/
        ├── ApiRoutes.cs
        ├── ErrorMessages.cs
        └── CacheKeys.cs
```

## 🔧 Technology Stack Analysis

### Core Framework: .NET 9
**Why .NET 9?**
- **Performance**: Best-in-class performance for web APIs
- **Memory Efficiency**: Reduced memory allocation and GC pressure
- **AOT (Ahead-of-Time) Compilation**: Faster startup times
- **Cloud Native**: Built for containerization and cloud deployment
- **Modern C#**: Latest C# 13 features for developer productivity

### Minimal APIs vs Traditional MVC
**Advantages of Minimal APIs:**
- **Less Boilerplate**: No controllers, actions, or routing attributes
- **Performance**: Faster request processing (10-15% improvement)
- **Simplicity**: Easier to understand and maintain
- **Testability**: Easy to unit test individual endpoints

**Trade-offs:**
- **Structure**: Requires discipline to maintain organization
- **Complex Logic**: May need to extract to services sooner

### Entity Framework Core 8
**Advantages:**
- **Performance**: Significant query performance improvements
- **Developer Experience**: Strong typing and LINQ support  
- **Migrations**: Database schema evolution
- **Monitoring**: Built-in query logging and metrics

**Configuration:**
- **Connection Pooling**: Optimized for high-concurrency scenarios
- **Query Splitting**: Automatic splitting of complex queries
- **Compiled Models**: AOT compilation for better performance

## 🔐 Authentication Architecture

### Supabase Integration Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Angular)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Registration  │  │      Login      │  │   API Calls     │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │                │                │
                    ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Auth                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  User Creation  │  │ JWT Generation  │  │ Token Validation │  │
│  │  Email/OAuth    │  │   & Refresh     │  │    & Claims     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     .NET 9 Backend                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ JWT Validation  │  │ User Profile    │  │ API Authorization│  │
│  │   Middleware    │  │   Extension     │  │   & RLS         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │  auth.users     │              │ user_profiles   │           │
│  │  (Supabase)     │◄────────────►│  (Custom)       │           │
│  └─────────────────┘              └─────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### JWT Token Flow

1. **User Registration/Login**: Frontend calls Supabase Auth
2. **Token Generation**: Supabase returns JWT access token
3. **API Requests**: Frontend includes token in Authorization header
4. **Token Validation**: .NET middleware validates token with Supabase
5. **User Context**: Extract user ID from token claims
6. **Database Operations**: Query user profile and apply RLS policies

### Implementation Details

```csharp
// JWT Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = supabaseUrl;
        options.Audience = "authenticated";
        options.RequireHttpsMetadata = builder.Environment.IsProduction();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// User Context Extraction
public string GetCurrentUserId(HttpContext context)
{
    return context.User.FindFirst("sub")?.Value 
        ?? throw new UnauthorizedAccessException("User not authenticated");
}
```

## 📊 Data Architecture

### Database Design Philosophy

1. **Normalization**: Third normal form (3NF) with strategic denormalization
2. **Performance**: Indexes on frequently queried columns
3. **Scalability**: Partitioning strategy for large tables
4. **Integrity**: Foreign keys and check constraints
5. **Audit Trail**: Created/updated timestamps on all entities

### Entity Relationships

```
UserProfile (1) ──┐
                  │
                  ├── Issues (1:N)
                  │     │
                  │     └── IssuePhotos (1:N)
                  │     └── EmailTrackings (1:N)
                  │     └── AdminActions (1:N)
                  │
                  ├── UserBadges (1:N) ──── Badges (N:1)
                  │
                  └── UserAchievements (1:N) ──── Achievements (N:1)
```

### Performance Optimization Strategies

1. **Indexing Strategy**:
   - Primary keys: Clustered indexes
   - Foreign keys: Non-clustered indexes
   - Query filters: Composite indexes
   - Location data: Spatial indexes

2. **Query Optimization**:
   - **Pagination**: OFFSET/LIMIT with total count optimization
   - **Eager Loading**: Include related data in single query
   - **Projection**: Select only required columns
   - **Caching**: Redis for frequently accessed data

3. **Connection Management**:
   - **Pooling**: Connection pooling for high concurrency
   - **Async Operations**: Non-blocking database calls
   - **Read Replicas**: Separate read operations (future)

## 🚀 Performance Architecture

### Response Time Targets

- **Health Check**: <50ms
- **Public Endpoints**: <200ms (P95)
- **Authenticated Endpoints**: <300ms (P95)
- **Admin Endpoints**: <500ms (P95)
- **Complex Queries**: <1s (P95)

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   In-Memory     │  │    Redis        │  │   Database      │  │
│  │   (L1 Cache)    │  │  (L2 Cache)     │  │   (Source)      │  │
│  │                 │  │                 │  │                 │  │
│  │  • Static Data  │  │  • User Session │  │  • All Data     │  │
│  │  • Categories   │  │  • Issue Lists  │  │  • Authoritative│  │
│  │  • Badges       │  │  • Leaderboards │  │    Source       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Cache Layers:**
1. **L1 (In-Memory)**: Static reference data (5-15 minutes TTL)
2. **L2 (Redis)**: Dynamic user data and query results (1-60 minutes TTL)
3. **L3 (Database)**: Source of truth

**Cache Invalidation:**
- **Time-based**: TTL expiration
- **Event-based**: Invalidate on data changes
- **Manual**: Admin cache refresh endpoints

### Horizontal Scaling Strategy

```
                    Load Balancer (Railway)
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   API       │ │   API       │ │   API       │
    │ Instance 1  │ │ Instance 2  │ │ Instance N  │
    └─────────────┘ └─────────────┘ └─────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (Shared)      │
                  └─────────────────┘
```

**Stateless Design**: All API instances are stateless and can be scaled independently.

## 🛡️ Security Architecture

### Defense in Depth Strategy

1. **Network Security**: HTTPS only, HSTS headers
2. **Authentication**: Supabase JWT validation
3. **Authorization**: Role-based access control
4. **Input Validation**: Comprehensive input sanitization
5. **Output Encoding**: Prevent XSS attacks
6. **Rate Limiting**: Prevent abuse and DoS
7. **Database Security**: Row Level Security (RLS)
8. **Audit Logging**: Track all significant actions

### Row Level Security Implementation

```sql
-- Example RLS Policy
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "Anyone can view approved public issues" ON public.issues
    FOR SELECT USING (status = 'approved' AND public_visibility = TRUE);

CREATE POLICY "Users can create issues" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT supabase_user_id FROM public.user_profiles WHERE id = user_id
    ));
```

### Rate Limiting Configuration

```csharp
services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        httpContext => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});
```

### Data Protection

1. **Encryption at Rest**: Database-level encryption (Railway default)
2. **Encryption in Transit**: TLS 1.3 for all communications
3. **Sensitive Data**: No PII in logs, encrypted storage for sensitive fields
4. **GDPR Compliance**: Right to deletion, data portability

## 📈 Monitoring and Observability

### Logging Strategy

```csharp
// Structured Logging with Serilog
Log.Information("User {UserId} created issue {IssueId} in category {Category}", 
    userId, issueId, category);

Log.Warning("Failed login attempt for user {Email} from IP {IPAddress}", 
    email, ipAddress);

Log.Error(ex, "Database connection failed for user {UserId}", userId);
```

**Log Levels:**
- **Verbose**: Detailed debugging information
- **Debug**: Diagnostic information for developers
- **Information**: General application flow
- **Warning**: Potential issues or unexpected situations
- **Error**: Error events that don't stop application
- **Fatal**: Critical errors that cause application to terminate

### Metrics Collection

```csharp
// Performance Metrics
var stopwatch = Stopwatch.StartNew();
try 
{
    var result = await service.GetIssuesAsync(request);
    _metrics.RecordValue("api.issues.response_time", stopwatch.ElapsedMilliseconds);
    _metrics.IncrementCounter("api.issues.success");
    return result;
}
catch (Exception ex)
{
    _metrics.IncrementCounter("api.issues.error");
    throw;
}
```

**Key Metrics:**
- **Response Times**: P50, P95, P99 latencies per endpoint
- **Error Rates**: 4xx and 5xx response rates
- **Throughput**: Requests per second
- **Database Metrics**: Query times, connection pool usage
- **Business Metrics**: Issues created, emails sent, user registrations

### Health Checks

```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "database")
    .AddUrlGroup(new Uri($"{supabaseUrl}/rest/v1/"), name: "supabase")
    .AddCheck<CustomHealthCheck>("business-logic");

app.MapHealthChecks("/health", new HealthCheckOptions()
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

## 🚀 Deployment Architecture

### Railway Platform Benefits

1. **Simplified Deployment**: Git-based deployments
2. **Automatic Scaling**: Horizontal scaling based on metrics
3. **Database Management**: Managed PostgreSQL with backups
4. **Environment Management**: Separate staging/production environments
5. **Monitoring**: Built-in metrics and alerting

### Container Configuration

```dockerfile
# Dockerfile (generated by Railway/Nixpacks)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Civica.Api/Civica.Api.csproj", "Civica.Api/"]
RUN dotnet restore "Civica.Api/Civica.Api.csproj"
COPY . .
WORKDIR "/src/Civica.Api"
RUN dotnet build "Civica.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Civica.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Civica.Api.dll"]
```

### Environment Configuration

```yaml
# Railway Environment Variables
DATABASE_URL: ${{ Railway.DATABASE_URL }}
SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
ASPNETCORE_ENVIRONMENT: Production
PORT: 8080
```

### Blue-Green Deployment Strategy

1. **Build Phase**: Create new image with latest code
2. **Test Phase**: Run health checks and integration tests
3. **Deploy Phase**: Route traffic to new instances
4. **Validation Phase**: Monitor metrics and error rates
5. **Rollback**: Automatic rollback on failure detection

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '8.0.x'
    - name: Test
      run: dotnet test --verbosity normal

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Railway
      uses: railwayapp/railway-deploy@v1
      with:
        railway_token: ${{ secrets.RAILWAY_TOKEN }}
        service: civica-api
```

### Database Migration Strategy

```csharp
// Automatic migration on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CivicaDbContext>();
    try
    {
        await context.Database.MigrateAsync();
        Log.Information("Database migration completed successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Database migration failed");
        throw;
    }
}
```

## 🎯 Architecture Decisions

### ADR-001: Minimal APIs vs MVC Controllers

**Decision**: Use .NET 9 Minimal APIs
**Rationale**: 
- Better performance (10-15% improvement)
- Reduced boilerplate code
- Simpler testing
- Better suited for microservice architecture

**Consequences**:
- Need to maintain organization discipline
- Earlier extraction to services for complex logic

### ADR-002: Entity Framework Core vs Dapper

**Decision**: Use Entity Framework Core
**Rationale**:
- Strong typing and LINQ support
- Built-in migration support
- Better developer productivity
- Good performance for CRUD operations

**Consequences**:
- Some performance overhead vs raw SQL
- Learning curve for complex queries

### ADR-003: Supabase Auth Integration

**Decision**: Integrate with Supabase Auth for authentication
**Rationale**:
- Leverages existing frontend integration
- Reduces backend authentication complexity
- Built-in OAuth provider support
- Row Level Security integration

**Consequences**:
- Dependency on external service
- Need to sync user profiles between Supabase and local database

### ADR-004: PostgreSQL vs MongoDB

**Decision**: Use PostgreSQL
**Rationale**:
- Strong consistency guarantees
- Rich querying capabilities (SQL)
- Better tooling and monitoring
- ACID compliance for financial data

**Consequences**:
- Less flexibility for schema changes
- More complex object-relational mapping

## 📊 Architecture Metrics

### Performance Benchmarks

- **Startup Time**: <5 seconds (with database migration)
- **Memory Usage**: <100MB baseline, <500MB under load
- **CPU Usage**: <30% average, <80% peak
- **Database Connections**: Max 20 concurrent connections

### Scalability Targets

- **Concurrent Users**: 1,000 simultaneous users
- **Requests Per Second**: 1,000 RPS per instance
- **Database Load**: 500 queries per second
- **Response Time**: <200ms P95 under normal load

### Reliability Metrics

- **Uptime**: 99.9% (8.7 hours downtime per year)
- **Error Rate**: <0.1% for critical operations
- **Recovery Time**: <5 minutes for automatic recovery
- **Data Durability**: 99.999% (Railway managed backups)

## 🔮 Future Architecture Considerations

### Phase 2 Enhancements

1. **Caching Layer**: Redis integration for improved performance
2. **Event Sourcing**: Track all state changes for audit and replay
3. **CQRS**: Separate read and write models for better scalability
4. **Background Jobs**: Hangfire for email notifications and batch processing

### Phase 3 Scaling

1. **Microservices**: Split into domain-specific services
2. **Message Queue**: RabbitMQ or Azure Service Bus for async processing
3. **CDN Integration**: CloudFlare for static asset delivery
4. **Read Replicas**: Separate read database for improved performance

### Monitoring Enhancements

1. **APM Integration**: Application Performance Monitoring
2. **Distributed Tracing**: OpenTelemetry for request tracing
3. **Custom Dashboards**: Grafana dashboards for business metrics
4. **Alerting**: PagerDuty integration for critical issues

## 🎯 Success Criteria

The architecture is successful when:
- ✅ All performance targets are met consistently
- ✅ 99.9% uptime is achieved over 30-day periods
- ✅ Frontend integration is seamless with no regressions
- ✅ Database can handle projected user growth (10x current)
- ✅ Development team can deliver features rapidly
- ✅ Security vulnerabilities are prevented/mitigated
- ✅ Monitoring provides actionable insights
- ✅ Disaster recovery procedures are tested and effective

---

**Implementation Note**: This architecture provides a solid foundation for the Civica platform while maintaining simplicity and performance. It can evolve incrementally as the platform grows without requiring major rewrites.