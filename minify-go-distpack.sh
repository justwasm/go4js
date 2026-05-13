#!/usr/bin/env bash
# 精简 Go distpack：去掉 testdata/*_test.go/test/fuzz 等运行时不需要的文件
# Usage: ./minify-go-distpack.sh <input.tar.gz>

set -euo pipefail
IN="$1"
OUT="${2:-${IN%.tar.gz}.min.tar.gz}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

zcat "$IN" > "$TMP/a.tar"

tar tf "$TMP/a.tar" | grep -E \
  '(^|/)testdata/|/Fuzz|\._test\.go$|\.zsparse$|^go/test/' \
  > "$TMP/del.txt" 2>/dev/null || true

tar --delete --files-from="$TMP/del.txt" -f "$TMP/a.tar" 2>/dev/null || true
gzip --best -c "$TMP/a.tar" > "$OUT"

echo "$(tar tzf "$IN" | grep -vc '/$') → $(tar tzf "$OUT" | grep -vc '/$') 文件"
echo "$(du -h "$IN" | cut -f1) → $(du -h "$OUT" | cut -f1)"
