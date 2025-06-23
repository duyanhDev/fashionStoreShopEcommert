import axios from "./../untils/axios";
const PostChatBotAI = async (message) => {
  return await axios.post("api/v1/genminiAi", { message });
};

const generateBlogByGeminiAPi = async (topic, keywords, audience) => {
  return await axios.post("api/v1/generate-ai-blog", {
    topic,
    keywords,
    audience,
  });
};

export { PostChatBotAI, generateBlogByGeminiAPi };
