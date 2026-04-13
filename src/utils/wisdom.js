/**
 * Utility for generating Daily Wisdom (Vạn Sự) advice and proverbs.
 */

const PROVERBS = [
  "Ăn quả nhớ kẻ trồng cây.",
  "Lời chào cao hơn mâm cỗ.",
  "Có công mài sắt, có ngày nên kim.",
  "Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao.",
  "Gần mực thì đen, gần đèn thì rạng.",
  "Đi một ngày đàng, học một sàng khôn.",
  "Tiên học lễ, hậu học văn.",
  "Uống nước nhớ nguồn.",
  "Tốt gỗ hơn tốt nước sơn.",
  "Lá lành đùm lá rách.",
  "Giấy rách phải giữ lấy lề.",
  "Học thầy không tày học bạn.",
  "Muốn lành nghề, chớ có nề việc khó.",
  "Cái nết đánh chết cái đẹp.",
  "Chậm mà chắc, còn hơn nhanh mà đoản.",
  "Đừng nhìn mặt mà bắt hình dong."
];

const GOOD_ADVICE = [
  "Ngày lành tháng tốt, vạn sự hanh thông, nên dốc lòng cho dự định mới.",
  "Quý nhân hiện hữu, gặp khó có người giúp, nên mở rộng các mối quan hệ.",
  "Tài lộc dồi dào, tâm trí sáng suốt, rất thích hợp cho các quyết định đầu tư.",
  "Năng lượng tích cực lan tỏa, niềm vui gõ cửa, hãy tận hưởng trọn vẹn từng phút giây.",
  "Thiên thời địa lợi, mọi sự mưu cầu đều dễ thành, hãy tự tin vào bản thân."
];

const CAUTIOUS_ADVICE = [
  "Cẩn tắc vô áy náy, nên chậm lại một nhịp để quan sát và cảm nhận.",
  "Nhẫn một chút sóng yên biển lặng, không nên tranh chấp hay vội vã lúc này.",
  "Dục tốc bất đạt, hãy kiên trì tích lũy nội lực thay vì bộc lộ ra ngoài.",
  "Tâm tĩnh thì trí sáng, nên dành thời gian chăm sóc bản thân và gia đình.",
  "Lùi một bước thấy biển rộng trời cao, hãy ưu tiên những việc ổn định thay vì mạo hiểm."
];

/**
 * Returns a deterministic piece of wisdom for a specific date
 */
export const getDailyWisdom = (date, isAuspicious) => {
  // Use day, month and year as seed for consistency
  const seed = date.getDate() + (date.getMonth() * 31) + (date.getFullYear() % 100);
  
  const quote = PROVERBS[seed % PROVERBS.length];
  const advice = isAuspicious 
    ? GOOD_ADVICE[seed % GOOD_ADVICE.length] 
    : CAUTIOUS_ADVICE[seed % CAUTIOUS_ADVICE.length];

  return { quote, advice };
};
