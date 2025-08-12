// In-memory shared state for tests and test-only API routes
// This module is only used under NODE_ENV === 'test'

const state = {
  usersById: new Map(),
  usersByEmail: new Map(),
  auditsById: new Map(),
  resetTokens: new Map(), // userId -> token info { token, expiresAt }
  verificationTokens: new Map(), // userId -> token
  loginFailures: new Map(), // email -> count
  passwordResetRequests: new Map(), // email -> count
  invalidatedTokens: new Set(), // bearer tokens
  nextAuditId: 1000,
};

function reset() {
  state.usersById.clear();
  state.usersByEmail.clear();
  state.auditsById.clear();
  state.resetTokens.clear();
  state.verificationTokens.clear();
  state.loginFailures.clear();
  state.passwordResetRequests.clear();
  state.invalidatedTokens.clear();
  state.nextAuditId = 1000;
}

function registerUser(user) {
  const u = { ...user };
  state.usersById.set(u.id, u);
  if (u.email) state.usersByEmail.set(u.email.toLowerCase(), u);
  return u;
}

function getUserById(id) {
  return state.usersById.get(id) || null;
}

function getUserByEmail(email) {
  if (!email) return null;
  return state.usersByEmail.get(String(email).toLowerCase()) || null;
}

function upsertAudit(audit) {
  const a = { ...audit };
  if (!a.id) {
    a.id = state.nextAuditId++;
  }
  state.auditsById.set(a.id, a);
  return a;
}

function getAuditById(id) {
  return state.auditsById.get(Number(id)) || null;
}

function deleteAudit(id) {
  return state.auditsById.delete(Number(id));
}

function listAuditsByUser(userId, { status } = {}) {
  const list = [];
  for (const audit of state.auditsById.values()) {
    if (audit.user_id === userId) {
      if (!status || audit.status === status) list.push(audit);
    }
  }
  // Newest first by created_at
  return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function setResetToken(userId, token, expiresAt) {
  state.resetTokens.set(userId, { token, expiresAt });
}

function getResetToken(userId) {
  return state.resetTokens.get(userId) || null;
}

function setVerificationToken(userId, token) {
  state.verificationTokens.set(userId, token);
}

function getVerificationToken(userId) {
  return state.verificationTokens.get(userId) || null;
}

export default {
  state,
  reset,
  registerUser,
  getUserById,
  getUserByEmail,
  upsertAudit,
  getAuditById,
  deleteAudit,
  listAuditsByUser,
  setResetToken,
  getResetToken,
  setVerificationToken,
  getVerificationToken,
};
