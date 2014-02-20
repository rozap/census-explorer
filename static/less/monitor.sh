#!/bin/sh
while inotifywait -e modify . ; do
  lessc all.less > ../css/style.css
done
