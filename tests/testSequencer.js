/**
 * Custom Test Sequencer
 * Ensures tests run in optimal order (unit tests first, then integration)
 */

import Sequencer from '@jest/test-sequencer';

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Sort tests by priority: unit tests first, then integration, then e2e
    const testOrder = tests.sort((testA, testB) => {
      const pathA = testA.path;
      const pathB = testB.path;
      
      // Unit tests first
      if (pathA.includes('/unit/') && !pathB.includes('/unit/')) {
        return -1;
      }
      if (!pathA.includes('/unit/') && pathB.includes('/unit/')) {
        return 1;
      }
      
      // Integration tests second
      if (pathA.includes('/integration/') && !pathB.includes('/integration/')) {
        return -1;
      }
      if (!pathA.includes('/integration/') && pathB.includes('/integration/')) {
        return 1;
      }
      
      // E2E tests last
      if (pathA.includes('/e2e/') && !pathB.includes('/e2e/')) {
        return 1;
      }
      if (!pathA.includes('/e2e/') && pathB.includes('/e2e/')) {
        return -1;
      }
      
      // Alphabetical order for same type
      return pathA.localeCompare(pathB);
    });
    
    return testOrder;
  }
}

export default CustomSequencer;
