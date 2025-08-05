-- Create audits table
CREATE TABLE IF NOT EXISTS audits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('simple', 'full')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  report_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  duration_ms INTEGER,
  pages_scanned INTEGER DEFAULT 0,
  external_links_checked INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_type ON audits(type);
CREATE INDEX IF NOT EXISTS idx_audits_url ON audits(url);

-- Create composite index for user audits by date
CREATE INDEX IF NOT EXISTS idx_audits_user_created ON audits(user_id, created_at DESC);

-- Create GIN index for JSONB report_data for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_audits_report_data ON audits USING GIN(report_data);
