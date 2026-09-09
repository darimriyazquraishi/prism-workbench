import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    // PowerShell script to launch native Windows FolderBrowserDialog
    const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'Select Project Folder'
$dialog.ShowNewFolderButton = $true
$result = $dialog.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    Write-Output $dialog.SelectedPath
}
`;
    const b64 = Buffer.from(psScript, 'utf16le').toString('base64');
    const { stdout } = await execAsync(`powershell.exe -NoProfile -STA -EncodedCommand ${b64}`);
    const selectedPath = (stdout || '').trim();

    if (selectedPath) {
      return new Response(JSON.stringify({
        success: true,
        path: selectedPath
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        cancelled: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Failed to open directory dialog'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
