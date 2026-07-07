/**
 * ============================================================================
 * Database Endpoint Test Script - IRCA Platform
 * ============================================================================
 * Comprehensive testing of all tracker database endpoints
 * ============================================================================
 */

import { 
  initializeSobrietyTracker,
  getAllSobrietyTrackers,
  getSobrietyTracker,
  updateSobrietyTracker,
  stopSobrietyTracker,
  recordRelapse,
  updateSobrietyStreaks,
  getUserMilestones,
  getUserGoals,
  createUserGoal,
  getDailyTrackingLogs,
  createDailyTrackingLog
} from '../services/profileTrackerService';

// Test configuration
const TEST_USER_ID = 'test-user-123';
const TEST_ADDICTION_TYPE = 'alcohol';
const TEST_DAILY_COST = 500;

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

class DatabaseEndpointTester {
  private results: TestResult[] = [];
  private testTrackerId: string | null = null;

  // Helper to log test results
  private logResult(testName: string, success: boolean, message: string, data?: any, error?: any) {
    const result: TestResult = { testName, success, message, data, error };
    this.results.push(result);
    console.log(`[${success ? 'PASS' : 'FAIL'}] ${testName}: ${message}`);
    if (error) console.error('Error details:', error);
    if (data) console.log('Response data:', data);
  }

  // Test 1: Initialize Sobriety Tracker
  async testInitializeTracker() {
    try {
      const response = await initializeSobrietyTracker(
        TEST_USER_ID,
        TEST_ADDICTION_TYPE,
        new Date().toISOString(),
        TEST_DAILY_COST
      );
      
      if (response.success) {
        this.testTrackerId = response.data?.trackerId;
        this.logResult(
          'Initialize Sobriety Tracker',
          true,
          'Tracker created successfully',
          response.data
        );
      } else {
        this.logResult(
          'Initialize Sobriety Tracker',
          false,
          response.message || 'Failed to create tracker',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Initialize Sobriety Tracker',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 2: Get All Trackers
  async testGetAllTrackers() {
    try {
      const response = await getAllSobrietyTrackers(TEST_USER_ID);
      
      if (response.success) {
        this.logResult(
          'Get All Trackers',
          true,
          `Found ${response.data?.length || 0} trackers`,
          response.data
        );
      } else {
        this.logResult(
          'Get All Trackers',
          false,
          response.message || 'Failed to get trackers',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Get All Trackers',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 3: Get Specific Tracker
  async testGetSpecificTracker() {
    try {
      const response = await getSobrietyTracker(TEST_USER_ID, TEST_ADDICTION_TYPE);
      
      if (response.success) {
        this.logResult(
          'Get Specific Tracker',
          true,
          'Tracker retrieved successfully',
          response.data
        );
      } else {
        this.logResult(
          'Get Specific Tracker',
          false,
          response.message || 'Failed to get tracker',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Get Specific Tracker',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 4: Update Tracker Status (Pause/Start)
  async testUpdateTrackerStatus() {
    try {
      // First pause the tracker
      const pauseResponse = await updateSobrietyTracker(TEST_USER_ID, TEST_ADDICTION_TYPE, false);
      
      if (pauseResponse.success) {
        this.logResult(
          'Update Tracker Status (Pause)',
          true,
          'Tracker paused successfully',
          pauseResponse.data
        );
      } else {
        this.logResult(
          'Update Tracker Status (Pause)',
          false,
          pauseResponse.message || 'Failed to pause tracker',
          null,
          pauseResponse.error
        );
      }

      // Then start the tracker again
      const startResponse = await updateSobrietyTracker(TEST_USER_ID, TEST_ADDICTION_TYPE, true);
      
      if (startResponse.success) {
        this.logResult(
          'Update Tracker Status (Start)',
          true,
          'Tracker started successfully',
          startResponse.data
        );
      } else {
        this.logResult(
          'Update Tracker Status (Start)',
          false,
          startResponse.message || 'Failed to start tracker',
          null,
          startResponse.error
        );
      }
    } catch (error) {
      this.logResult(
        'Update Tracker Status',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 5: Create Daily Tracking Log
  async testCreateDailyLog() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await createDailyTrackingLog(
        TEST_USER_ID,
        TEST_ADDICTION_TYPE,
        today,
        true,
        false,
        [],
        'Feeling good today'
      );
      
      if (response.success) {
        this.logResult(
          'Create Daily Tracking Log',
          true,
          'Daily log created successfully',
          response.data
        );
      } else {
        this.logResult(
          'Create Daily Tracking Log',
          false,
          response.message || 'Failed to create daily log',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Create Daily Tracking Log',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 6: Get Daily Tracking Logs
  async testGetDailyLogs() {
    try {
      const response = await getDailyTrackingLogs(TEST_USER_ID, '', '');
      
      if (response.success) {
        this.logResult(
          'Get Daily Tracking Logs',
          true,
          `Found ${response.data?.length || 0} daily logs`,
          response.data
        );
      } else {
        this.logResult(
          'Get Daily Tracking Logs',
          false,
          response.message || 'Failed to get daily logs',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Get Daily Tracking Logs',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 7: Record Relapse
  async testRecordRelapse() {
    try {
      const response = await recordRelapse(
        TEST_USER_ID,
        TEST_ADDICTION_TYPE,
        new Date().toISOString(),
        ['Stress', 'Social pressure'],
        'Was at a party and felt pressured'
      );
      
      if (response.success) {
        this.logResult(
          'Record Relapse',
          true,
          'Relapse recorded successfully',
          response.data
        );
      } else {
        this.logResult(
          'Record Relapse',
          false,
          response.message || 'Failed to record relapse',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Record Relapse',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 8: Update Sobriety Streaks
  async testUpdateStreaks() {
    try {
      const response = await updateSobrietyStreaks(TEST_USER_ID);
      
      if (response.success) {
        this.logResult(
          'Update Sobriety Streaks',
          true,
          'Streaks updated successfully',
          response.data
        );
      } else {
        this.logResult(
          'Update Sobriety Streaks',
          false,
          response.message || 'Failed to update streaks',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Update Sobriety Streaks',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 9: Create User Goal
  async testCreateUserGoal() {
    try {
      const response = await createUserGoal(TEST_USER_ID, {
        goal_type: 'sobriety',
        goal_description: 'Stay sober for 30 days',
        target_value: 30,
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress_unit: 'days'
      });
      
      if (response.success) {
        this.logResult(
          'Create User Goal',
          true,
          'Goal created successfully',
          response.data
        );
      } else {
        this.logResult(
          'Create User Goal',
          false,
          response.message || 'Failed to create goal',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Create User Goal',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 10: Get User Goals
  async testGetUserGoals() {
    try {
      const response = await getUserGoals(TEST_USER_ID);
      
      if (response.success) {
        this.logResult(
          'Get User Goals',
          true,
          `Found ${response.data?.length || 0} goals`,
          response.data
        );
      } else {
        this.logResult(
          'Get User Goals',
          false,
          response.message || 'Failed to get goals',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Get User Goals',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 11: Get User Milestones
  async testGetUserMilestones() {
    try {
      const response = await getUserMilestones(TEST_USER_ID);
      
      if (response.success) {
        this.logResult(
          'Get User Milestones',
          true,
          `Found ${response.data?.length || 0} milestones`,
          response.data
        );
      } else {
        this.logResult(
          'Get User Milestones',
          false,
          response.message || 'Failed to get milestones',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Get User Milestones',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Test 12: Stop Tracker
  async testStopTracker() {
    try {
      if (!this.testTrackerId) {
        this.logResult(
          'Stop Tracker',
          false,
          'No tracker ID available to stop'
        );
        return;
      }

      const response = await stopSobrietyTracker(this.testTrackerId);
      
      if (response.success) {
        this.logResult(
          'Stop Tracker',
          true,
          'Tracker stopped successfully',
          response.data
        );
      } else {
        this.logResult(
          'Stop Tracker',
          false,
          response.message || 'Failed to stop tracker',
          null,
          response.error
        );
      }
    } catch (error) {
      this.logResult(
        'Stop Tracker',
        false,
        'Exception occurred',
        null,
        error
      );
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Database Endpoint Tests...\n');
    
    await this.testInitializeTracker();
    await this.testGetAllTrackers();
    await this.testGetSpecificTracker();
    await this.testUpdateTrackerStatus();
    await this.testCreateDailyLog();
    await this.testGetDailyLogs();
    await this.testRecordRelapse();
    await this.testUpdateStreaks();
    await this.testCreateUserGoal();
    await this.testGetUserGoals();
    await this.testGetUserMilestones();
    await this.testStopTracker();
    
    this.printSummary();
  }

  // Print test summary
  private printSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  • ${result.testName}: ${result.message}`);
      });
    }
    
    console.log('\n🎯 Database Endpoint Testing Complete!');
  }
}

// Export the tester for use in the application
export const databaseTester = new DatabaseEndpointTester();

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined') {
  databaseTester.runAllTests().catch(console.error);
}
