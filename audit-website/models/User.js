/**
 * User Model
 * Handles all user-related database operations
 */
import bcrypt from 'bcryptjs';
import { query, transaction } from './database.js';

export const User = {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding user by email:', error.message);
      throw error;
    }
  },

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding user by ID:', error.message);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password (optional for OAuth)
   * @param {string} userData.firstName - First name
   * @param {string} userData.lastName - Last name
   * @param {string} userData.plan - User plan (optional, defaults to 'free')
   * @param {boolean} userData.sendVerificationEmail - Whether to send verification email (default true)
   * @returns {Promise<Object>} Created user object (without password)
   */
  async create(userData) {
    const { email, password, firstName, lastName, plan = 'free', sendVerificationEmail = true } = userData;
    
    try {
      let password_hash = null;
      
      // Only hash password if provided (OAuth users might not have passwords)
      if (password) {
        const saltRounds = 12;
        password_hash = await bcrypt.hash(password, saltRounds);
      }
      
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, plan) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, first_name, last_name, plan, created_at, email_verified`,
        [email.toLowerCase(), password_hash, firstName, lastName, plan]
      );
      
      const newUser = result.rows[0];
      
      // Send verification email for email/password users
      if (password && sendVerificationEmail) {
        try {
          const emailService = await import('../services/emailService.js');
          const token = await this.generateVerificationToken(newUser.id);
          await emailService.default.sendVerificationEmail(email, firstName, token);
          console.log(`📧 Verification email sent to: ${email}`);
          
          // Create a notification for email verification
          try {
            const { createNotification } = await import('../controllers/notificationController.js');
            await createNotification(
              newUser.id,
              'alert',
              'Email Verification Required',
              `Please verify your email address (${email}) to unlock all features and ensure account security. Check your inbox for the verification link.`
            );
            console.log(`🔔 Email verification notification created for: ${email}`);
          } catch (notificationError) {
            console.error('❌ Error creating verification notification:', notificationError.message);
            // Don't fail user creation if notification fails
          }
        } catch (emailError) {
          console.error('❌ Error sending verification email:', emailError.message);
          // Don't fail user creation if email fails
        }
      }
      
      console.log(`✅ User created: ${email}`);
      return newUser;
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('A user with this email already exists');
      }
      console.error('❌ Error creating user:', error.message);
      throw error;
    }
  },

  /**
   * Create user from OAuth provider
   * @param {Object} oauthData - OAuth provider data
   * @returns {Promise<Object>} Created user object
   */
  async createFromOAuth(oauthData) {
    const { 
      email, 
      firstName, 
      lastName, 
      provider, 
      providerId, 
      profilePhoto, 
      emailVerified = true 
    } = oauthData;
    
    try {
      const result = await query(
        `INSERT INTO users (
          email, first_name, last_name, email_verified, 
          oauth_provider, google_id, profile_photo
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, email, first_name, last_name, plan, created_at, email_verified, oauth_provider`,
        [email.toLowerCase(), firstName, lastName, emailVerified, provider, providerId, profilePhoto]
      );
      
      console.log(`✅ OAuth user created: ${email} via ${provider}`);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('A user with this email already exists');
      }
      console.error('❌ Error creating OAuth user:', error.message);
      throw error;
    }
  },

  /**
   * Verify user password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object|null>} User object (without password) or null
   */
  async verifyPassword(email, password) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const user = result.rows[0];
      
      // Check if user has a password (OAuth users might not)
      if (!user.password_hash) {
        return null;
      }
      
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        return null;
      }
      
      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Error verifying password:', error.message);
      throw error;
    }
  },

  /**
   * Update user's last login timestamp
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async updateLastLogin(userId) {
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      return true;
    } catch (error) {
      console.error('❌ Error updating last login:', error.message);
      throw error;
    }
  },

  /**
   * Update user's plan
   * @param {number} userId - User ID
   * @param {string} plan - New plan ('free', 'professional', 'business')
   * @returns {Promise<Object>} Updated user object
   */
  async updatePlan(userId, plan) {
    try {
      const result = await query(
        `UPDATE users SET plan = $1 WHERE id = $2 
         RETURNING id, email, first_name, last_name, plan, created_at, updated_at`,
        [plan, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      console.log(`✅ User plan updated: ${userId} -> ${plan}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating user plan:', error.message);
      throw error;
    }
  },

  /**
   * Update user's email verification status
   * @param {number} userId - User ID
   * @param {boolean} verified - Verification status
   * @returns {Promise<boolean>} Success status
   */
  async updateEmailVerification(userId, verified = true) {
    try {
      await query(
        'UPDATE users SET email_verified = $1 WHERE id = $2',
        [verified, userId]
      );
      console.log(`✅ Email verification updated: ${userId} -> ${verified}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating email verification:', error.message);
      throw error;
    }
  },

  /**
   * Get user statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getStats(userId) {
    try {
      const result = await query(
        `SELECT 
           COUNT(*) as total_audits,
           COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_audits,
           AVG(CASE WHEN score IS NOT NULL THEN score END)::INTEGER as average_score,
           COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as audits_this_month
         FROM audits 
         WHERE user_id = $1`,
        [userId]
      );
      
      const stats = result.rows[0];
      return {
        totalAudits: parseInt(stats.total_audits) || 0,
        completedAudits: parseInt(stats.completed_audits) || 0,
        averageScore: stats.average_score || 0,
        auditsThisMonth: parseInt(stats.audits_this_month) || 0
      };
    } catch (error) {
      console.error('❌ Error getting user stats:', error.message);
      throw error;
    }
  },

  /**
   * Generate and save verification token for user
   * @param {number} userId - User ID
   * @returns {Promise<string>} Verification token
   */
  async generateVerificationToken(userId) {
    try {
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await query(
        `UPDATE users 
         SET verification_token = $1, 
             verification_token_expires = $2, 
             verification_sent_at = NOW()
         WHERE id = $3`,
        [token, expiresAt, userId]
      );

      console.log(`✅ Verification token generated for user ${userId}`);
      return token;
    } catch (error) {
      console.error('❌ Error generating verification token:', error.message);
      throw error;
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} User object or null if invalid
   */
  async verifyEmailToken(token) {
    try {
      const result = await query(
        `UPDATE users 
         SET email_verified = true, 
             verification_token = NULL, 
             verification_token_expires = NULL
         WHERE verification_token = $1 
           AND verification_token_expires > NOW()
           AND email_verified = false
         RETURNING id, email, first_name, last_name, plan, email_verified`,
        [token]
      );

      if (result.rows.length === 0) {
        return null; // Invalid or expired token
      }

      const user = result.rows[0];
      console.log(`✅ Email verified for user: ${user.email}`);
      return user;
    } catch (error) {
      console.error('❌ Error verifying email token:', error.message);
      throw error;
    }
  },

  /**
   * Find user by verification token
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} User object or null
   */
  async findByVerificationToken(token) {
    try {
      const result = await query(
        `SELECT id, email, first_name, last_name, verification_token_expires
         FROM users 
         WHERE verification_token = $1`,
        [token]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding user by verification token:', error.message);
      throw error;
    }
  },

  /**
   * Resend verification email (generate new token)
   * @param {string} email - User email
   * @returns {Promise<string|null>} New verification token or null if user not found
   */
  async resendVerificationToken(email) {
    try {
      const user = await this.findByEmail(email);
      if (!user || user.email_verified) {
        return null;
      }

      return await this.generateVerificationToken(user.id);
    } catch (error) {
      console.error('❌ Error resending verification token:', error.message);
      throw error;
    }
  },

  /**
   * Delete user and all associated data
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(userId) {
    try {
      return await transaction(async (client) => {
        // Delete associated audits first (CASCADE should handle this, but being explicit)
        await client.query('DELETE FROM audits WHERE user_id = $1', [userId]);
        
        // Delete user
        const result = await client.query('DELETE FROM users WHERE id = $1', [userId]);
        
        if (result.rowCount === 0) {
          throw new Error('User not found');
        }
        
        console.log(`✅ User deleted: ${userId}`);
        return true;
      });
    } catch (error) {
      console.error('❌ Error deleting user:', error.message);
      throw error;
    }
  },

  /**
   * Get user count by plan
   * @returns {Promise<Object>} Plan statistics
   */
  async getPlanStats() {
    try {
      const result = await query(
        `SELECT 
           plan, 
           COUNT(*) as count
         FROM users 
         GROUP BY plan
         ORDER BY plan`
      );
      
      const stats = {};
      result.rows.forEach(row => {
        stats[row.plan] = parseInt(row.count);
      });
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting plan stats:', error.message);
      throw error;
    }
  }
};
