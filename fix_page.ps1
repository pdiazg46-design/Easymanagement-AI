$lines = Get-Content 'c:\Users\pdiaz\Desarrollos\Easy management\easy-management\src\app\page.tsx' -Encoding UTF8
for ($i = 2543; $i -le 2564; $i++) {
  Write-Host "Line $($i+1): [$($lines[$i])]"
}
