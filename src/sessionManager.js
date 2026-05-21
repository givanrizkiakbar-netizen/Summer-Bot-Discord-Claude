// Simpan history percakapan per user: Map<userId, {messages, systemPrompt, createdAt}>
const sessions = new Map();
const MAX_HISTORY = 20; // maks jumlah pesan (10 turn)
const SESSION_TTL = 60 * 60 * 1000; // 1 jam dalam ms

function getSession(userId) {
  const session = sessions.get(userId);
  if (!session) return null;
  // Hapus session yang sudah expired
  if (Date.now() - session.updatedAt > SESSION_TTL) {
    sessions.delete(userId);
    return null;
  }
  return session;
}

function createSession(userId, systemPrompt = null) {
  const session = {
    messages: [],
    systemPrompt,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.set(userId, session);
  return session;
}

function getOrCreateSession(userId, systemPrompt = null) {
  return getSession(userId) || createSession(userId, systemPrompt);
}

function addMessage(userId, role, content) {
  const session = getOrCreateSession(userId);
  session.messages.push({ role, content });
  session.updatedAt = Date.now();
  // Pangkas history jika terlalu panjang (jaga agar selalu berpasangan)
  if (session.messages.length > MAX_HISTORY) {
    session.messages.splice(0, 2);
  }
  return session;
}

function resetSession(userId) {
  sessions.delete(userId);
}

function setSystemPrompt(userId, systemPrompt) {
  const session = getOrCreateSession(userId);
  session.systemPrompt = systemPrompt;
  session.updatedAt = Date.now();
}

function getStats() {
  return {
    activeSessions: sessions.size,
    users: [...sessions.keys()],
  };
}

module.exports = {
  getOrCreateSession,
  addMessage,
  resetSession,
  setSystemPrompt,
  getStats,
};
