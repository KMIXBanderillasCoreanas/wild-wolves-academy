import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface AcademyManualEntry {
  manualKey: string;
  title: string;
  category: string;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Servicio de Consulta Dinámica de Base de Conocimiento y Manuales Oficiales
 * Consulta primero la tabla 'academy_knowledge_base' en Supabase y hace fallback
 * al sistema de archivos 'docs/reference-books/' en el servidor.
 */
export async function searchAcademyKnowledgeBase(
  query: string,
  categoryFilter?: 'preparacion_fisica' | 'nutricion_hidratacion' | 'tactica_fiba' | 'reglamento_seguridad'
): Promise<AcademyManualEntry[]> {
  const cleanQuery = query.toLowerCase().trim();

  // 1. Consulta dinámica a Supabase
  try {
    let dbQuery = supabase
      .from('academy_knowledge_base')
      .select('*');

    if (categoryFilter) {
      dbQuery = dbQuery.eq('category', categoryFilter);
    }

    const { data, error } = await dbQuery;

    if (!error && data && data.length > 0) {
      let filtered = data;
      if (cleanQuery) {
        filtered = data.filter((item: any) =>
          item.title?.toLowerCase().includes(cleanQuery) ||
          item.content?.toLowerCase().includes(cleanQuery) ||
          item.manual_key?.toLowerCase().includes(cleanQuery)
        );
      }

      if (filtered.length > 0) {
        return filtered.map((d: any) => ({
          manualKey: d.manual_key,
          title: d.title,
          category: d.category,
          content: d.content,
          metadata: d.metadata
        }));
      }
    }
  } catch (err) {
    console.warn('Consulta a academy_knowledge_base falló, usando fallback dinámico de archivos:', err);
  }

  // 2. Fallback dinámico leyendo docs/reference-books/ en tiempo de ejecución (servidor)
  const results: AcademyManualEntry[] = [];
  try {
    const docsDir = path.join(process.cwd(), 'docs', 'reference-books');
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      for (const file of files) {
        if (file.endsWith('.md') && file.toLowerCase() !== 'readme.md') {
          const filePath = path.join(docsDir, file);
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          const titleLine = rawContent.split('\n')[0].replace(/^#\s*/, '').trim() || file;
          const category = file.includes('nutricion') ? 'nutricion_hidratacion' : 'preparacion_fisica';

          if (!categoryFilter || categoryFilter === category) {
            if (!cleanQuery || rawContent.toLowerCase().includes(cleanQuery) || titleLine.toLowerCase().includes(cleanQuery)) {
              results.push({
                manualKey: file.replace('.md', ''),
                title: titleLine,
                category,
                content: rawContent
              });
            }
          }
        }
      }
    }
  } catch (fsErr) {
    console.warn('Error leyendo docs/reference-books localmente:', fsErr);
  }

  return results;
}
