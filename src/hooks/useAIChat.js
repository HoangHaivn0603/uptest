import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing AI Chat logic with a "Traditional & Formal" personality.
 */
export function useAIChat(appData = {}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Kính chào quý bạn. Tôi là Trợ lý LichAssistant, xin được đồng hành và giải đáp các thắc mắc về thời gian, tài chính và vận hạn của quý bạn trong ngày hôm nay. Tôi có thể giúp gì cho quý bạn?',
      timestamp: Date.now(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Helper to generate a response based on keywords and context
  const generateResponse = useCallback((input) => {
    const text = input.toLowerCase();
    const { weather, goldPrices, exchangeRates, todayDetails } = appData;

    // 1. Weather
    if (text.includes('thời tiết') || text.includes('nhiệt độ')) {
      if (weather && weather.current) {
        const temp = Math.round(weather.current.temperature_2m);
        return `Kính thưa quý bạn, tiết trời hiện tại đang ở mức ${temp}°C. ${temp > 30 ? 'Trời khá oi bức, quý bạn lưu ý giữ gìn sức khỏe.' : 'Tiết trời khá dễ chịu, thuận lợi cho việc đi lại.'}`;
      }
      return 'Kính thưa quý bạn, hiện tôi chưa cập nhật được thông tin khí tượng tại vị trí của bạn. Xin thứ lỗi.';
    }

    // 2. Gold Prices
    if (text.includes('giá vàng') || text.includes('vàng sjc')) {
      if (goldPrices && goldPrices.length > 0) {
        const sjc = goldPrices.find(g => g.name.includes('SJC')) || goldPrices[0];
        return `Thưa quý bạn, giá vàng SJC hiện đang giao dịch ở mức mua vào ${sjc.buy} và bán ra ${sjc.sell} (nghìn đồng/lượng). Thị trường đang có dấu hiệu ${sjc.trend === 'up' ? 'hưng thịnh' : 'bình ổn'}.`;
      }
      return 'Thưa quý bạn, thông tin ngân khố và giá vàng hiện đang được cập nhật, quý bạn vui lòng đợi trong giây lát.';
    }

    // 3. Today's Date / Good-Bad Day
    if (text.includes('hôm nay') || text.includes('ngày mấy') || text.includes('tốt không')) {
      if (todayDetails) {
        const { lunar, truc } = todayDetails;
        const isGood = ['Kiến', 'Mãn', 'Thành', 'Khai'].includes(truc);
        return `Hôm nay là ngày ${lunar.date} tháng ${lunar.month} năm ${lunar.canChiYear}. Chiếu theo Thập Nhị Trực, đây là trực ${truc}, ${isGood ? 'một ngày khá cát lành' : 'quý bạn nên thận trọng'} cho các việc trọng đại.`;
      }
    }

    // 4. Greetings
    if (text.includes('chào') || text.includes('hi') || text.includes('hello')) {
      return 'Kính chào quý bạn. Chúc quý bạn một ngày vạn sự cát tường, hanh thông.';
    }

    // 5. Default
    return 'Xin lỗi quý bạn, ý tứ của bạn quá sâu xa, tôi chưa kịp thấu hiểu. Quý bạn có thể hỏi về giá vàng, thời tiết hoặc xem ngày tốt xấu được chăng?';
  }, [appData]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate AI response
    setIsTyping(true);
    
    // Artificial delay for realism
    setTimeout(() => {
      const responseContent = generateResponse(text);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  }, [generateResponse]);

  return {
    messages,
    isTyping,
    sendMessage
  };
}
