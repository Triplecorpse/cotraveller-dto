# @cotraveller/dto

Shared TypeScript DTOs and interfaces for the cotraveller backend and
frontend, based on the technical specification (section 9, Data Model).

## Contents

- `PlacesProvider` — supported places-provider enum.
- `SearchRequestDto` — validated, structured search request.
- `PlaceResultDto` — normalized, provider-agnostic place result.
- `CategoryOptionDto` / `ProviderCategoryMapping` — controlled category
  mapping configuration.

## Usage

This package is consumed as a git submodule at `/dto` in both the backend
and frontend repositories, and referenced via a local file dependency:

```json
"devDependencies": {
  "@cotraveller/dto": "file:./dto"
}
```

Build before use:

```bash
npm run build --prefix dto
```
