#!/bin/bash

echo "🚀 LANCEMENT DE LA MIGRATION PARALLÈLE (4 WORKERS)"
echo "═══════════════════════════════════════════════════"
echo ""

# Nombre de workers
TOTAL_WORKERS=4

# Lancer chaque worker en arrière-plan
for i in $(seq 0 $((TOTAL_WORKERS - 1))); do
  echo "▶️  Démarrage du Worker $((i + 1))/$TOTAL_WORKERS..."
  WORKER_ID=$i TOTAL_WORKERS=$TOTAL_WORKERS npx tsx scripts/migrate-wordpress-photos-parallel.ts > "logs/worker-$i.log" 2>&1 &
done

echo ""
echo "✅ $TOTAL_WORKERS workers lancés en arrière-plan !"
echo ""
echo "📊 Pour suivre la progression :"
echo "   tail -f logs/worker-0.log    # Worker 1"
echo "   tail -f logs/worker-1.log    # Worker 2"
echo "   tail -f logs/worker-2.log    # Worker 3"
echo "   tail -f logs/worker-3.log    # Worker 4"
echo ""
echo "⏹️  Pour arrêter tous les workers :"
echo "   pkill -f 'migrate-wordpress-photos-parallel'"
echo ""
echo "⏰ Temps estimé : ~5 heures (au lieu de 20h)"
echo ""
