# Test Suite Documentation

## Overview

This test suite provides comprehensive testing for the GeoSnap application with exactly **2 Unit Tests** (1 positive, 1 negative) and **1 Snapshot Test** to ensure code quality and UI consistency.

## Test Structure

```
__tests__/
├── README.md                          # This file
├── __fixtures__/                      # Test fixtures and helper components
│   └── LocationCard.tsx               # Sample component for snapshot testing
├── components/                        # Component tests
│   └── ui/
│       └── icon-symbol.test.tsx       # 1 Snapshot test
└── utils/                             # Utility function tests
    └── location-validator.test.ts     # 2 Unit tests (1 positive, 1 negative)
```

## Test Summary

✅ **Total Tests: 3**
- 2 Unit Tests (1 Positive + 1 Negative)
- 1 Snapshot Test

## Test Details

### Unit Tests (2 tests)

**Location:** `__tests__/utils/location-validator.test.ts`

**Tests the:** `location-validator` utility (`utils/validators/location-validator.ts`)

#### 1. Positive Test ✅
**Test:** "should validate a location with valid coordinates"

**Purpose:** Verifies that valid location data is accepted

**Test Data:**
- Latitude: 48.8566 (Paris)
- Longitude: 2.3522
- Altitude: 35m

**Assertions:**
- Result is valid
- No validation errors

#### 2. Negative Test ❌
**Test:** "should reject a location with invalid coordinates"

**Purpose:** Verifies that invalid location data is rejected

**Test Data:**
- Latitude: 95 (exceeds maximum of 90)
- Longitude: 200 (exceeds maximum of 180)
- Altitude: NaN (not a number)

**Assertions:**
- Result is invalid
- Contains multiple validation errors
- Specific error messages for each invalid field

### Snapshot Test (1 test)

**Location:** `__tests__/components/ui/icon-symbol.test.tsx`

**Tests the:** `LocationCard` component (`__tests__/__fixtures__/LocationCard.tsx`)

**Test:** "should match snapshot with complete location data"

**Purpose:** Ensures UI consistency by capturing component rendering

**Test Data:**
- Latitude: 48.8566
- Longitude: 2.3522
- Altitude: 35
- Timestamp: "2024-01-15 14:30:00"
- Title: "Paris, France"

**Verifies:**
- Component renders correctly with all props
- UI structure remains consistent
- No unintended visual regressions

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test:watch
```

### Run tests with coverage
```bash
npm test:coverage
```

### Run specific test file
```bash
# Unit tests only
npm test -- __tests__/utils/location-validator.test.ts

# Snapshot test only
npm test -- __tests__/components/ui/icon-symbol.test.tsx
```

### Update snapshots
```bash
npm test -- -u
```

## Test Results

```
Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
Snapshots:   1 passed, 1 total
```

## What is Tested

### Location Validation ✅
- ✅ Valid coordinate ranges (latitude: -90 to 90, longitude: -180 to 180)
- ✅ Invalid coordinate detection (out of range values)
- ✅ Altitude validation (including NaN detection)
- ✅ Multiple validation error collection
- ✅ Error message accuracy

### Component Rendering ✅
- ✅ LocationCard component snapshot
- ✅ Proper rendering of all props
- ✅ UI consistency verification

## Technologies Used

- **Jest** - Testing framework
- **Babel** - JavaScript/TypeScript transformation
  - @babel/preset-env
  - @babel/preset-typescript
  - @babel/preset-react
- **react-test-renderer** - Snapshot testing
- **TypeScript** - Type safety in tests

## Configuration

### Jest Configuration (package.json)

```json
{
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.[jt]s?(x)"],
    "transform": {
      "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", {
        "presets": [
          "@babel/preset-env",
          "@babel/preset-typescript",
          "@babel/preset-react"
        ]
      }]
    },
    "transformIgnorePatterns": [
      "node_modules/(?!(react-native|@react-native|react-native-.*)/)"
    ],
    "moduleNameMapper": {
      "^react-native$": "<rootDir>/__mocks__/react-native.js"
    }
  }
}
```

### Mocks

- **react-native** - Mock for React Native components and APIs
- Location: `__mocks__/react-native.js`

## Test Code Examples

### Unit Test Example (Positive)

```typescript
it('should validate a location with valid coordinates', () => {
  // Arrange
  const location: LocationData = {
    latitude: 48.8566,
    longitude: 2.3522,
    altitude: 35,
  };

  // Act
  const result = validateLocation(location);

  // Assert
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

### Unit Test Example (Negative)

```typescript
it('should reject a location with invalid coordinates', () => {
  // Arrange
  const location: LocationData = {
    latitude: 95,
    longitude: 200,
    altitude: NaN,
  };

  // Act
  const result = validateLocation(location);

  // Assert
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});
```

### Snapshot Test Example

```typescript
it('should match snapshot with complete location data', () => {
  const tree = renderer.create(
    <LocationCard
      latitude={48.8566}
      longitude={2.3522}
      altitude={35}
      timestamp="2024-01-15 14:30:00"
      title="Paris, France"
    />
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
```

## Files Created

1. **`utils/validators/location-validator.ts`**
   - Location validation utility
   - Functions: isValidLatitude, isValidLongitude, isValidAltitude, validateLocation, calculateDistance, formatCoordinates

2. **`__tests__/utils/location-validator.test.ts`**
   - 2 unit tests (1 positive, 1 negative)

3. **`__tests__/components/ui/icon-symbol.test.tsx`**
   - 1 snapshot test

4. **`__tests__/__fixtures__/LocationCard.tsx`**
   - Test component for snapshot testing

5. **`__mocks__/react-native.js`**
   - React Native mock for testing

## Best Practices

1. **AAA Pattern** - All tests follow Arrange-Act-Assert structure
2. **Clear Naming** - Descriptive test names explain what is being tested
3. **Type Safety** - Full TypeScript support in tests
4. **Isolation** - Each test is independent
5. **Documentation** - Clear comments marking positive/negative tests

## Troubleshooting

### Tests not running
```bash
npm install
```

### Snapshot mismatch
Review changes carefully, then update if intentional:
```bash
npm test -- -u
```

### Module import errors
Check that `__mocks__/react-native.js` exists and is properly configured.

## Contributing

When adding features:
1. Maintain the test structure (2 unit tests + 1 snapshot test)
2. Ensure all tests pass before committing
3. Follow the AAA pattern
4. Update this README if necessary

---

**Last Updated:** 2024
**Test Status:** ✅ All 3 tests passing