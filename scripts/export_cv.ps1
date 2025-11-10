Param(
  [string]$Date = $(Get-Date -Format 'yyyy-MM-dd')
)

function Get-EdgePath {
  $paths = @(
    'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
  )
  foreach ($p in $paths) { if (Test-Path $p) { return $p } }
  throw 'Microsoft Edge (Chromium) not found. Please install Edge or update the script to point to your Chrome/Edge executable.'
}

$edge = Get-EdgePath
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$companies = @('Rolls-Royce','BAE Systems','BMW')

foreach ($company in $companies) {
  $input = Join-Path $root "Professional_CVs\$company\CV.html"
  if (-not (Test-Path $input)) {
    Write-Warning "Missing CV HTML for $company: $input"
    continue
  }
  $output = Join-Path $root "Professional_CVs\$company\Bharti_Raj_CV_${company}_$Date.pdf"
  & $edge --headless --disable-gpu --print-to-pdf="$output" "$input"
  if (Test-Path $output) {
    Write-Host "Generated: $output"
  } else {
    Write-Warning "Failed to generate PDF for $company"
  }
}