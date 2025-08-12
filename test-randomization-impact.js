// test-randomization-impact.js
// Demonstrate the impact of randomization on scoring

console.log('🎲 Testing Scoring System Randomization Impact\n');

// Simulate the current scoring logic multiple times
function simulateScoring(iterations = 10) {
  console.log(`Running ${iterations} simulated audits for the same website:\n`);
  
  const results = [];
  
  for (let i = 1; i <= iterations; i++) {
    // Simulate fixed inputs (same website each time)
    const linkHealthScore = 75; // Fixed for same website
    const technicalBaseScore = 80; // Fixed base before randomization
    const performanceBaseScore = 70; // Fixed base before randomization
    
    // Current randomized scoring logic
    const categoryScores = {
      seo: Math.max(60, linkHealthScore - 10 + Math.random() * 20),
      technical: Math.max(40, Math.min(100, technicalBaseScore + Math.random() * 15)),
      performance: Math.max(45, Math.min(100, performanceBaseScore + Math.random() * 15)),
      accessibility: Math.max(50, 70 + Math.random() * 30),
      content: Math.max(55, 65 + Math.random() * 25),
      security: Math.max(60, 75 + Math.random() * 20),
      mobileFriendliness: Math.max(65, 80 + Math.random() * 15),
      userExperience: Math.max(60, 70 + Math.random() * 25)
    };

    // Calculate overall score
    const weights = {
      seo: 0.20,
      technical: 0.15,
      performance: 0.15,
      accessibility: 0.15,
      content: 0.15,
      security: 0.10,
      mobileFriendliness: 0.05,
      userExperience: 0.05
    };

    const overallScore = Object.entries(categoryScores).reduce((total, [category, score]) => {
      return total + (score * weights[category]);
    }, 0);

    // Assign grades
    function assignGrade(score) {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    }

    const result = {
      audit: i,
      overall: { score: Math.round(overallScore), grade: assignGrade(overallScore) },
      categories: {
        seo: { score: Math.round(categoryScores.seo), grade: assignGrade(categoryScores.seo) },
        technical: { score: Math.round(categoryScores.technical), grade: assignGrade(categoryScores.technical) },
        performance: { score: Math.round(categoryScores.performance), grade: assignGrade(categoryScores.performance) },
        accessibility: { score: Math.round(categoryScores.accessibility), grade: assignGrade(categoryScores.accessibility) },
        content: { score: Math.round(categoryScores.content), grade: assignGrade(categoryScores.content) },
        security: { score: Math.round(categoryScores.security), grade: assignGrade(categoryScores.security) },
        mobile: { score: Math.round(categoryScores.mobileFriendliness), grade: assignGrade(categoryScores.mobileFriendliness) },
        ux: { score: Math.round(categoryScores.userExperience), grade: assignGrade(categoryScores.userExperience) }
      }
    };

    results.push(result);

    console.log(`Audit ${i}: Overall ${result.overall.grade} (${result.overall.score}) | UX ${result.categories.ux.grade} (${result.categories.ux.score}) | Security ${result.categories.security.grade} (${result.categories.security.score}) | Accessibility ${result.categories.accessibility.grade} (${result.categories.accessibility.score})`);
  }

  return results;
}

// Analyze variance
function analyzeVariance(results) {
  console.log('\n📊 Variance Analysis:');
  
  const categories = ['overall', 'seo', 'technical', 'performance', 'accessibility', 'content', 'security', 'mobile', 'ux'];
  
  categories.forEach(category => {
    const scores = results.map(r => category === 'overall' ? r.overall.score : r.categories[category].score);
    const grades = results.map(r => category === 'overall' ? r.overall.grade : r.categories[category].grade);
    
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const variance = max - min;
    const uniqueGrades = [...new Set(grades)];
    
    console.log(`${category.toUpperCase()}: ${min}-${max} (±${variance} pts, avg: ${avg}) | Grades: ${uniqueGrades.join(', ')}`);
  });
}

// Test recommendation triggers
function testRecommendationTriggers(results) {
  console.log('\n🎯 Recommendation Trigger Analysis:');
  
  const uxRecommendations = results.map(result => {
    const score = result.categories.ux.score;
    if (score < 60) return 'high';
    if (score < 75) return 'medium';
    if (score < 85) return 'low';
    return 'none';
  });

  const recommendationCounts = uxRecommendations.reduce((counts, rec) => {
    counts[rec] = (counts[rec] || 0) + 1;
    return counts;
  }, {});

  console.log('UX Recommendation Triggers:');
  Object.entries(recommendationCounts).forEach(([priority, count]) => {
    const percentage = Math.round((count / results.length) * 100);
    console.log(`  ${priority.toUpperCase()}: ${count}/${results.length} audits (${percentage}%)`);
  });
}

// Run the simulation
console.log('🏢 Simulating audits for the SAME WEBSITE (identical inputs)\n');
const results = simulateScoring(10);

analyzeVariance(results);
testRecommendationTriggers(results);

console.log('\n💡 Key Insights:');
console.log('• Same website can receive different overall grades');
console.log('• UX category can vary by 25 points (C to A grades)');
console.log('• Recommendations triggered inconsistently');
console.log('• Users would see different results for identical audits');
console.log('\n🔧 This explains why testing and user experience can be unpredictable!');
