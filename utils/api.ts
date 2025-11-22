// import axios from "axios";
// import { Platform } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const backendHost =
//   Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

// const API = axios.create({
//   baseURL: backendHost,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// API.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export const loginUser = async (credentials: any) => {
//   console.log("Credentilas", credentials);
//   const response = await API.post("/auth/login", credentials);
//   console.log("Response", response.data);
//   return response.data; // Assuming the backend returns a token directly
// };

// export const registerUser = async (userData: any) => {
//   const response = await API.post("/auth/register", userData);
//   return response.data; // Assuming the backend returns a token directly
// };

// export const getUserProfile = async (token: string) => {
//   const response = await API.get("/auth/profile", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };

// export const getNotifications = async (token: string) => {
//   const response = await API.get("/notifications");
//   return response.data;
// };

// export const markNotificationAsRead = async (token: string, id: number) => {
//   const response = await API.post(`/notifications/${id}/read`);
//   return response.data;
// };

// export const getPriestQuestionReplies = async (
//   token: string,
//   questionId: number
// ) => {
//   const response = await API.get(`/priest-questions/${questionId}/replies`);
//   return response.data;
// };

// export const sendPriestQuestionReply = async (
//   token: string,
//   questionId: number,
//   content: string
// ) => {
//   const response = await API.post(`/priest-questions/${questionId}/replies`, {
//     content,
//   });
//   return response.data;
// };

// export const createForumPost = async (
//   token: string,
//   title: string,
//   content: string
// ) => {
//   const response = await API.post("/forum/posts", { title, content });
//   return response.data;
// };

// export const getForumPosts = async (token: any) => {
//   const response = await API.get("/forum/posts", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return response.data;
// };

// export const getForumPost = async (postId: number) => {
//   const response = await API.get(`/forum/posts/${postId}`);
//   return response.data;
// };

// export const getForumPostReplies = async (postId: number) => {
//   const response = await API.get(`/forum/posts/${postId}/replies`);
//   return response.data;
// };

// export const createForumPostReply = async (
//   token: string,
//   postId: number,
//   content: string
// ) => {
//   const response = await API.post(`/forum/posts/${postId}/replies`, {
//     content,
//   });
//   return response.data;
// };

// export const getAllChatMessages = async () => {
//   const response = await API.get("/chat");
//   return response.data;
// };

// export const sendChatMessage = async (content: string) => {
//   const response = await API.post("/chat", { content });
//   return response.data;
// };

// export const uploadFile = async (token: string, formData: FormData) => {
//   const response = await API.post("/files/upload", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// };

// export const getHolidays = async () => {
//   const response = await API.get("/holidays");
//   return response.data;
// };

// export const createNote = async (noteContent: string) => {
//   const response = await API.post("/notes", { content: noteContent });
//   return response.data;
// };

// export const getNotes = async () => {
//   const response = await API.get("/notes");
//   return response.data;
// };

// export const deleteNote = async (id: number) => {
//   const response = await API.delete(`/notes/${id}`);
//   return response.data;
// };

// export const updateNote = async (id: number, noteContent: string) => {
//   const response = await API.put(`/notes/${id}`, { content: noteContent });
//   return response.data;
// };

// export const getAllPriestQuestions = async () => {
//   const response = await API.get("/priest-questions");
//   return response.data;
// };

// export const createPriestQuestion = async (title: string, question: string) => {
//   const response = await API.post("/priest-questions", { title, question });
//   return response.data;
// };

// export const getTemples = async (lat: number, lng: number) => {
//   const response = await API.get("/temples", { params: { lat, lng } });
//   return response.data;
// };

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
  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
