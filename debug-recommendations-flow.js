// debug-recommendations-flow.js
// Debug the full recommendations generation flow

console.log('🔍 Debugging Recommendations Flow\n');

// Test category scores that should trigger recommendations
const testCategoryScores = {
  seo: 75,               // Should trigger low priority (< 85)
  technical: 70,         // Should trigger medium priority (< 75) 
  performance: 65,       // Should trigger medium priority (< 75)
  accessibility: 70,     // Should trigger medium priority (< 75)
  content: 80,          // Should trigger medium priority (< 85)
  security: 75,         // Should trigger high priority (< 80)
  mobileFriendliness: 70, // Should trigger high priority (< 70 triggers high)
  userExperience: 72     // Should trigger medium priority (< 75)
};

console.log('📊 Test Category Scores:');
Object.entries(testCategoryScores).forEach(([category, score]) => {
  console.log(`  ${category}: ${score}`);
});

// Mock the generateDetailedRecommendations method logic
function mockGenerateDetailedRecommendations(stateData, categoryScores) {
  const recommendations = {
    seo: [],
    technical: [],
    performance: [],
    accessibility: [],
    content: [],
    security: [],
    mobile: [],
    ux: []
  };

  console.log('\n🧪 Testing Recommendation Logic:');

  // UX Recommendations (focus on the main issue)
  console.log(`UX Score: ${categoryScores.userExperience}`);
  if (categoryScores.userExperience < 60) {
    recommendations.ux.push({
      priority: 'high',
      title: 'Critical UX Issues',
      description: 'User experience requires immediate attention'
    });
    console.log('  ✅ Added HIGH priority UX recommendation');
  } else if (categoryScores.userExperience < 75) {
    recommendations.ux.push({
      priority: 'medium',
      title: 'Enhance User Experience',
      description: 'Improve navigation and user interface design'
    });
    console.log('  ✅ Added MEDIUM priority UX recommendation');
  } else if (categoryScores.userExperience < 85) {
    recommendations.ux.push({
      priority: 'low',
      title: 'UX Optimizations',
      description: 'Fine-tune user experience elements'
    });
    console.log('  ✅ Added LOW priority UX recommendation');
  } else {
    console.log('  ✅ No UX recommendations (score >= 85)');
  }

  // Test other categories
  if (categoryScores.security < 80) {
    recommendations.security.push({
      priority: 'high',
      title: 'Implement HTTPS',
      description: 'Secure your website with SSL certificate'
    });
    console.log('  ✅ Added HIGH priority Security recommendation');
  }

  if (categoryScores.technical < 75) {
    recommendations.technical.push({
      priority: 'medium',
      title: 'Optimize Technical Performance',
      description: 'Improve technical implementation'
    });
    console.log('  ✅ Added MEDIUM priority Technical recommendation');
  }

  return recommendations;
}

// Test the recommendation generation
const mockStateData = {
  visited: { 'https://test.com': {} },
  badRequests: {},
  externalLinks: {},
  stats: {}
};

const recommendations = mockGenerateDetailedRecommendations(mockStateData, testCategoryScores);

console.log('\n📋 Generated Recommendations Summary:');
Object.entries(recommendations).forEach(([category, recs]) => {
  if (recs.length > 0) {
    console.log(`  ${category}: ${recs.length} recommendations`);
    recs.forEach((rec, index) => {
      console.log(`    ${index + 1}. ${rec.priority.toUpperCase()}: ${rec.title}`);
    });
  } else {
    console.log(`  ${category}: No recommendations`);
  }
});

// Test what the risk assessment structure should look like
console.log('\n🎯 Expected Risk Assessment Structure:');
const expectedRiskAssessment = {
  risks: [],
  recommendations: recommendations
};

console.log('Risk Assessment Keys:', Object.keys(expectedRiskAssessment));
console.log('Recommendations Keys:', Object.keys(expectedRiskAssessment.recommendations));
console.log('UX Recommendations Count:', expectedRiskAssessment.recommendations.ux.length);

console.log('\n💡 If this shows recommendations but the web interface doesn\'t,');
console.log('   the issue is likely in the risk assessment method or data flow.');
