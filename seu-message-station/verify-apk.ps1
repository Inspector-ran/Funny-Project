param([Parameter(Mandatory=$true)][string]$Apk)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $Apk).Path)
try {
  $bad=@($archive.Entries | Where-Object { $_.FullName.Contains('\') })
  if($bad.Count){throw 'APK contains non-portable backslash paths'}
  $names=@('index.html','app.js','native-backend.js','style.css','seed.json','worker.html','worker.js','icon.svg')
  foreach($name in $names){
    $entry=$archive.GetEntry("assets/public/$name")
    if(-not $entry){throw "Missing packaged Android asset: $name"}
    $stream=$entry.Open()
    $hash=[Security.Cryptography.SHA256]::Create()
    try {$actual=[BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-','')}
    finally {$stream.Dispose();$hash.Dispose()}
    $source=Join-Path $PSScriptRoot "assets\public\$name"
    if($actual -ne (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash){throw "Packaged Android asset differs: $name"}
  }
  $table=$archive.GetEntry('resources.arsc')
  if(-not $table -or $table.CompressedLength -ne $table.Length){throw 'Android resource table is compressed'}
  Write-Output 'PASS: Android APK uses portable paths; all 8 packaged resources match the source files.'
} finally {$archive.Dispose()}
