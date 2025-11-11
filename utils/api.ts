export const API_BASE = "http://10.0.2.2:8080"; // на Android-эмуляторе; для Expo на ПК/ios - localhost

type LoginReq = { email: string; password: string };
type RegisterReq = {
  email: string;
  password: string;
  name: string;
  phone: string;
  isFileUploaded: boolean;
};

async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  if (res.status === 200 && path.startsWith("/auth")) {
    return res.text(); // токен как plain text
  }
  return res.json().catch(() => null);
}

export async function registerUser(body: RegisterReq) {
  return request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function loginUser(body: LoginReq) {
  const res = await fetch(API_BASE + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 200) {
    return res.text();
  }
  return null;
}

export async function getTemples(lat: number, lng: number) {
  return request(`/temples?lat=${lat}&lng=${lng}`);
}

// Forum API
export async function getForumPosts(token: string) {
  return request("/forum", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createForumPost(
  token: string,
  title: string,
  content: string
) {
  return request("/forum", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
}

export async function getForumPostMessages(token: string, postId: number) {
  return request(`/forum/${postId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendForumPostMessage(
  token: string,
  postId: number,
  content: string
) {
  return request(`/forum/${postId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
}

// Priest Questions API
export async function getPriestQuestions(token: string) {
  return request("/priest-questions", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPriestQuestion(
  token: string,
  title: string,
  question: string
) {
  return request("/priest-questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, question }),
  });
}

export async function getPriestQuestionReplies(
  token: string,
  questionId: number
) {
  return request(`/priest-questions/${questionId}/replies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendPriestQuestionReply(
  token: string,
  questionId: number,
  content: string
) {
  return request(`/priest-questions/${questionId}/replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
}

// Chat API
export async function getChatMessages(token: string) {
  return request("/chat", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendChatMessage(token: string, content: string) {
  return request("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
}

export async function getUserProfile(token: string) {
  return request("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function likeForumPost(token: string, postId: number) {
  return request(`/forum/${postId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function dislikeForumPost(token: string, postId: number) {
  return request(`/forum/${postId}/dislike`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function likeForumPostMessage(
  token: string,
  postId: number,
  messageId: number
) {
  return request(`/forum/${postId}/messages/${messageId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function dislikeForumPostMessage(
  token: string,
  postId: number,
  messageId: number
) {
  return request(`/forum/${postId}/messages/${messageId}/dislike`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getNotifications(token: string) {
  return request("/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getUnreadNotifications(token: string) {
  return request("/notifications/unread", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function markNotificationAsRead(
  token: string,
  notificationId: number
) {
  return request(`/notifications/${notificationId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getNotes(token: string) {
  return request("/notes", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createNote(token: string, content: string) {
  return request("/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
}

export async function getHolidays(token: string) {
  return request("/holidays", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadFile(token: string, file: any) {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(API_BASE + "/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}
