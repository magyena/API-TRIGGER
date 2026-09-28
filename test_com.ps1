try {
    $ppt = New-Object -ComObject PowerPoint.Application
    Write-Host "PowerPoint COM Object created successfully!"
    $ppt.Quit()
} catch {
    Write-Host "COM Error: $_"
}
