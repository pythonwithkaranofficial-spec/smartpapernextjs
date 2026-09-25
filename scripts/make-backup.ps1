param (
    [string]$SourceDir = "K:\Android App Files\WebsiteS",
    [string]$DateTag = (Get-Date -Format "yyyy-MM-dd"),
    [string]$PrimaryZip = "",
    [string]$ParentZip = ""
)

if ([string]::IsNullOrWhiteSpace($PrimaryZip)) {
    $PrimaryZip = Join-Path $SourceDir "_backups\WebsiteS_Checkpoint_Backup_$DateTag.zip"
}
if ([string]::IsNullOrWhiteSpace($ParentZip)) {
    $parentDir = Split-Path -Parent $SourceDir
    $ParentZip = Join-Path $parentDir "WebsiteS_Checkpoint_Backup_$DateTag.zip"
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$backupDir = Split-Path -Parent $PrimaryZip
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

if (Test-Path $PrimaryZip) { Remove-Item -Force $PrimaryZip }
if (Test-Path $ParentZip) { Remove-Item -Force $ParentZip }

# Folders to skip at any depth
$dirsToSkip = @(
    "node_modules",
    ".next",
    ".git",
    "_backups",
    ".dart_tool",
    "build",
    ".gradle",
    ".kotlin",
    "coverage",
    ".idea"
)

# File extensions to skip
$extensionsToSkip = @(".zip", ".tar.gz", ".keystore", ".jks")

$filesToArchive = [System.Collections.Generic.List[System.IO.FileInfo]]::new()
$dirsQueue = [System.Collections.Generic.Queue[string]]::new()
$dirsQueue.Enqueue($SourceDir)

Write-Host "Fast scanning files in $SourceDir..."
while ($dirsQueue.Count -gt 0) {
    $currentDir = $dirsQueue.Dequeue()
    $items = Get-ChildItem -LiteralPath $currentDir -Force
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            $name = $item.Name
            if ($dirsToSkip -contains $name) {
                continue
            }
            $dirsQueue.Enqueue($item.FullName)
        } else {
            if ($extensionsToSkip -notcontains $item.Extension) {
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
