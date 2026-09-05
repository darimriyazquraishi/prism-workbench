import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const filename = params.filename;

  if (!filename) {
    return new Response(JSON.stringify({ error: 'Filename is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const cleanFilename = filename.replace(/^Generated\//, '');
  let contentType = 'application/octet-stream';

  if (cleanFilename.endsWith('.pptx')) {
    contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  } else if (cleanFilename.endsWith('.docx')) {
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (cleanFilename.endsWith('.xlsx')) {
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  } else if (cleanFilename.endsWith('.py')) {
    contentType = 'text/x-python;charset=utf-8';
  }

  return new Response(`Deliverable file payload for ${cleanFilename}`, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${cleanFilename}"`
    }
  });
};
