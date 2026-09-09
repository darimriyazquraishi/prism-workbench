import type { APIRoute } from 'astro';
import { getAllDocuments, getDocumentById } from '../../../services/db/documentDb';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (id) {
      const doc = getDocumentById(id);
      if (!doc) {
        return new Response(JSON.stringify({ success: false, error: 'Document not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true, document: doc }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const docs = getAllDocuments();
    return new Response(JSON.stringify({ success: true, documents: docs, count: docs.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
