const fixedAnswerKeywords: Record<string, string> = {
  你好: '你好，我是章鱼小助手',
  你是谁: '我是章鱼小助手，由Ryan制作，你可以问我任何问题，我会尽力回答你',
}

export const getFixedAnswer = (question: string) => {
  const keywords = Object.keys(fixedAnswerKeywords)
  if (question.length < 10 && keywords.includes(question)) {
    return fixedAnswerKeywords[question]
  }

  return false
}
