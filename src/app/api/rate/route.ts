import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  const { problemId, isHelpful } = await req.json()
  
  // Use a random session ID (can be improved with cookies)
  const sessionId = uuidv4()
  
  await sql`
    INSERT INTO problem_ratings (problem_id, session_id, is_helpful)
    VALUES (${problemId}, ${sessionId}, ${isHelpful})
    ON CONFLICT (problem_id, session_id) DO NOTHING
  `
  
  if (isHelpful) {
    await sql`UPDATE problems SET helpful_count = helpful_count + 1 WHERE id = ${problemId}`
  } else {
    await sql`UPDATE problems SET not_helpful_count = not_helpful_count + 1 WHERE id = ${problemId}`
  }
  
  return NextResponse.json({ ok: true })
}
