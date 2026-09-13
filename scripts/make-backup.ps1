param (
    [string]$SourceDir = "K:\Android App Files\WebsiteS",
    [string]$PrimaryZip = "K:\Android App Files\WebsiteS\_backups\WebsiteS_Checkpoint_Backup_2026-09-13.zip",
    [string]$ParentZip = "K:\Android App Files\WebsiteS_Checkpoint_Backup_2026-09-13.zip"
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$backupDir = Split-Path -Parent $PrimaryZip
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

if (Test-Path $PrimaryZip) { Remove-Item -Force $PrimaryZip }
if (Test-Path $ParentZip) { Remove-Item -Force $ParentZip }

$dirsToSkip = @("node_modules", ".next", ".git", "_backups")
$mobileDirsToSkip = @(".dart_tool", "build")

$filesToArchive = [System.Collections.Generic.List[System.IO.FileInfo]]::new()
$dirsQueue = [System.Collections.Generic.Queue[string]]::new()
$dirsQueue.Enqueue($SourceDir)

Write-Host "Fast scanning files..."
while ($dirsQueue.Count -gt 0) {
    $currentDir = $dirsQueue.Dequeue()
    $items = Get-ChildItem -LiteralPath $currentDir -Force
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            $name = $item.Name
            # Root exclusions
            if ($currentDir -eq $SourceDir -and $dirsToSkip -contains $name) {
                continue
            }
            # Mobile exclusions
            if ($currentDir -like "*\mobile" -and $mobileDirsToSkip -contains $name) {
                continue
            }
            $dirsQueue.Enqueue($item.FullName)
        } else {
            if ($item.Extension -ne ".zip") {
                $filesToArchive.Add($item)
            }
        }
    }
}

Write-Host "Found $($filesToArchive.Count) files to archive. Creating ZIP archive..."
$zip = [System.IO.Compression.ZipFile]::Open($PrimaryZip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    $prefixLen = (Resolve-Path $SourceDir).Path.Length + 1
    foreach ($f in $filesToArchive) {
        $relPath = $f.FullName.Substring($prefixLen)
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally {
    $zip.Dispose()
}

$zipItem = Get-Item $PrimaryZip
$sizeMB = [math]::Round($zipItem.Length / 1MB, 2)
Write-Host "Successfully created primary backup: $PrimaryZip ($sizeMB MB)"

Write-Host "Copying backup to parent directory..."
Copy-Item -Path $PrimaryZip -Destination $ParentZip -Force
Write-Host "Parent backup ready: $ParentZip"
