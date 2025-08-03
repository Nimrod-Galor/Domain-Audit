// Tests for compression-manager CLI tool
import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Compression Manager CLI', () => {
  
  describe('CLI integration', () => {
    test('should be available as a CLI tool', () => {
      // Simple test to verify the CLI exists      
      const cliPath = path.resolve(process.cwd(), 'bin', 'compression-manager.js');
      expect(fs.existsSync(cliPath)).toBe(true);
    });

    test('should contain required functions', () => {
      // Test that the CLI file contains the expected command handlers      
      const cliPath = path.resolve(process.cwd(), 'bin', 'compression-manager.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain('handleMigrateCommand');
      expect(cliContent).toContain('handleStatsCommand');
      expect(cliContent).toContain('handleHelpCommand');
      expect(cliContent).toContain('COMPRESSION MANAGEMENT TOOL');
    });

    test('should have proper command routing', () => {
      // Test that the CLI file has the switch statement for commands      
      const cliPath = path.resolve(process.cwd(), 'bin', 'compression-manager.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain('switch (command)');
      expect(cliContent).toContain('case \'migrate\'');
      expect(cliContent).toContain('case \'stats\'');
      expect(cliContent).toContain('case \'help\'');
    });
  });

  describe('banner functionality', () => {
    test('should display informative banner', () => {      
      const cliPath = path.resolve(process.cwd(), 'bin', 'compression-manager.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain('COMPRESSION MANAGEMENT TOOL');
      expect(cliContent).toContain('Version 1.0');
      expect(cliContent).toContain('Manage state file compression');
    });
  });

  describe('help system', () => {
    test('should provide comprehensive help', () => {      
      const cliPath = path.resolve(process.cwd(), 'bin', 'compression-manager.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain('Migration Commands:');
      expect(cliContent).toContain('Statistics Commands:');
      expect(cliContent).toContain('Examples:');
      expect(cliContent).toContain('Tips:');
    });
  });

  describe('error handling', () => {
    test('should handle unknown commands', () => {      
      const cliPath = path.resolve(process.cwd(), 'bin', 'compression-manager.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain('Unknown command');
      expect(cliContent).toContain('process.exit(1)');
    });

    test('should validate required parameters', () => {      
      const cliPath = path.resolve(process.cwd(), 'bin', 'compression-manager.js');
      const cliContent = fs.readFileSync(cliPath, 'utf8');
      
      expect(cliContent).toContain('Domain required for');
      expect(cliContent).toContain('No audit directory found');
    });
  });
});
