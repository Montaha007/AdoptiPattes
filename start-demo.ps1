$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if (-not (Test-Path 'adp.jar')) { throw 'Build first: .\build.ps1' }
    Write-Host 'AdoptiPattes: http://localhost:8082 (local demo, email disabled)'
    java -jar adp.jar --spring.profiles.active=demo --server.address=127.0.0.1
} finally { Pop-Location }
