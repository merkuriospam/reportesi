function Show-Tree {
    param (
        [string]$Path = ".",
        [int]$Indent = 0
    )

    $excludeDirs  = @('node_modules','dist','.git','.next','build','coverage','.cache','.vite','__pycache__','.nyc_output','tmp','ignore')
    $excludeFiles = @('*.log','*.lock','package-lock.json','yarn.lock','*.map','thumbs.db','.DS_Store','.env.local','.env.production')

    $items = Get-ChildItem -Path $Path | Where-Object {
        $name = $_.Name
        if ($_.PSIsContainer) { $excludeDirs -notcontains $name }
        else { -not ($excludeFiles | Where-Object { $name -like $_ }) }
    } | Sort-Object { $_.PSIsContainer } -Descending

    foreach ($item in $items) {
        $prefix = ("  " * $Indent) + "|-- "
        if ($item.PSIsContainer) {
            Write-Host "$prefix$($item.Name)/" -ForegroundColor Cyan
            Show-Tree -Path $item.FullName -Indent ($Indent + 1)
        } else {
            Write-Host "$prefix$($item.Name)" -ForegroundColor White
        }
    }
}

Show-Tree