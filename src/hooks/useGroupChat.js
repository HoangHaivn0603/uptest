import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  setDoc
} from "firebase/firestore";
import { db, isFirebaseConfigured } from '../utils/firebase';

const MOCK_USERS = [
  { name: 'Anh Tuấn', avatar: '👨‍💼', color: 'text-blue-500' },
  { name: 'Chị Lan', avatar: '👩‍🎨', color: 'text-pink-500' },
  { name: 'Bác Hùng', avatar: '👴', color: 'text-amber-600' },
  { name: 'Minh Pro', avatar: '👦', color: 'text-emerald-500' },
  { name: 'Thùy Dương', avatar: '👩‍💼', color: 'text-indigo-500' },
];

const COMMUNITY_PHRASES = [
  "Chào mọi người, chúc vạn sự cát tường nhé!",
  "Hôm nay mình vừa đi khai trương, trộm vía rất thuận lợi.",
  "Mọi người thấy giá vàng hôm nay thế nào? Có nên mua vào không?",
  "Tiết trời hôm nay đẹp quá, rất hợp để đi dạo.",
  "Dạo này thấy app cập nhật nhiều tính năng hay quá.",
  "Có ai biết giờ nào đẹp để động thổ không ạ?",
  "Chúc cả nhà ngày mới hanh thông!",
  "Vừa xem qua Tử vi, hôm nay mình có lộc ăn uống :D",
  "Ai ở Hà Nội không, thời tiết đang bắt đầu se lạnh rồi đấy.",
  "Sticker này xinh quá nè! 🏮",
];

/**
 * Hook to manage Community Group Chat with Real-time Firebase support for Room 2
 * and Simulation support for Room 1.
 */
export function useGroupChat(user = null, options = {}) {
  const { roomId = 'community-1' } = options;
  const isFirebaseMode = roomId === 'community-2' && isFirebaseConfigured;
  
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnecting, setIsConnecting] = useState(isFirebaseMode);
  const bannedUsers = useRef(new Set());

  // --- Initial Messages for Simulator ---
  useEffect(() => {
    if (!isFirebaseMode) {
      setMessages([
        { id: 'sys1', role: 'system', content: 'Chào mừng bạn đến với Cộng đồng 1 - Trực tuyến.', timestamp: Date.now() - 100000 },
        { id: '1', role: 'other', sender: 'Anh Tuấn', avatar: '👨‍💼', color: 'text-blue-500', content: 'Chúc cả nhà ngày mới tốt lành!', timestamp: Date.now() - 50000 },
        { id: '2', role: 'other', sender: 'Thùy Dương', avatar: '👩‍💼', color: 'text-indigo-500', content: 'Hôm nay ngày đẹp quá các bác ạ.', timestamp: Date.now() - 10000 },
      ]);
    }
  }, [isFirebaseMode]);

  // --- Firebase Real-time Listener ---
  useEffect(() => {
    if (!isFirebaseMode) return;

    setIsConnecting(true);
    const q = query(
      collection(db, "groups", roomId, "messages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firebase timestamp to JS number
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      }));
      setMessages(msgs);
      setIsConnecting(false);
    }, (error) => {
      console.error("Firebase Chat Error:", error);
      setIsConnecting(false);
    });

    return () => unsubscribe();
  }, [isFirebaseMode, roomId]);

  // --- Simulation Engine (Only for Room 1) ---
  useEffect(() => {
    if (isFirebaseMode) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const availableUsers = MOCK_USERS.filter(u => !bannedUsers.current.has(u.name));
        if (availableUsers.length === 0) return;

        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        const randomPhrase = COMMUNITY_PHRASES[Math.floor(Math.random() * COMMUNITY_PHRASES.length)];
        
        const newMessage = {
          id: Date.now().toString(),
          role: 'other',
          sender: randomUser.name,
          avatar: randomUser.avatar,
          color: randomUser.color,
          content: randomPhrase,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev.slice(-49), newMessage]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isFirebaseMode]);

  const sendMessage = useCallback(async (content, type = 'text') => {
    if (!content.trim()) return;

    const newMessage = {
      role: 'user',
      sender: user?.name || 'Bạn',
      avatar: '👤',
      content: content,
      type: type,
      timestamp: Date.now(),
      userId: user?.id || 'anonymous'
    };

    if (isFirebaseMode) {
      try {
        await addDoc(collection(db, "groups", roomId, "messages"), {
          ...newMessage,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Error sending message to Firebase:", err);
      }
    } else {
      const msgWithId = { ...newMessage, id: Date.now().toString() };
      setMessages(prev => [...prev, msgWithId]);

      // Simulator Reaction
      setTimeout(() => {
        if (Math.random() < 0.4) {
          const availableUsers = MOCK_USERS.filter(u => !bannedUsers.current.has(u.name));
          if (availableUsers.length === 0) return;

          const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
          const reactions = ["Tuyệt quá!", "Hay đấy bạn.", "Đồng ý!", "👍", "🏮", "🧧"];
          const reaction = reactions[Math.floor(Math.random() * reactions.length)];
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'other',
            sender: randomUser.name,
            avatar: randomUser.avatar,
            color: randomUser.color,
            content: reaction,
            timestamp: Date.now(),
          }]);
        }
      }, 1500 + Math.random() * 2000);
    }
  }, [user, isFirebaseMode, roomId]);

  // --- Admin Actions ---

  const deleteMessage = useCallback(async (messageId) => {
    if (!isAdmin) return;

    if (isFirebaseMode) {
      try {
        await deleteDoc(doc(db, "groups", roomId, "messages", messageId));
      } catch (err) {
        console.error("Error deleting message from Firebase:", err);
      }
    } else {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    }
  }, [isAdmin, isFirebaseMode, roomId]);

  const banUser = useCallback(async (userName, userId) => {
    if (!isAdmin) return;

    if (isFirebaseMode && userId) {
      try {
        // In real backend, we'd add to a blacklist collection
        await setDoc(doc(db, "blacklist", userId), {
          userName,
          bannedAt: serverTimestamp(),
          bannedBy: user?.id
        });
        // Also send a system message
        await addDoc(collection(db, "groups", roomId, "messages"), {
          role: 'system',
          content: `Người dùng ${userName} đã bị chặn bởi Quản trị viên.`,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Error banning user on Firebase:", err);
      }
    } else {
      bannedUsers.current.add(userName);
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'system', content: `Đã chặn ${userName} khỏi bộ giả lập.`, timestamp: Date.now() }
      ]);
    }
  }, [isAdmin, isFirebaseMode, roomId, user]);

  const toggleAdmin = () => setIsAdmin(!isAdmin);

  return {
    messages,
    sendMessage,
    deleteMessage,
    banUser,
    isAdmin,
    toggleAdmin,
    isConnecting
  };
}
