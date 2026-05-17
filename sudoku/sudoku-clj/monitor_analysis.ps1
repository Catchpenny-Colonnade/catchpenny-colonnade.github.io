# Monitor full analysis progress every 20 minutes
# Tracks progress at 5% intervals

$logFile = "full_analysis_output.log"
$lastLineCount = 0
$progressPercentages = @(5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100)
$notifiedPercentages = @()
$checkInterval = 1200  # 20 minutes in seconds

Write-Host "===== ANALYSIS MONITOR =====" -ForegroundColor Cyan
Write-Host "Monitoring: $logFile" -ForegroundColor Yellow
Write-Host "Check interval: 20 minutes" -ForegroundColor Yellow
Write-Host "Total puzzles: 1,000,000" -ForegroundColor Yellow
Write-Host "Notifications at: 5% intervals" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

while ($true) {
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        $lines = $content -split "`n"
        
        # Look for completion message
        if ($content -match "=== Complete:") {
            Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] ✅ ANALYSIS COMPLETE!" -ForegroundColor Green
            $content -match "=== Complete:.*" | ForEach-Object { Write-Host "   $_" -ForegroundColor Green }
            break
        }
        
        # Estimate progress from puzzle count in output
        if ($content -match "Analyzing (\d+) puzzles") {
            $totalPuzzles = [int]$matches[1]
            
            # Count how many puzzle entries we see (rough estimate)
            $puzzleMatches = [regex]::Matches($content, "puzzle")
            $estimatedProcessed = [math]::Max(1, [int]($puzzleMatches.Count / 10))  # Rough estimate
            
            if ($estimatedProcessed -gt 0) {
                $percentComplete = [math]::Min(99, [int](($estimatedProcessed / $totalPuzzles) * 100))
                
                # Notify at 5% intervals
                foreach ($pct in $progressPercentages) {
                    if ($percentComplete -ge $pct -and $pct -notin $notifiedPercentages) {
                        $elapsed = (Get-Date) - $startTime
                        $estimatedTotal = if ($percentComplete -gt 0) { $elapsed.TotalSeconds / ($percentComplete / 100) } else { 0 }
                        $estimatedRemaining = $estimatedTotal - $elapsed.TotalSeconds
                        
                        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 📊 ${pct}% complete | Elapsed: $($elapsed.ToString('hh\:mm\:ss')) | Est. remaining: $([int]$estimatedRemaining/60) min" -ForegroundColor Cyan
                        $notifiedPercentages += $pct
                    }
                }
            }
        }
    }
    else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ⏳ Waiting for analysis to start..." -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds $checkInterval
}

Write-Host "`nFinal stats:"
if (Test-Path $logFile) {
    Get-Content $logFile -Tail 30 | Write-Host -ForegroundColor Gray
}
