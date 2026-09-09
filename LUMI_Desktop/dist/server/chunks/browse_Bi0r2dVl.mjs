import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { exec } from "child_process";
import { promisify } from "util";
//#region src/pages/api/workspace/browse.ts
var browse_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var execAsync = promisify(exec);
var POST = async () => {
	try {
		const { stdout } = await execAsync(`powershell.exe -NoProfile -STA -EncodedCommand ${Buffer.from(`
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = 'Select Project Folder'
$dialog.ShowNewFolderButton = $true
$result = $dialog.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    Write-Output $dialog.SelectedPath
}
`, "utf16le").toString("base64")}`);
		const selectedPath = (stdout || "").trim();
		if (selectedPath) return new Response(JSON.stringify({
			success: true,
			path: selectedPath
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
		else return new Response(JSON.stringify({
			success: false,
			cancelled: true
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({
			success: false,
			error: err?.message || "Failed to open directory dialog"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/workspace/browse@_@ts
var page = () => browse_exports;
//#endregion
export { page };
