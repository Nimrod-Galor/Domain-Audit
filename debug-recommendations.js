// debug-recommendations.js
// Debug script to test actual recommendation generation

// Simulate the exact logic from audit-executor.js
function testRecommendationGeneration() {
  console.log('🔍 Testing Recommendation Generation\n');
  
  // Simulate various score scenarios
  const testCases = [
    { name: 'High UX Score', userExperience: 90 },
    { name: 'Good UX Score', userExperience: 80 },
    { name: 'Average UX Score', userExperience: 70 },
    { name: 'Poor UX Score', userExperience: 65 },
    { name: 'Very Poor UX Score', userExperience: 55 },
    { name: 'Minimum Generated UX Score', userExperience: 60 }
  ];

  testCases.forEach(testCase => {
    console.log(`📊 Testing: ${testCase.name} (Score: ${testCase.userExperience})`);
    
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

    // Exact UX recommendation logic from our fix
    if (testCase.userExperience < 60) {
      recommendations.ux.push({
        priority: 'high',
        title: 'Critical UX Issues',
        description: 'User experience requires immediate attention'
      });
    } else if (testCase.userExperience < 75) {
      recommendations.ux.push({
        priority: 'medium',
        title: 'Enhance User Experience',
        description: 'Improve navigation and user interface design'
      });
    } else if (testCase.userExperience < 85) {
      recommendations.ux.push({
        priority: 'low',
        title: 'UX Optimizations',
        description: 'Fine-tune user experience elements'
      });
    }

    console.log(`   Result: ${recommendations.ux.length} recommendations`);
    if (recommendations.ux.length > 0) {
      console.log(`   Priority: ${recommendations.ux[0].priority.toUpperCase()}`);
      console.log(`   Title: ${recommendations.ux[0].title}`);
    } else {
      console.log(`   ✅ No recommendations (score >= 85)`);
    }
    console.log('');
  });

  // Test the score generation logic
  console.log('🎲 Testing Score Generation Logic:');
  for (let i = 0; i < 5; i++) {
    const generatedScore = Math.max(60, 70 + Math.random() * 25);
    console.log(`   Generated UX Score ${i + 1}: ${Math.round(generatedScore)}`);
  }
}

// Also test if there might be an issue with the category structure
function testCategoryStructure() {
  console.log('\n🏗️ Testing Category Structure:');
  
  const mockCategoryScores = {
    seo: 75,
    technical: 80,
    performance: 85,
    accessibility: 70,
    content: 78,
    security: 90,
    mobileFriendliness: 72,
    userExperience: 65
  };

  console.log('Category Scores:');
  Object.entries(mockCategoryScores).forEach(([key, score]) => {
    console.log(`   ${key}: ${score}`);
  });

  // Test if categoryScores is properly structured
  if (mockCategoryScores.userExperience) {
    console.log(`\n✅ userExperience key exists: ${mockCategoryScores.userExperience}`);
  } else {
    console.log('\n❌ userExperience key missing!');
  }

  if (mockCategoryScores.mobileFriendliness) {
    console.log(`✅ mobileFriendliness key exists: ${mockCategoryScores.mobileFriendliness}`);
  } else {
    console.log('❌ mobileFriendliness key missing!');
  }
}

// Run tests
testRecommendationGeneration();
testCategoryStructure();

console.log('\n💡 Potential Issues:');
console.log('1. Score generation uses Math.max(60, ...) which means UX scores are always 60+');
console.log('2. UX scores between 60-74 should trigger MEDIUM recommendations');
console.log('3. If no recommendations are showing, the issue might be:');
console.log('   - Categories object structure mismatch');
console.log('   - Recommendations not being passed to template correctly');
console.log('   - Template not finding the recommendation data');
console.log('\n🔧 Check: Are recommendations being saved to the analytics object?');
