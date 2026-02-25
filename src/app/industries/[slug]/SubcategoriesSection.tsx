// app/categories/[slug]/SubcategoriesSection.tsx
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface SubcategoriesSectionProps {
  parentIndustryId: string;
}

async function getSubcategories(parentId: string) {
  try {
    const { data, error } = await supabase
      .from('industries')
      .select('id, name, slug, company_count')
      .eq('parent_industry_id', parentId)
      .order('display_order', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
}

export default async function SubcategoriesSection({ 
  parentIndustryId 
}: SubcategoriesSectionProps) {
  const subcategories = await getSubcategories(parentIndustryId);

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white border-b border-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Browse by Specialization
        </h2>
        <div className="flex flex-wrap gap-3">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/categories/${sub.slug}`}
              className="px-4 py-2 bg-gray-100 hover:bg-indigo-100 rounded-full text-sm font-medium text-gray-700 hover:text-primary-hover transition-colors"
            >
              {sub.name} ({sub.company_count || 0})
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}