docker ps
$x=docker ps | select-string countdown-core-ui
$x -match "(\S+).*countdown-core-ui"
$id=$Matches[1]
docker rm -f $id
