param([switch]$Development)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if (-not $Development -and -not (Test-Path 'adp.jar')) { throw 'Build first using build.ps1.' }
    if (-not $env:DB_USERNAME) { $env:DB_USERNAME = 'root' }
    if (-not $env:DB_URL) { $env:DB_URL = 'jdbc:mysql://localhost:3306/adp_db?createDatabaseIfNotExist=true&connectionTimeZone=UTC' }
    if (-not $env:DB_PASSWORD) {
        $securePassword = Read-Host 'MySQL password' -AsSecureString
        $env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $securePassword).Password
    }
    if (-not $env:JWT_SECRET) {
        $secretBytes = New-Object byte[] 48
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($secretBytes)
        $rng.Dispose()
        $env:JWT_SECRET = [Convert]::ToBase64String($secretBytes)
    }
    # Local classroom demonstration accounts. Do not use these on a public VPS.
    if (-not $env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD = 'AdminDemo!2026' }
    if (-not $env:MEMBER_PASSWORD) { $env:MEMBER_PASSWORD = 'MemberDemo!2026' }
    $env:SEED_ENABLED = 'true'
    $env:SMTP_HOST = 'localhost'
    $env:SMTP_PORT = '1025'
    $env:MAIL_ENABLED = 'true'
    $mailpitPath = Join-Path $PSScriptRoot 'tools/mailpit/mailpit.exe'
    if (Test-Path $mailpitPath) {
        $listening = Get-NetTCPConnection -LocalPort 1025 -State Listen -ErrorAction SilentlyContinue
        if (-not $listening) {
            $mailProcess = Start-Process -FilePath $mailpitPath -ArgumentList '--listen','127.0.0.1:8025','--smtp','127.0.0.1:1025' -WindowStyle Hidden -PassThru
        }
    }
    Write-Host 'App: http://localhost:8082 | Local email inbox: http://localhost:8025'
    Write-Host 'This local launcher uses MySQL adp_db and classroom demo accounts.'
    if ($Development) { mvn.cmd spring-boot:run '-Dspring-boot.run.arguments=--server.address=127.0.0.1' } else { java -jar adp.jar --server.address=127.0.0.1 }
} finally {
    if ($mailProcess -and -not $mailProcess.HasExited) { Stop-Process -Id $mailProcess.Id }
    Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
    Pop-Location
}

