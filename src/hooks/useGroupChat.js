import { useState, useCallback, useEffect, useRef } from 'react';

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
 * Hook to manage Community Group Chat with a "Social Simulator".
 */
export function useGroupChat(user = null, appData = {}) {
  const [messages, setMessages] = useState([
    { id: 'sys1', role: 'system', content: 'Chào mừng bạn đến với Cộng đồng LichViet.', timestamp: Date.now() - 100000 },
    { id: '1', role: 'other', sender: 'Anh Tuấn', avatar: '👨‍💼', color: 'text-blue-500', content: 'Chúc cả nhà ngày mới tốt lành!', timestamp: Date.now() - 50000 },
    { id: '2', role: 'other', sender: 'Thùy Dương', avatar: '👩‍💼', color: 'text-indigo-500', content: 'Hôm nay ngày đẹp quá các bác ạ.', timestamp: Date.now() - 10000 },
  ]);

  const lastSimulationTime = useRef(Date.now());

  // Simulation Engine: Add a message from a random user every 30-60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance to add a message every interval check (10s)
      if (Math.random() < 0.3) {
        const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
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
        
        setMessages(prev => [...prev.slice(-49), newMessage]); // Keep last 50
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback((content, type = 'text') => {
    if (!content.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      role: 'user',
      sender: user?.name || 'Bạn',
      avatar: '👤',
      content: content,
      type: type, // 'text' or 'sticker'
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Small chance of an immediate "other user" reaction
    setTimeout(() => {
      if (Math.random() < 0.4) {
        const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
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
  }, [user]);

  return {
    messages,
    sendMessage
  };
}
