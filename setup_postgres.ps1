$ErrorActionPreference = "Stop"
$pgDir = "$env:USERPROFILE\pgsql"
$zipPath = "$env:USERPROFILE\pgsql.zip"
$pgData = "$pgDir\data"

if (-not (Test-Path $pgDir)) {
    Write-Host "Downloading PostgreSQL (this might take a minute)..."
    Invoke-WebRequest -Uri "https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64-binaries.zip" -OutFile $zipPath
    
    Write-Host "Extracting..."
    Expand-Archive -Path $zipPath -DestinationPath $env:USERPROFILE -Force
    Remove-Item $zipPath -Force
}

if (-not (Test-Path $pgData)) {
    Write-Host "Initializing Database..."
    & "$pgDir\pgsql\bin\initdb.exe" -D $pgData -U postgres -A trust
}

Write-Host "Starting Database..."
& "$pgDir\pgsql\bin\pg_ctl.exe" -D $pgData -l "$pgDir\logfile" start

Start-Sleep -Seconds 3

Write-Host "Creating examedge database..."
& "$pgDir\pgsql\bin\psql.exe" -U postgres -c "CREATE DATABASE examedge;"

Write-Host "✅ PostgreSQL started successfully on port 5432!"
