# Monitor full Felgenhauer-Jarvis analysis progress every 20 minutes
# Posts notifications at each 5% interval

$logFile = "full_analysis_output.log"
$checkInterval = 1200  # 20 minutes in seconds
$progressPercentages = @(5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100)
$notifiedPercentages = @()
$startTime = Get-Date

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "SUDOKU FULL ANALYSIS MONITOR" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "Log File: $logFile" -ForegroundColor Yellow
Write-Host "Check Interval: 20 minutes" -ForegroundColor Yellow
Write-Host "Dataset: 1,000,000 puzzles" -ForegroundColor Yellow
Write-Host "Mode: Full Felgenhauer-Jarvis (geometric + band/stack + symbols)" -ForegroundColor Yellow
Write-Host "Est. Runtime: 8-20+ hours" -ForegroundColor Yellow
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

$monitorCount = 0

while ($true) {
    $monitorCount++
    $checkTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        
        # Check for completion
        if ($content -match "=== Complete: ([\d.]+) seconds") {
            Write-Host "`n" + ("!" * 70) -ForegroundColor Green
            Write-Host "✅ ANALYSIS COMPLETE!" -ForegroundColor Green
            Write-Host ("!" * 70) -ForegroundColor Green
            Write-Host $matches[0] -ForegroundColor Green
            
            # Show final stats
            if ($content -match "Total puzzles analyzed: (\d+)") {
                Write-Host "Total: $($matches[1]) puzzles" -ForegroundColor Green
            }
            if ($content -match "Unique canonical forms: (\d+)") {
                Write-Host "Unique: $($matches[1]) forms" -ForegroundColor Green
            }
            if ($content -match "Duplicate groups: (\d+)") {
                Write-Host "Duplicates: $($matches[1]) groups" -ForegroundColor Green
            }
            
            break
        }
        
        # Extract progress lines
        $progressLines = $content -split "`n" | Where-Object { $_ -match "^\[\d+\.?\d*%" }
        
        if ($progressLines) {
            # Get the last progress line
            $lastLine = $progressLines[-1]
            
            # Parse percentage
            if ($lastLine -match "^\[([0-9.]+)%\]") {
                $currentPercent = [double]$matches[1]
                
                # Notify at each 5% interval
                foreach ($notifyPercent in $progressPercentages) {
                    if ($currentPercent -ge $notifyPercent -and $notifyPercent -notin $notifiedPercentages) {
                        $elapsed = (Get-Date) - $startTime
                        $estimatedTotal = if ($currentPercent -gt 0) { 
                            [timespan]::FromSeconds($elapsed.TotalSeconds / ($currentPercent / 100))
                        } else { 
                            [timespan]::Zero
                        }
                        $estimatedRemaining = $estimatedTotal - $elapsed
                        
                        Write-Host "[$checkTime] 📊 ${notifyPercent}% complete" -ForegroundColor Cyan -NoNewline
                        Write-Host " | Elapsed: $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Gray -NoNewline
                        Write-Host " | Est. remaining: $($estimatedRemaining.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
                        Write-Host "                  $lastLine" -ForegroundColor DarkCyan
                        
                        $notifiedPercentages += $notifyPercent
                    }
                }
            }
        } else {
            Write-Host "[$checkTime] ⏳ Analysis in progress... (waiting for progress output)"
        }
    } else {
        Write-Host "[$checkTime] ⏳ Waiting for $logFile to be created..."
    }
    
    Write-Host "[Next check in 20 minutes]" -ForegroundColor DarkGray
    Write-Host ""
    
    Start-Sleep -Seconds $checkInterval
}

Write-Host "`nMonitoring complete. Total checks: $monitorCount" -ForegroundColor Gray
