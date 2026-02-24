import sql from '@/lib/db'
import ProblemForm from '@/components/ProblemForm'

type Category = {
  id: string
  name: string
  slug: string
}

type Tag = {
  id: string
  name: string
  slug: string
}

export default async function NewProblem() {
  let categories: Category[] = []
  let tags: Tag[] = []

  try {
    const [fetchedCategories, fetchedTags] = await Promise.all([
      sql`SELECT id, name, slug FROM categories ORDER BY name`,
      sql`SELECT id, name, slug FROM tags ORDER BY name`,
    ]) as [Category[], Tag[]]

    categories = fetchedCategories
    tags = fetchedTags
  } catch (error) {
    console.error('Error fetching categories or tags:', error)
    categories = []
    tags = []
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">เพิ่มปัญหาใหม่</h1>
        <p className="text-slate-500 text-sm">
          กรอกรายละเอียดปัญหาและวิธีแก้ไข
        </p>
      </div>

      <ProblemForm categories={categories} tags={tags} />
    </div>
  )
}