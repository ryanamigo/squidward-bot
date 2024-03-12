import axios from 'axios'
export type QwenMessage = { role: 'user' | 'assistant', content: string}
export type QwenModel = 'qwen-turbo' | 'qwen-plus' | 'qwen-max' | 'qwen-max-1201' | 'qwen-max-longcontext'

interface Usage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

interface Message {
  role: string;
  content: string;
}
interface Choice {
  finish_reason: 'stop' | 'length' | null;
  message: Message;
}

interface Output {
  text?: any;
  finish_reason?: 'stop' | 'length' | null;
  choices: Choice[];
}

interface QwenResponse {
  status_code: number;
  request_id: string;
  code: string;
  message: string;
  output: Output;
  usage: Usage;
}

export const askQwen = async (message: QwenMessage[], qwenModel: QwenModel = 'qwen-max-1201') => {
  const { data } = await axios<QwenResponse>({
    data: message,
    method: 'post',
    url: `http://127.0.0.1:5678/qwen/${qwenModel}`,
  })
  if (data.status_code === 200) {
    const choices = data.output.choices
    const firstChoice = choices[0]
    if (firstChoice) {
      return {
        ...firstChoice.message,
        error: false,
      }
    }
  }
  return {
    content: `${data.code}: ${data.message}`,
    error: true,
    role: 'system',
  }
}
