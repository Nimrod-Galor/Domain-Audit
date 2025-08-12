// Check recent audit results in database
import('./web/models/database.js').then(async (db) => {
  try {
    const pool = db.getPool();
    const result = await pool.query('SELECT id, domain, overall_score, overall_grade, created_at FROM audit_results ORDER BY created_at DESC LIMIT 5');
    console.log('📊 Recent audit results from database:');
    if (result.rows.length === 0) {
      console.log('No audit results found in database');
    } else {
      result.rows.forEach((row, i) => {
        console.log(`${i+1}. ${row.domain} - Score: ${row.overall_score}, Grade: ${row.overall_grade}, Date: ${row.created_at}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Database check failed:', error);
    process.exit(1);
  }
});
