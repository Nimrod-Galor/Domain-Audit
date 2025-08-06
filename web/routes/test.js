/**
 * Test routes for debugging audit functionality
 */
import express from 'express';

const router = express.Router();

// Import the active sessions from audit controller
import { activeSessions } from '../controllers/auditController.js';

/**
 * Get session diagnostics
 */
router.get('/sessions', (req, res) => {
    const sessions = [];
    
    for (const [sessionId, session] of activeSessions.entries()) {
        sessions.push({
            sessionId,
            status: session.status,
            url: session.url,
            timestamp: session.timestamp,
            auditId: session.auditId,
            age: Date.now() - new Date(session.timestamp).getTime()
        });
    }
    
    res.json({
        totalSessions: activeSessions.size,
        sessions: sessions.slice(-10), // Last 10 sessions
        serverTime: new Date().toISOString()
    });
});

/**
 * Get specific session details
 */
router.get('/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({
            error: 'Session not found',
            sessionId,
            availableSessions: Array.from(activeSessions.keys()).slice(-5)
        });
    }
    
    res.json({
        sessionId,
        session,
        age: Date.now() - new Date(session.timestamp).getTime(),
        serverTime: new Date().toISOString()
    });
});

/**
 * Test connectivity to external URLs
 */
router.get('/connectivity', async (req, res) => {
    const testUrl = req.query.url;
    
    if (!testUrl) {
        return res.status(400).json({ error: 'URL parameter required' });
    }
    
    try {
        const startTime = Date.now();
        const response = await fetch(testUrl, {
            method: 'HEAD',
            timeout: 10000
        });
        const duration = Date.now() - startTime;
        
        res.json({
            url: testUrl,
            status: response.status,
            statusText: response.statusText,
            duration,
            headers: Object.fromEntries(response.headers.entries())
        });
    } catch (error) {
        res.status(500).json({
            url: testUrl,
            error: error.message,
            type: error.constructor.name
        });
    }
});

export default router;
