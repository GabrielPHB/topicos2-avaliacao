# TEC2 Final Assessment

Refactored solution for the final assessment of Topicos Especiais em Computacao II. The original legacy implementation was preserved in `src/original/`, and the public contract remains centralized in `src/main.ts`.

## Team

- Miguel Angelo Assução Veras Carvalho
- Gabriel Rocha da Silva Machado

## Setup

Use Node.js 22 and npm.

```bash
npm install
```

## Verification

Run the full quality checks before delivery:

```bash
npm run typecheck
npm test
```

The public behavior preservation tests can also be executed separately:

```bash
npm run test:original
```

## Database

The project uses the PostgreSQL infrastructure provided by the base repository. Copy `.env.example` to `.env` and keep `DATABASE_URL` configured there.

```bash
npm run db:up
npm run db:init
```

The persistence implementation is in `src/infra/postgres-travel-request-repository.ts`. It saves and retrieves travel request analyses through the `TravelRequestRepository` contract defined in the application layer.

To stop and remove the local database volume:

```bash
npm run db:down
```

## Architecture

The refactoring separates responsibilities into three main layers:

- `src/domain/`: business types and rules for validation, date calculation, amount calculation, warnings, and status decision.
- `src/application/`: the main use case and repository contract used to coordinate processing and optional persistence.
- `src/infra/`: PostgreSQL repository implementation, isolated from the domain rules.

`src/main.ts` exports the public types and `processTravelRequest` function required by the preservation tests. The dependency diagram is available at `docs/dependency-diagram.pdf` and can be regenerated with:

```bash
npm run docs:diagram
```

## Tests

The repository keeps the professor's behavior tests unchanged in `tests/original/`. Additional team tests were added in:

- `tests/domain/`
- `tests/application/`
- `tests/infra/`

These tests cover business rules, use case orchestration, and persistence mapping without depending on a live database.

## AI Usage

Tool used: OpenAI Codex.

Codex was used to inspect the legacy implementation, identify the public behavior protected by the original tests, propose a layered refactoring, create unit tests, implement the PostgreSQL repository, and draft this documentation.

Accepted suggestions:

- Extract business rules from the legacy function into domain code.
- Keep `src/main.ts` as the only public entry point for the preservation tests.
- Add an application use case that can run synchronously for the public contract and asynchronously when persistence is required.
- Test the infrastructure repository with a fake PostgreSQL client to avoid non-deterministic tests.

Modified or rejected suggestions:

- The public `processTravelRequest` function was kept synchronous to preserve the original contract.
- Persistence was not placed inside the domain layer because database access is an infrastructure detail.
- The original legacy folder and original tests were not modified.

Validation:

- The refactored behavior is verified by `tests/original/`.
- New unit tests verify domain rules, application orchestration, and persistence mapping.
- `npm run typecheck` validates TypeScript strict mode.
- `npm test` runs the complete automated test suite.

## Delivery Notes

Before submitting the public GitHub repository link in SIGAA, confirm that the Team section contains the full legal names of all team members. The absence of full names in this README causes a zero grade according to the assignment statement.
