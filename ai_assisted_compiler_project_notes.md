# AI-Assisted Mini Compiler --- Project Notes

**Recovered from previous ChatGPT discussions:** October 6, 2026\
**Relevant conversations:**\
- **AI-assisted mini compiler project** --- initial project direction,
stack, compiler pipeline, and MVP scope (around 15:21--15:30 UTC). -
**Backend architecture and API design / consolidation** --- backend
diagram, modular architecture, deployment, and endpoint specification
(around 15:30--17:47 UTC).

> The original conversation titles may be displayed slightly differently
> in ChatGPT history. Search your chat history for **"AI-assisted mini
> compiler"**, **"backend diagram"**, **"endpoint design"**, or
> **"consolidate"** around October 6, 2026.

## 1. Project idea and goal

Build an **AI-assisted mini compiler platform**. The core project is
compiler-focused, with AI as an additional layer rather than the whole
product.

The platform should let a user write code in a browser editor, compile
or run it, see precise compiler errors, and use AI to understand those
errors and get suggested fixes.

### Main user-facing goals

-   Provide a code editor in the browser.
-   Compile and execute supported code.
-   Report errors with useful source locations, especially line and
    column.
-   Explain compiler errors in plain language with AI.
-   Suggest potential fixes for errors.
-   Leave room for explaining code, optimizing code, generating code,
    and debugging assistance.

## 2. Proposed technology stack

  ------------------------------------------------------------------------
  Layer                   Proposed technology      Purpose
  ----------------------- ------------------------ -----------------------
  Frontend                Next.js + TypeScript     Web application and UI

  Styling                 Tailwind CSS             Responsive UI styling

  Code editor             Monaco Editor            VS Code-like editing
                                                   experience

  Backend API             Node.js + Express +      REST API and
                          TypeScript               application logic

  Compiler                C++ compiler / custom    Compile or interpret
                          mini-language compiler   supported source code

  AI                      Gemini API               Error explanations and
                                                   fix suggestions

  Database                PostgreSQL               Users, projects, files,
                                                   submissions, and
                                                   compilation results

  Execution isolation     Docker sandbox           Run submitted code in
                                                   an isolated environment

  Optional later          Redis, queues, workers,  Caching, async jobs,
  infrastructure          object storage (S3),     larger workloads, and
                          monitoring               operational visibility

  API style               REST                     Frontend-to-backend
                                                   communication

  Version control         Git + GitHub             Source control and
                                                   collaboration

  Deployment direction    Vercel frontend; AWS for Suggested deployment
                          backend/infrastructure   arrangement

  Backend hosting option  AWS ECS Fargate          Containerized backend
                                                   deployment

  Database hosting option AWS RDS for PostgreSQL   Managed relational
                                                   database
  ------------------------------------------------------------------------

The early stack discussion also mentioned deploying the frontend with
Vercel and using AWS services for backend workloads. Redis,
queues/workers, S3, and monitoring were considered **later additions**,
not mandatory MVP dependencies.

## 3. High-level architecture

``` text
User
  |
  v
Next.js + TypeScript frontend
  |
  +-- Monaco code editor
  |
  v
Nginx (optional production edge layer)
  - TLS termination
  - Routing
  - Rate limiting
  |
  v
Node.js + Express + TypeScript API
  |
  +--> Authentication and authorization
  |
  +--> Controllers
  |      |
  |      v
  |    Services
  |      |
  |      +--> Repositories --> PostgreSQL
  |      |
  |      +--> Compiler service --> Docker-isolated compiler/runtime
  |      |
  |      +--> AI service --> Gemini API
  |
  +--> Compilation/submission results --> PostgreSQL
```

### Architecture notes

-   For a local MVP, Nginx is optional. Add it for a more
    production-like setup when needed.
-   Keep compiler execution isolated in Docker rather than executing
    arbitrary submitted code directly inside the API process.
-   The API should coordinate compilation, execution, result
    persistence, and AI explanations.
-   Keep AI calls separate from the compiler implementation. The
    compiler should produce structured diagnostics; the AI layer should
    explain them.
-   Use request validation, authentication, rate limits, timeouts,
    resource limits, and safe error handling.

## 4. Compiler pipeline

Two compatible pipeline descriptions came up in the discussions.

### More detailed pipeline

``` text
Source Code
    |
    v
Lexer / Lexical Analysis
    |
    v
Parser / Syntax Analysis
    |
    v
Abstract Syntax Tree (AST)
    |
    v
Semantic Analysis
    |
    v
Intermediate Representation (IR)
    |
    v
Optimization
    |
    v
Code Generation
    |
    v
Docker-isolated execution (where applicable)
    |
    v
Output or structured compiler/runtime errors
    |
    v
Gemini explanation and suggested fix (when requested)
```

### Important distinction

A **compiler** translates source code through language-processing
stages. A **runtime/execution environment** runs the generated program.
The AI layer is an assistant around diagnostics and code understanding;
it does not replace lexer, parser, semantic analysis, or code
generation.

If the first version uses an existing C++ compiler such as `g++`, the
project can initially focus on a safe compile/run service and
AI-assisted diagnostics. If the goal is to demonstrate compiler-design
concepts directly, implement a small language with your own lexer,
parser, AST, and semantic checks. These are related but different
implementation paths; the earlier notes mentioned both a C++ compiler
and a mini-language pipeline.

## 5. Suggested mini-language scope

For a compiler-design-oriented MVP, the earlier discussion suggested a
small language supporting: - Variables - Basic data types - Arithmetic
expressions - `if` / `else` - Loops - Functions - Lexer and parser - AST
construction - Semantic analysis - Clear error reporting - AI
explanations for compiler errors

This keeps the language small enough to implement and demonstrate
without attempting to reproduce a full production compiler.

## 6. Backend code organization

Use a modular **Controller → Service → Repository** structure, with
dedicated adapters/services for external systems.

``` text
src/
  app.ts
  routes/
    auth.routes.ts
    user.routes.ts
    project.routes.ts
    file.routes.ts
    code.routes.ts
    ai.routes.ts
    submission.routes.ts
    job.routes.ts
    health.routes.ts
  controllers/
    auth.controller.ts
    user.controller.ts
    project.controller.ts
    file.controller.ts
    code.controller.ts
    ai.controller.ts
    submission.controller.ts
  services/
    auth.service.ts
    project.service.ts
    file.service.ts
    compiler.service.ts
    execution.service.ts
    ai.service.ts
    submission.service.ts
  repositories/
    user.repository.ts
    project.repository.ts
    file.repository.ts
    submission.repository.ts
    execution.repository.ts
  integrations/
    gemini.client.ts
    compiler.runner.ts
  middleware/
    auth.middleware.ts
    error.middleware.ts
    rate-limit.middleware.ts
    validate.middleware.ts
  validators/
  types/
  config/
```

This is a suggested structure, not a recovered exact file tree. Start
smaller if needed and split modules when the implementation grows.

### Responsibility boundaries

-   **Routes:** map HTTP methods and paths to controller functions.
-   **Controllers:** validate/normalize request input and shape HTTP
    responses.
-   **Services:** implement business rules and coordinate database,
    compiler, and AI operations.
-   **Repositories:** encapsulate database queries.
-   **Compiler runner:** compile or execute code in a restricted
    environment.
-   **AI service:** send structured compiler diagnostics and relevant
    code context to Gemini.
-   **Middleware:** authentication, validation, rate limiting, and
    centralized error handling.

## 7. Data model / database entities

The previous discussions identified these core entities:

### User

Represents an account. - `id` - `email` - `password_hash` (if using
password-based authentication) - `created_at` - `updated_at`

### Project

Represents a user's workspace or project. - `id` - `user_id` - `name` -
`description` (optional) - `created_at` - `updated_at`

### CodeFile

Represents source code stored in a project. - `id` - `project_id` -
`name` or `path` - `language` - `source_code` or a storage reference -
`created_at` - `updated_at`

### Submission

Represents a compile/run request or submitted version of code. - `id` -
`user_id` - `project_id` (optional) - `file_id` (optional) - `status` -
`created_at`

### Execution / CompilationResult

Represents the outcome of compiling or running code. - `id` -
`submission_id` - `stdout` - `stderr` - `exit_code` - `duration_ms` -
`diagnostics` (structured errors/warnings) - `created_at`

### AiExplanation

Represents an AI-generated explanation or suggested fix. - `id` -
`submission_id` or `execution_id` - `diagnostic` / error context -
`explanation` - `suggested_fix` - `created_at`

These fields are a practical draft derived from the entities discussed;
they are not a finalized database schema. Use foreign keys, indexes,
ownership checks, and sensible retention limits before production use.

## 8. API design

Use a versioned REST prefix:

``` text
/api/v1
```

The prior endpoint plan covered these groups: - Authentication - Users -
Projects and files - Compile and execute - Supported languages - AI
explanations, fixes, code explanations, optimization, and generation -
Debugging and debug-fix assistance - Submissions - Background jobs -
Health checks - Admin operations

### MVP endpoints discussed

The MVP was described as approximately **17 endpoints**, with this core
scope:

  -------------------------------------------------------------------------------------
  Method                  Endpoint                              Purpose
  ----------------------- ------------------------------------- -----------------------
  `POST`                  `/api/v1/auth/register`               Register a user

  `POST`                  `/api/v1/auth/login`                  Log in

  `POST`                  `/api/v1/auth/logout`                 Log out / invalidate
                                                                session where
                                                                applicable

  `GET`                   `/api/v1/auth/me`                     Get the current
                                                                authenticated user

  `GET`                   `/api/v1/projects`                    List the user's
                                                                projects

  `POST`                  `/api/v1/projects`                    Create a project

  `GET`                   `/api/v1/projects/:projectId`         Get a project

  `PATCH`                 `/api/v1/projects/:projectId`         Update project metadata

  `DELETE`                `/api/v1/projects/:projectId`         Delete a project

  `GET`                   `/api/v1/projects/:projectId/files`   List project files

  `POST`                  `/api/v1/projects/:projectId/files`   Create a file

  `GET`                   `/api/v1/files/:fileId`               Get file
                                                                contents/details

  `PATCH`                 `/api/v1/files/:fileId`               Update file
                                                                contents/details

  `POST`                  `/api/v1/code/compile`                Compile source code

  `POST`                  `/api/v1/code/execute`                Execute compiled code
                                                                in the sandbox

  `POST`                  `/api/v1/ai/explain-error`            Explain compiler
                                                                diagnostics

  `POST`                  `/api/v1/ai/suggest-fix`              Suggest a possible
                                                                correction
  -------------------------------------------------------------------------------------

The original notes described the 17-endpoint MVP at a category level.
The table above is a concrete reconstruction of that scope, so confirm
paths and methods against the implementation before treating them as a
frozen contract.

### Additional endpoints for later phases

These were part of the broader proposed API, not necessarily the first
release:

``` text
GET    /api/v1/languages
POST   /api/v1/ai/explain-code
POST   /api/v1/ai/optimize
POST   /api/v1/ai/generate
POST   /api/v1/debug
POST   /api/v1/debug/fix
GET    /api/v1/submissions
GET    /api/v1/submissions/:submissionId
GET    /api/v1/jobs/:jobId
GET    /api/v1/health
/admin/...  administrative operations
```

The exact request/response schemas were not preserved in the recovered
summary and should be designed before implementation.

## 9. Error reporting and AI flow

The earlier backend notes specifically called for compiler errors to
include **line, column, and message**.

A useful flow is:

1.  Frontend sends source code, language, and optional project/file
    identifiers.
2.  API validates input and applies size/time limits.
3.  Compiler runner executes the compiler in an isolated environment.
4.  Compiler output is normalized into structured diagnostics.
5.  API returns the diagnostics and compilation status.
6.  If the user asks for help, the AI service sends the relevant code
    excerpt and diagnostic details to Gemini.
7.  Gemini returns a plain-language explanation and a proposed fix.
8.  UI displays the original diagnostic separately from the AI
    suggestion, so users can distinguish compiler facts from generated
    advice.

Example diagnostic shape:

``` json
{
  "severity": "error",
  "message": "Expected ';' after expression",
  "line": 8,
  "column": 14,
  "source": "parser"
}
```

Example AI response shape:

``` json
{
  "explanation": "The statement is missing a semicolon at the end.",
  "suggestedFix": "Add a semicolon after the expression.",
  "confidenceNote": "Review the proposed change before applying it."
}
```

These JSON shapes are illustrative examples, not recovered exact
contracts.

## 10. Frontend / UI direction

The user wanted an authentic UI/design suitable for a Next.js
implementation.

Core screens implied by the project: - Landing page / project overview -
Authentication screens - Projects dashboard - Project workspace with
Monaco Editor - Compile/run controls - Output and error/diagnostics
panel - AI explanation and suggested-fix panel - Submission/history view
(can be deferred)

A practical workspace layout is: - **Left:** project/file explorer -
**Center:** Monaco code editor - **Bottom:** compiler output, runtime
output, and diagnostics - **Right panel or tab:** AI explanation and
suggested fix

Keep the interface focused on the code workflow. Show line/column
information and make it easy to jump from a diagnostic to the relevant
editor line.

## 11. MVP timeline and build order

The earlier discussion suggested a **2--3 week MVP**, with
authentication, projects/files, compiler support, AI assistance, and
submissions as the primary areas.

### Suggested sequence

**Phase 1 --- Foundation** - Create the Next.js + TypeScript frontend. -
Create the Node.js + Express + TypeScript API. - Configure environment
variables, linting, formatting, and Git. - Connect PostgreSQL and define
initial tables.

**Phase 2 --- Compiler core** - Choose the first supported compilation
path: an existing C++ compiler, or a small custom language. - Implement
compile request validation and structured result handling. - Run
compilation in Docker with time, memory, filesystem, and process
limits. - Return stdout, stderr, exit status, and diagnostics.

**Phase 3 --- Workspace** - Integrate Monaco Editor. - Add project/file
creation and saving. - Add compile/run controls and a results panel.

**Phase 4 --- AI assistance** - Integrate Gemini through a backend-only
service. - Implement `POST /api/v1/ai/explain-error`. - Implement
`POST /api/v1/ai/suggest-fix`. - Handle API failures, quotas, timeouts,
and malformed AI responses.

**Phase 5 --- Finish the MVP** - Add authentication and per-user
ownership checks. - Persist submissions/results. - Add validation,
centralized errors, basic rate limits, and tests. - Deploy a demo and
document setup and limitations.

This order is a practical implementation plan based on the recovered
scope, not a verbatim day-by-day schedule from the prior chat.

## 12. Security and reliability requirements

Because the platform runs user-provided code, sandboxing is a core
requirement rather than an optional polish item.

-   Never execute submitted code directly in the API process.
-   Run compilers/programs in isolated containers with CPU, memory,
    process, and wall-clock limits.
-   Restrict network access from execution containers unless explicitly
    needed.
-   Use a non-root container user and a restricted filesystem.
-   Apply source-code size limits and request timeouts.
-   Validate all IDs and ensure users can access only their own
    projects/files/submissions.
-   Keep Gemini API credentials on the server, never in browser code.
-   Rate-limit compile, execute, and AI endpoints.
-   Avoid logging secrets or unnecessarily storing sensitive source
    code.
-   Treat AI output as a suggestion; do not silently apply generated
    code fixes.
-   Add tests for malformed input, compiler failure, timeouts, and
    unauthorized resource access.

## 13. Decisions still to confirm

The recovered notes contain a few choices that should be settled before
implementation:

1.  **Compiler approach:** use an installed C++ compiler to build a
    browser-based compile/run service, or build a custom mini-language
    to showcase compiler-design stages.
2.  **Meaning of "AI compiler":** an AI assistant around compiler
    errors, a compiler for a custom language, or eventually both.
3.  **First language:** C++ as the initial supported language, or a
    custom language with variables, expressions, conditions, loops, and
    functions.
4.  **Execution model:** synchronous compile/run for the MVP or
    asynchronous jobs if executions take longer.
5.  **Authentication:** cookie-based sessions or token-based
    authentication.
6.  **Storage:** store source code in PostgreSQL for the MVP or use
    object storage for larger files later.
7.  **AI contract:** define request/response schemas, prompt strategy,
    token limits, timeouts, and handling of unsupported or incorrect
    suggestions.

## 14. Short project summary for README or resume

**AI-Assisted Mini Compiler** is a web-based coding platform built with
Next.js, TypeScript, Node.js, PostgreSQL, Docker, and the Gemini API. It
combines a browser code editor and isolated compilation/execution with
structured diagnostics, AI-generated error explanations, and suggested
fixes. The planned compiler workflow includes lexical analysis, parsing,
AST construction, semantic analysis, and later intermediate
representation, optimization, and code generation for a custom
mini-language.

Only claim features as completed once they have actually been
implemented and tested.

## 15. Quick recovery summary

The most important things recovered from the October 6, 2026 discussions
are:

-   **Project direction:** AI-assisted mini compiler; compiler concepts
    are the core, AI is an added layer.
-   **Frontend:** Next.js, TypeScript, Tailwind CSS, Monaco Editor.
-   **Backend:** Node.js, Express, TypeScript, REST API.
-   **Data:** PostgreSQL; entities include User, Project, CodeFile,
    Submission, Execution/CompilationResult, and AiExplanation.
-   **Compiler path:** lexer → parser → AST → semantic analysis → IR →
    optimization → code generation.
-   **Execution:** Docker-isolated compiler/runtime.
-   **AI:** Gemini for error explanations and suggested fixes.
-   **Architecture:** controllers → services → repositories, with
    separate compiler and AI integrations.
-   **API prefix:** `/api/v1`; MVP includes auth, projects/files,
    compile/execute, explain-error, and suggest-fix.
-   **Deployment direction:** Vercel frontend, AWS backend (ECS Fargate
    option), RDS PostgreSQL.
-   **MVP target:** roughly 2--3 weeks, with Redis, queues/workers, S3,
    and monitoring deferred until needed.
