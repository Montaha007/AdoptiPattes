$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    Push-Location frontend
    try {
        npm.cmd ci --no-audit
        if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
        npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Angular build failed' }
    } finally { Pop-Location }
    $staticPath = Join-Path $PSScriptRoot 'src/main/resources/static'
    $expectedStatic = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'src/main/resources/static'))
    if ([System.IO.Path]::GetFullPath($staticPath) -ne $expectedStatic) { throw 'Unexpected static output path' }
    if (Test-Path -LiteralPath $staticPath) { Remove-Item -LiteralPath $staticPath -Recurse -Force }
    New-Item -ItemType Directory -Force $staticPath | Out-Null
    Copy-Item -Path 'frontend/dist/adp/browser/*' -Destination $staticPath -Recurse -Force
    mvn.cmd -f pom.xml clean package
    if ($LASTEXITCODE -ne 0) { throw 'Backend build or tests failed' }
    Copy-Item 'target/adp.jar' 'adp.jar' -Force
    Write-Host 'Ready: adp.jar. Run .\start-mysql.ps1'
} finally { Pop-Location }




