(function () {
  const PENDING_KEY = "mr-barron-results-pending";

  function normalise(payload) {
    const now = new Date();
    const attempts = Number(payload.attempts || 0);
    const correct = Number(payload.correct || 0);
    return {
      Timestamp: payload.timestamp || now.toISOString(),
      Game: payload.game || "",
      PlayerName: payload.playerName || payload.name || "",
      ClassLevel: payload.classLevel || payload.ClassLevel || "",
      Score: Number(payload.score || payload.totalScore || 0),
      Correct: correct,
      Attempts: attempts,
      Accuracy: attempts ? Math.round((correct / attempts) * 100) : Number(payload.accuracy || 0),
      BestStreak: Number(payload.bestStreak || 0),
      Level: Number(payload.level || 0),
      AdditionScore: Number(payload.additionScore || 0),
      SubtractionScore: Number(payload.subtractionScore || 0),
      MultiplicationScore: Number(payload.multiplicationScore || 0),
      DivisionScore: Number(payload.divisionScore || 0),
      AdditionCorrect: Number(payload.additionCorrect || 0),
      SubtractionCorrect: Number(payload.subtractionCorrect || 0),
      MultiplicationCorrect: Number(payload.multiplicationCorrect || 0),
      DivisionCorrect: Number(payload.divisionCorrect || 0),
      DurationSeconds: Number(payload.durationSeconds || 60),
      SourceUrl: window.location.href,
    };
  }

  function savePending(row) {
    const pending = loadPending();
    pending.push(row);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending.slice(-200)));
  }

  function loadPending() {
    try {
      const saved = JSON.parse(localStorage.getItem(PENDING_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function send(row) {
    const endpoint = (window.CLASSROOM_RESULTS_ENDPOINT || "").trim();
    if (!endpoint) {
      savePending(row);
      return { queued: true, reason: "No results endpoint set yet." };
    }

    const body = JSON.stringify(row);
    fetch(endpoint, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => savePending(row));

    return { sent: true };
  }

  window.ClassroomResults = {
    record(payload) {
      const row = normalise(payload);
      return send(row);
    },
    pending: loadPending,
  };
})();
