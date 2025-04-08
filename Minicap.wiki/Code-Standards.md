# Code Standards

## General Standards

### Version Control
1. Branch Creation
   - Always create branches through GitHub issue interface
   - Never use command line for branch creation
   - Branch names auto-formatted as `feature/[issue-number]-description`
   - All branches must be created from `dev`

2. Commit and PR Standards
   - Commit messages follow conventional commits
   - Pull requests required for all changes
   - CI checks must pass before merge
   - Reference issue numbers in commits and PRs

### Environment Variables
1. Location
   - `.env` file must be in root directory
   - Never commit `.env` files
   - Include `.env.example` in repository
   - Document all required variables

2. Usage
   - All secrets must be in `.env`
   - No hardcoded credentials anywhere
   - Use appropriate naming: `CATEGORY_VARIABLE_NAME`
   - Load using environment variable loader

3. Required Structure
   ```plaintext
   # .env.example
   # Database
   DB_CONNECTION_STRING=mongodb://localhost:27017
   DB_NAME=myapp
   
   # Authentication
   JWT_SECRET=your-secret-here
   JWT_EXPIRY=24h
   
   # API Keys
   API_KEY=your-api-key
   ```

### Documentation
1. All public methods require JSDoc
2. README.md for each major directory
3. Update wiki for architectural changes
4. Include examples in documentation

### Testing
1. Unit tests for business logic
2. Integration tests for APIs
3. E2E tests for critical paths
4. Test coverage minimum: 80%

## Backend Standards

### Database
1. Collections
   - PascalCase names
   - Include indexes definition
   - Document schema changes

2. Models
   - Must extend `Audit`
   - Use `string` for references
   - Define strict types
   ```typescript
   interface Entity extends Audit {
       name: string;         // Required
       description?: string; // Optional
       parentId: string;   // Reference
   }
   ```

3. ViewModels
   - Extend `BaseViewModel<T>`
   - Implement repository interface
   - Use `withCollection` wrapper
   - Handle all errors properly
   - Map DTOs consistently

4. Error Handling
   - Use custom error types
   - Include error context
   - Log errors appropriately
   - Return proper status codes

5. Authentication
   - Validate JWT in middleware
   - Check roles for protected routes
   - Refresh tokens properly
   - Secure password storage

### Audit System
1. Model Requirements
   ```typescript
   // Every model must extend Audit
   interface Audit {
       id: string;
       createdAtUTC?: Date;
       updatedAtUTC?: Date;
       createdBy?: string;
       updatedBy?: string;
   }
   ```

2. ViewModel Implementation
   - Must implement `updateAudit`
   - Track creation and updates
   - Store user IDs for accountability
   - Maintain UTC timestamps

3. Audit Updates
   ```typescript
   // Required pattern for all audit updates
   protected async updateAudit(
       existingAudit: Partial<Audit> | null, 
       userId: string
   ): Promise<Audit>
   ```

### Authentication & Authorization
1. JWT Structure
   ```typescript
   interface JWTPayload {
       userId: string;
       roles: string[];
       exp: number;
   }
   ```

2. Token Management
   - Generate using `generateToken(payload, secret)`
   - Verify using `verifyToken(token, secret)`
   - Include expiration time
   - Store in Authorization header

3. Role-Based Access
   - Define role enums
   - Use middleware for role checks
   - Implement role hierarchy
   - Document required roles

### BaseViewModel Standards
1. Database Connection
   ```typescript
   // Required pattern for DB operations
   protected async withCollection<R>(
       collectionName: string,
       operation: (collection: Collection) => Promise<R>
   ): Promise<R>
   ```

2. Required Implementations
   - `mapToDTO(doc: any): T`
   - `updateAudit()`
   - Error handling
   - Type safety

3. Connection Management
   - Singleton client
   - Connection pooling
   - Proper cleanup
   - Error recovery

4. Error Standards
   - Use custom error types
   - Include stack traces
   - Log all errors
   - Handle cleanup

## Frontend Standards

### Centralized Styling
1. All styling should be managed through:
   - **global.css** - For app-wide styles and utility classes
   - **tailwind.config.js** - For theme configuration
   - **gluestack-ui-provider/config.ts** - For component-specific theme variables

### Component Guidelines
1. **Use Tailwind Classes**

### Components
1. Structure
   ```typescript
   // Single responsibility
   // Props interface
   // Functional component
   // Hooks at top
   // JSX at bottom
   ```

2. State Management
   - Use React Query for API data
   - Context for global state
   - Local state for UI
   - Avoid prop drilling

3. Styling
   - Use Tailwind classes
   - Follow design system
   - Mobile-first approach
   - Consistent spacing

4. Performance
   - Memoize when needed
   - Lazy load routes
   - Optimize images
   - Monitor bundle size

### Data Handling
1. API Calls
   - Use custom hooks
   - Handle loading states
   - Error boundaries
   - Type responses

2. Forms
   - Form validation
   - Error messages
   - Loading states
   - Success feedback

### TypeScript
1. Strict mode enabled
2. No `any` types
3. Define interfaces
4. Use generics appropriately

## Quality Assurance

### Pre-commit Checks
1. Linting
2. Type checking
3. Unit tests
4. Format verification

### Code Review
1. Architecture review
2. Security review
3. Performance review
4. Accessibility check

### Definition of Done
1. Tests passing
2. Documentation updated
3. PR reviewed
4. QA approved
