# Build Raspberry Pi Image with Cloud-Init Configuration
# This script fills in the cloud-init templates and creates a bootable image

param(
    [string]$EnvFile = ".env",
    [string]$OutputDir = ".\cloud-init\output"
)

# Set error handling
$ErrorActionPreference = "Stop"

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "=== Repair Café Print Client - Image Builder ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script requires administrator privileges to write to disk drives." -ForegroundColor Yellow
    Write-Host "Requesting elevation..." -ForegroundColor Yellow
    Write-Host ""
    
    # Restart the script with elevated privileges, preserving the working directory
    $scriptPath = $MyInvocation.MyCommand.Path
    $workingDir = Get-Location
    
    # Convert relative paths to absolute paths
    $envFileAbsolute = if ([System.IO.Path]::IsPathRooted($EnvFile)) { $EnvFile } else { Join-Path $workingDir $EnvFile }
    $outputDirAbsolute = if ([System.IO.Path]::IsPathRooted($OutputDir)) { $OutputDir } else { Join-Path $workingDir $OutputDir }
    
    $arguments = "-NoExit -NoProfile -ExecutionPolicy Bypass -Command `"Set-Location '$workingDir'; & '$scriptPath' -EnvFile '$envFileAbsolute' -OutputDir '$outputDirAbsolute'`""
    
    try {
        Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -Verb RunAs
        Write-Host "Elevated window opened. Please continue in the administrator PowerShell window." -ForegroundColor Green
    } catch {
        Write-Host "Error: Failed to elevate privileges: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit
}

Write-Host "=== Repair Café Print Client - Image Builder ===" -ForegroundColor Cyan
Write-Host "(Running as Administrator)" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "Error: .env file not found at: $EnvFile" -ForegroundColor Red
    Write-Host "Please create a .env file based on .env.example" -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env file
Write-Host "Loading configuration from $EnvFile..." -ForegroundColor Yellow
$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
        Write-Host "  $key = $value" -ForegroundColor Gray
    }
}

# Validate required variables
$requiredVars = @('REPO_URL', 'SOCKETIO_URL', 'PRINTER_NAME', 'SSL_VERIFY', 'DEBUG')
$missingVars = @()
foreach ($var in $requiredVars) {
    if (-not $envVars.ContainsKey($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "Error: Missing required environment variables:" -ForegroundColor Red
    $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
}

# Set default values for optional variables
if (-not $envVars.ContainsKey('CONNECTION_TYPE')) { $envVars['CONNECTION_TYPE'] = 'network' }
if (-not $envVars.ContainsKey('PRINTER_IP')) { $envVars['PRINTER_IP'] = '' }
if (-not $envVars.ContainsKey('PRINTER_PORT')) { $envVars['PRINTER_PORT'] = '9100' }
if (-not $envVars.ContainsKey('USB_VENDOR_ID')) { $envVars['USB_VENDOR_ID'] = '0x0' }
if (-not $envVars.ContainsKey('USB_PRODUCT_ID')) { $envVars['USB_PRODUCT_ID'] = '0x0' }
if (-not $envVars.ContainsKey('USB_INTERFACE')) { $envVars['USB_INTERFACE'] = '0' }
if (-not $envVars.ContainsKey('USB_IN_EP')) { $envVars['USB_IN_EP'] = '0x81' }
if (-not $envVars.ContainsKey('USB_OUT_EP')) { $envVars['USB_OUT_EP'] = '0x03' }

Write-Host ""
Write-Host "Processing cloud-init templates..." -ForegroundColor Yellow

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Process user-data template
Write-Host "  Processing user-data.template..." -ForegroundColor Gray
$userDataTemplate = Get-Content ".\cloud-init\user-data.template" -Raw
$userData = $userDataTemplate
foreach ($key in $envVars.Keys) {
    $userData = $userData -replace "{{$key}}", $envVars[$key]
}
$userDataPath = (Resolve-Path (Join-Path $OutputDir "user-data") -ErrorAction SilentlyContinue).Path
if (-not $userDataPath) {
    $userDataPath = [System.IO.Path]::GetFullPath((Join-Path $OutputDir "user-data"))
}
# Write with UTF8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($userDataPath, $userData, $utf8NoBom)
Write-Host "    Created: $userDataPath" -ForegroundColor Green

# Process network-config template
Write-Host "  Processing network-config.template..." -ForegroundColor Gray
$networkConfigTemplate = Get-Content ".\cloud-init\network-config.template" -Raw
$networkConfig = $networkConfigTemplate
$networkConfigPath = (Resolve-Path (Join-Path $OutputDir "network-config") -ErrorAction SilentlyContinue).Path
if (-not $networkConfigPath) {
    $networkConfigPath = [System.IO.Path]::GetFullPath((Join-Path $OutputDir "network-config"))
}
# Write with UTF8 without BOM
[System.IO.File]::WriteAllText($networkConfigPath, $networkConfig, $utf8NoBom)
Write-Host "    Created: $networkConfigPath" -ForegroundColor Green

Write-Host ""
Write-Host "Detecting removable drives (USB/SD cards)..." -ForegroundColor Yellow

# Debug: List all disk drives first
Write-Host "Debug: Listing all disk drives..." -ForegroundColor Gray
$allDrives = Get-WmiObject Win32_DiskDrive
$allDrives | ForEach-Object {
    Write-Host "  Model: $($_.Model), Interface: $($_.InterfaceType), Media: $($_.MediaType), Size: $($_.Size), Device: $($_.DeviceID)" -ForegroundColor DarkGray
}
Write-Host ""

# Get all removable drives (USB, SD cards, etc.) with proper error handling
# Filter by MediaType="Removable Media" OR (USB interface and not fixed media)
$removableDrives = @()
foreach ($drive in $allDrives) {
    if (($drive.MediaType -match "Removable" -or ($drive.InterfaceType -eq "USB" -and $drive.MediaType -notmatch "Fixed")) -and
        $drive.DeviceID -ne $null -and $drive.DeviceID -ne "") {
        $removableDrives += $drive
    }
}

if ($removableDrives.Count -eq 0) {
    Write-Host "Error: No removable drives detected. Please insert a USB drive or SD card and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Looking for drives with MediaType containing 'Removable' or USB interface without 'Fixed' media" -ForegroundColor Yellow
    exit 1
}

if ($removableDrives.Count -gt 1) {
    Write-Host "Error: Multiple removable drives detected. Please connect only one drive." -ForegroundColor Red
    Write-Host "Detected drives:" -ForegroundColor Yellow
    $removableDrives | ForEach-Object {
        $model = if ($_.Model) { $_.Model } else { if ($_.Caption) { $_.Caption } else { "Unknown" } }
        $sizeGB = if ($_.Size) { [math]::Round($_.Size / 1GB, 2) } else { "Unknown" }
        $deviceId = if ($_.DeviceID) { $_.DeviceID } else { "Unknown" }
        Write-Host "  - $model ($sizeGB GB) - $deviceId" -ForegroundColor Gray
    }
    exit 1
}

$targetDrive = $removableDrives[0]

# Debug: Show the drive object
Write-Host "Debug: Selected drive object:" -ForegroundColor Gray
Write-Host "  Model: $($targetDrive.Model)" -ForegroundColor DarkGray
Write-Host "  DeviceID: $($targetDrive.DeviceID)" -ForegroundColor DarkGray
Write-Host "  InterfaceType: $($targetDrive.InterfaceType)" -ForegroundColor DarkGray
Write-Host "  MediaType: $($targetDrive.MediaType)" -ForegroundColor DarkGray
Write-Host "  Size: $($targetDrive.Size)" -ForegroundColor DarkGray

$devicePath = $targetDrive.DeviceID

# Validate device path
if (-not $devicePath -or $devicePath -eq "") {
    Write-Host "Error: Could not determine device path for removable drive" -ForegroundColor Red
    Write-Host "Drive details (full):" -ForegroundColor Yellow
    $targetDrive | Format-List * | Out-String | Write-Host -ForegroundColor Gray
    exit 1
}

# Get drive info with fallbacks
$driveModel = if ($targetDrive.Model) { $targetDrive.Model } else { 
    if ($targetDrive.Caption) { $targetDrive.Caption } else { "Unknown Drive" }
}
$driveSizeGB = if ($targetDrive.Size) { [math]::Round($targetDrive.Size / 1GB, 2) } else { "Unknown" }

Write-Host "Detected removable drive: $driveModel ($driveSizeGB GB)" -ForegroundColor Green
Write-Host "Device path: $devicePath" -ForegroundColor Gray

# Get partition info for additional details
try {
    $partitions = Get-WmiObject -Query "ASSOCIATORS OF {Win32_DiskDrive.DeviceID='$($devicePath.Replace('\','\\'))'} WHERE AssocClass = Win32_DiskDriveToDiskPartition"
    if ($partitions) {
        foreach ($partition in $partitions) {
            $logicalDisks = Get-WmiObject -Query "ASSOCIATORS OF {Win32_DiskPartition.DeviceID='$($partition.DeviceID)'} WHERE AssocClass = Win32_LogicalDiskToPartition"
            foreach ($disk in $logicalDisks) {
                if ($disk.VolumeName) {
                    Write-Host "Volume name: $($disk.VolumeName) [$($disk.DeviceID)]" -ForegroundColor Gray
                } else {
                    Write-Host "Drive letter: $($disk.DeviceID)" -ForegroundColor Gray
                }
            }
        }
    }
} catch {
    # Silently continue if we can't get partition info
}

Write-Host ""
Write-Host "WARNING: All data on this drive will be erased!" -ForegroundColor Red
Write-Host "Drive: $driveModel ($driveSizeGB GB)" -ForegroundColor Yellow
Write-Host "Device: $devicePath" -ForegroundColor Yellow
$confirmation = Read-Host "Type 'YES' to continue"
if ($confirmation -ne "YES") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Adding rpi-imager to PATH..." -ForegroundColor Yellow
$rpiImagerPath = "C:\Program Files\Raspberry Pi Ltd\Imager"
if (-not (Test-Path "$rpiImagerPath\rpi-imager.exe")) {
    Write-Host "Error: rpi-imager not found at: $rpiImagerPath" -ForegroundColor Red
    Write-Host "Please install Raspberry Pi Imager from: https://www.raspberrypi.com/software/" -ForegroundColor Yellow
    exit 1
}

# Temporarily add to PATH for this session
$env:PATH = "$rpiImagerPath;$env:PATH"

Write-Host ""
Write-Host "Fetching available Raspberry Pi OS images..." -ForegroundColor Yellow

# Get the Raspberry Pi OS Lite image URL (minimal installation)
# Using the official Raspberry Pi OS Lite (32-bit) - smallest option
$imageUrl = "https://downloads.raspberrypi.org/raspios_lite_armhf_latest"

Write-Host "Using image: Raspberry Pi OS Lite (32-bit)" -ForegroundColor Green
Write-Host "Image URL: $imageUrl" -ForegroundColor Gray

Write-Host ""
Write-Host "Starting image creation..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
Write-Host ""

# Additional safety check: Verify this is NOT the system drive
$systemDrive = $env:SystemDrive
$systemDriveLetter = $systemDrive.TrimEnd(':')
$systemPartitions = Get-WmiObject -Query "ASSOCIATORS OF {Win32_LogicalDisk.DeviceID='$systemDrive'} WHERE AssocClass = Win32_LogicalDiskToPartition"
foreach ($partition in $systemPartitions) {
    $systemPhysicalDisk = Get-WmiObject -Query "ASSOCIATORS OF {Win32_DiskPartition.DeviceID='$($partition.DeviceID)'} WHERE AssocClass = Win32_DiskDriveToDiskPartition"
    if ($systemPhysicalDisk.DeviceID -eq $devicePath) {
        Write-Host ""
        Write-Host "CRITICAL ERROR: The selected drive is your SYSTEM DRIVE!" -ForegroundColor Red
        Write-Host "This would destroy your operating system. Aborting!" -ForegroundColor Red
        exit 1
    }
}

# Additional safety: Verify the drive is actually removable media
if ($targetDrive.MediaType -notmatch "Removable") {
    Write-Host ""
    Write-Host "WARNING: Drive does not report as Removable Media!" -ForegroundColor Red
    Write-Host "Media Type: $($targetDrive.MediaType)" -ForegroundColor Yellow
    Write-Host "This safety check prevents accidental system drive erasure." -ForegroundColor Yellow
    $forceConfirm = Read-Host "Type 'FORCE' to proceed anyway (NOT recommended)"
    if ($forceConfirm -ne "FORCE") {
        Write-Host "Operation cancelled for safety." -ForegroundColor Yellow
        exit 0
    }
}

# Build rpi-imager command with proper quoting for paths with spaces
# Note: We use --enable-writing-system-drives because rpi-imager doesn't recognize some USB drives as removable
# Our safety checks above ensure we're not writing to the actual system drive
$rpiImagerArgs = @(
    "--cli"
    "--disable-verify"
    "--enable-writing-system-drives"  # Safe because we've verified it's not the system drive above
    "--cloudinit-userdata"
    "`"$userDataPath`""
    "--cloudinit-networkconfig"
    "`"$networkConfigPath`""
    $imageUrl
    $devicePath
)

Write-Host "Executing: rpi-imager $($rpiImagerArgs -join ' ')" -ForegroundColor Gray
Write-Host ""

try {
    # Run rpi-imager with administrator privileges
    # Use ArgumentList as a single string to preserve quotes
    $argString = $rpiImagerArgs -join ' '
    $process = Start-Process -FilePath "rpi-imager" -ArgumentList $argString -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "=== Image created successfully! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Safely eject the USB drive" -ForegroundColor White
        Write-Host "  2. Insert it into your Raspberry Pi" -ForegroundColor White
        Write-Host "  3. Power on the Raspberry Pi" -ForegroundColor White
        Write-Host "  4. Wait for the initial setup (5-10 minutes)" -ForegroundColor White
        Write-Host "  5. The print client will start automatically" -ForegroundColor White
        Write-Host ""
        Write-Host "Configuration:" -ForegroundColor Cyan
        Write-Host "  - Hostname: printclient" -ForegroundColor White
        Write-Host "  - Username: pi" -ForegroundColor White
        Write-Host "  - Password: raspberry (CHANGE THIS AFTER FIRST BOOT!)" -ForegroundColor Yellow
        Write-Host "  - Printer Name: $($envVars['PRINTER_NAME'])" -ForegroundColor White
        Write-Host "  - Socket.IO URL: $($envVars['SOCKETIO_URL'])" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Error: rpi-imager failed with exit code $($process.ExitCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error: Failed to run rpi-imager" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
