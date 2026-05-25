import { useState, useCallback, useRef } from 'react'

const MAX_SESSION_CALLS = 25
const GEMINI_MODEL = 'gemini-1.5-flash'

/**
 * Gemini 1.5 Flash API 연동 커스텀 훅
 * - localStorage에서 API 키를 읽어 실시간 호출
 * - 세션 당 최대 25회 호출 제한 (과금 방지)
 * - API 키 없으면 null 반환 → 호출부에서 시뮬레이션 폴백
 */
export function useGemini() {
  const callCountRef = useRef(0)
  const [isLoading, setIsLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState(() => {
    return !!localStorage.getItem('GEMINI_API_KEY')
  })

  const getApiKey = useCallback(() => {
    return localStorage.getItem('GEMINI_API_KEY') || null
  }, [])

  const saveApiKey = useCallback((key) => {
    localStorage.setItem('GEMINI_API_KEY', key.trim())
    setApiStatus(true)
  }, [])

  const clearApiKey = useCallback(() => {
    localStorage.removeItem('GEMINI_API_KEY')
    setApiStatus(false)
  }, [])

  /**
   * Gemini API 호출 메인 함수
   * @returns {string|null} 응답 텍스트, API 키 없으면 null, 한도 초과 시 'LIMIT_EXCEEDED'
   */
  const callGemini = useCallback(async (systemInstruction, userPrompt) => {
    const apiKey = getApiKey()
    if (!apiKey) return null // 시뮬레이션 모드 폴백

    if (callCountRef.current >= MAX_SESSION_CALLS) {
      return 'LIMIT_EXCEEDED'
    }

    callCountRef.current += 1

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n[사용자 입력/맥락]:\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 800,
        },
      }),
    })

    const data = await response.json()

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text
    }

    throw new Error('Gemini API 응답 형식 오류: ' + JSON.stringify(data))
  }, [getApiKey])

  /**
   * 로딩 상태를 관리하며 callGemini를 래핑한 편의 함수
   */
  const generateWithLoading = useCallback(async (systemInstruction, userPrompt) => {
    setIsLoading(true)
    try {
      const result = await callGemini(systemInstruction, userPrompt)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [callGemini])

  return {
    apiStatus,        // boolean: API 키가 등록되어 있는지
    isLoading,        // boolean: 현재 API 호출 중인지
    callCount: callCountRef.current,
    maxCalls: MAX_SESSION_CALLS,
    saveApiKey,
    clearApiKey,
    getApiKey,
    callGemini,
    generateWithLoading,
  }
}
