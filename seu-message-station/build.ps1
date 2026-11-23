param(
  [Parameter(Mandatory=$true)][string]$JavaHome,
  [Parameter(Mandatory=$true)][string]$BuildTools,
  [Parameter(Mandatory=$true)][string]$AndroidJar,
  [Parameter(Mandatory=$true)][string]$ZxingJar,
  [Parameter(Mandatory=$true)][string]$SigningStore,
  [Parameter(Mandatory=$true)][string]$PasswordFile,
  [string]$OutputApk = (Join-Path $PSScriptRoot '..\东南消息站_安卓.apk')
)
$ErrorActionPreference = 'Stop'
$project = $PSScriptRoot
$buildDir = Join-Path $project '.build'
$java = Join-Path $JavaHome 'bin\java.exe'
$javac = Join-Path $JavaHome 'bin\javac.exe'
$jarTool = Join-Path $JavaHome 'bin\jar.exe'
$keytool = Join-Path $JavaHome 'bin\keytool.exe'
$jsoupJar = Join-Path $project 'libs\jsoup-1.21.2.jar'
New-Item -ItemType Directory -Force -Path $buildDir,(Join-Path $buildDir 'classes'),(Join-Path $buildDir 'dex'),(Join-Path $buildDir 'generated') | Out-Null
function Check-Result([string]$stage) { if ($LASTEXITCODE -ne 0) { throw "$stage failed (exit $LASTEXITCODE)" } }
& (Join-Path $BuildTools 'aapt2.exe') compile --dir (Join-Path $project 'res') -o (Join-Path $buildDir 'resources.zip')
Check-Result 'Compile resources'
& (Join-Path $BuildTools 'aapt2.exe') link -I $AndroidJar --manifest (Join-Path $project 'AndroidManifest.xml') --auto-add-overlay -R (Join-Path $buildDir 'resources.zip') -A (Join-Path $project 'assets') --java (Join-Path $buildDir 'generated') --min-sdk-version 26 --target-sdk-version 35 -o (Join-Path $buildDir 'unsigned.apk')
Check-Result 'Package resources'
$sources = @(Get-ChildItem -LiteralPath (Join-Path $project 'src'),(Join-Path $buildDir 'generated') -Recurse -Filter '*.java' | ForEach-Object { '"' + $_.FullName.Replace('\','/') + '"' })
$sourcesPath = Join-Path $buildDir 'sources.txt'
[IO.File]::WriteAllLines($sourcesPath,$sources,[Text.UTF8Encoding]::new($false))
& $javac -encoding UTF-8 -source 8 -target 8 -classpath "$AndroidJar;$ZxingJar;$jsoupJar" -d (Join-Path $buildDir 'classes') "@$sourcesPath"
Check-Result 'Compile Java'
& $jarTool "-J-Djava.io.tmpdir=$buildDir" --create --file (Join-Path $buildDir 'classes.jar') -C (Join-Path $buildDir 'classes') .
Check-Result 'Create classes archive'
& $java "-Djava.io.tmpdir=$buildDir" -cp (Join-Path $BuildTools 'lib\d8.jar') com.android.tools.r8.D8 --lib $AndroidJar --min-api 26 --output (Join-Path $buildDir 'dex') (Join-Path $buildDir 'classes.jar') $ZxingJar $jsoupJar
Check-Result 'Compile DEX'
& $jarTool "-J-Djava.io.tmpdir=$buildDir" --update --file (Join-Path $buildDir 'unsigned.apk') -C (Join-Path $buildDir 'dex') classes.dex
Check-Result 'Add DEX'
& $java "-Djava.io.tmpdir=$buildDir" (Join-Path $project 'tools\NormalizeApk.java') (Join-Path $buildDir 'unsigned.apk') (Join-Path $buildDir 'normalized.apk')
Check-Result 'Normalize Android archive paths'
& (Join-Path $BuildTools 'zipalign.exe') -f 4 (Join-Path $buildDir 'normalized.apk') (Join-Path $buildDir 'aligned.apk')
Check-Result 'Align APK'
if (-not (Test-Path -LiteralPath $SigningStore)) {
  & $keytool -genkeypair -keystore $SigningStore -alias seu-personal-hub -keyalg RSA -keysize 2048 -validity 10000 -storepass:file $PasswordFile -keypass:file $PasswordFile -dname 'CN=SEU Personal Hub, O=Personal Application, C=CN'
  Check-Result 'Generate signing identity'
}
& $java -jar (Join-Path $BuildTools 'lib\apksigner.jar') sign --ks $SigningStore --ks-key-alias seu-personal-hub --ks-pass "file:$PasswordFile" --out $OutputApk (Join-Path $buildDir 'aligned.apk')
Check-Result 'Sign APK'
& $java -jar (Join-Path $BuildTools 'lib\apksigner.jar') verify --verbose --print-certs $OutputApk
Check-Result 'Verify APK'
& (Join-Path $project 'verify-apk.ps1') -Apk $OutputApk
Write-Output "APK ready: $OutputApk"
