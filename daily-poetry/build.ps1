param(
  [Parameter(Mandatory=$true)][string]$JavaHome,
  [Parameter(Mandatory=$true)][string]$BuildTools,
  [Parameter(Mandatory=$true)][string]$AndroidJar,
  [Parameter(Mandatory=$true)][string]$SigningStore,
  [Parameter(Mandatory=$true)][string]$PasswordFile,
  [Parameter(Mandatory=$true)][string]$BuildDir,
  [string]$OutputApk=(Join-Path $PSScriptRoot '..\小诗历_安卓.apk')
)
$ErrorActionPreference='Stop'
$project=$PSScriptRoot
$java=Join-Path $JavaHome 'bin/java.exe'
$javac=Join-Path $JavaHome 'bin/javac.exe'
$jar=Join-Path $JavaHome 'bin/jar.exe'
$aapt2=Join-Path $BuildTools 'aapt2.exe'
$zipalign=Join-Path $BuildTools 'zipalign.exe'
$apksigner=Join-Path $BuildTools 'lib/apksigner.jar'
$d8=Join-Path $BuildTools 'lib/d8.jar'
$assets=Join-Path $project 'assets'
$classDir=Join-Path $BuildDir 'classes'
$dexDir=Join-Path $BuildDir 'dex'
New-Item -ItemType Directory -Force -Path $BuildDir,$classDir,$dexDir | Out-Null
function Check-Result([string]$stage){if($LASTEXITCODE -ne 0){throw "$stage failed (exit $LASTEXITCODE)"}}

$resources=Join-Path $BuildDir 'resources.zip'
$unsigned=Join-Path $BuildDir 'unsigned.apk'
$normalized=Join-Path $BuildDir 'normalized.apk'
$aligned=Join-Path $BuildDir 'aligned.apk'
$classJar=Join-Path $BuildDir 'classes.jar'
& $aapt2 compile --dir (Join-Path $project 'res') -o $resources
Check-Result 'Compile resources'
& $aapt2 link -I $AndroidJar --manifest (Join-Path $project 'AndroidManifest.xml') --auto-add-overlay -R $resources -A $assets -o $unsigned
Check-Result 'Package resources'
& $javac -encoding UTF-8 -source 8 -target 8 -classpath $AndroidJar -d $classDir (Join-Path $project 'src/cn/poetrycalendar/daily/MainActivity.java')
Check-Result 'Compile Java'
& $jar "-J-Djava.io.tmpdir=$BuildDir" --create --file $classJar -C $classDir .
Check-Result 'Create classes archive'
& $java "-Djava.io.tmpdir=$BuildDir" -cp $d8 com.android.tools.r8.D8 --lib $AndroidJar --min-api 26 --output $dexDir $classJar
Check-Result 'Compile DEX'
& $jar "-J-Djava.io.tmpdir=$BuildDir" --update --file $unsigned -C $dexDir classes.dex
Check-Result 'Add DEX'
& $java "-Djava.io.tmpdir=$BuildDir" (Join-Path $project 'tools/NormalizeApk.java') $unsigned $normalized
Check-Result 'Normalize APK'
& $zipalign -f 4 $normalized $aligned
Check-Result 'Align APK'

if(!(Test-Path -LiteralPath $SigningStore)){
  & (Join-Path $JavaHome 'bin/keytool.exe') -genkeypair -keystore $SigningStore -alias poetry-calendar -keyalg RSA -keysize 2048 -validity 10000 -storepass:file $PasswordFile -keypass:file $PasswordFile -dname 'CN=Daily Poetry Calendar, O=Personal Application'
  Check-Result 'Generate signing identity'
}
& $java -jar $apksigner sign --ks $SigningStore --ks-key-alias poetry-calendar --ks-pass "file:$PasswordFile" --v4-signing-enabled false --out $OutputApk $aligned
Check-Result 'Sign APK'
& $java -jar $apksigner verify --verbose $OutputApk
Check-Result 'Verify signature'
& $zipalign -c 4 $OutputApk
Check-Result 'Verify alignment'
$aapt=Join-Path $BuildTools 'aapt.exe'
$manifest=& $aapt dump badging $OutputApk
Check-Result 'Read APK manifest'
if(!($manifest -match "name='cn.poetrycalendar.daily' versionCode='2' versionName='1.1.0'") -or $manifest -match 'android.permission.INTERNET'){
  throw 'Unexpected package identity or Internet permission'
}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead($OutputApk)
try{
  if($archive.Entries | Where-Object {$_.FullName.Contains('\')}){throw 'Nonportable archive path'}
  foreach($name in @('index.html','style.css','app.js','poems.js','schedule.js','poems-license.txt')){
    if(!$archive.GetEntry("assets/public/$name")){throw "Missing reading asset: $name"}
  }
  foreach($file in (Get-ChildItem -LiteralPath $assets -Recurse -File)){
    $relative=$file.FullName.Substring($assets.Length+1).Replace('\','/')
    $entry=$archive.GetEntry("assets/$relative")
    if(!$entry){throw "Missing asset: $relative"}
    $stream=$entry.Open()
    $sha=[Security.Cryptography.SHA256]::Create()
    try{$hash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','')}
    finally{$sha.Dispose();$stream.Dispose()}
    if($hash -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash){throw "Asset mismatch: $relative"}
  }
  $table=$archive.GetEntry('resources.arsc')
  if(!$table -or $table.Length -ne $table.CompressedLength -or !$archive.GetEntry('classes.dex')){throw 'Invalid package resources'}
}finally{$archive.Dispose()}
Write-Output "APK ready: $OutputApk"
