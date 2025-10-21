#!/bin/bash

echo "========================================"
echo "  مسح الكاش وإعادة تشغيل المشروع"
echo "========================================"
echo ""

echo "[1/3] إيقاف أي عمليات قديمة..."
pkill -f "vite" 2>/dev/null || true

echo "[2/3] مسح كاش Vite..."
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "✓ تم مسح الكاش"
else
    echo "✓ لا يوجد كاش للمسح"
fi

echo "[3/3] تشغيل المشروع..."
echo ""
echo "========================================"
echo "  المشروع يعمل الآن!"
echo "  افتح: http://localhost:3001"
echo "========================================"
echo ""

npm run dev
