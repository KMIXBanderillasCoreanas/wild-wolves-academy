const fs = require('fs');
const files = [
  'c:/Users/User/Documents/WildWolves_Sync_Pruebas_2026-10-28.json',
  'c:/Users/User/Documents/WildWolves_Sync_Pruebas_2026-10-28 (1).json',
  'c:/Users/User/Documents/WildWolves_Sync_Pruebas_2026-10-28 (2).json',
  'c:/Users/User/Documents/WildWolves_Sync_Pruebas_2026-10-28 (3).json'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const stat = fs.statSync(f);
    try {
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      console.log('==================================================');
      console.log('ARCHIVO:', f);
      console.log('Fecha Modificación:', stat.mtime);
      console.log('Exported at:', data.exported_at);
      console.log('Total Records:', data.total_records || (data.records ? data.records.length : 0));
      if (data.records) {
        data.records.forEach((r, idx) => {
          console.log(`  [Registro ${idx+1}]`);
          console.log(`    Nombre: "${r.athlete_name}" (#${r.jersey_number || '--'})`);
          console.log(`    Fecha Evaluación: ${r.evaluation_date}`);
          console.log(`    Rating OVR: ${r.overall_ovr}`);
          console.log(`    Tiros Libres: ${r.free_throws_made}/10`);
          console.log(`    Media Distancia: ${r.mid_range_made}/20 (Izq: ${r.mid_range_left_made}, Der: ${r.mid_range_right_made})`);
          console.log(`    Triples: ${r.three_point_made}/25 (Spots: cL=${r.spot_corner_left}, wL=${r.spot_wing_left}, top=${r.spot_top_key}, wR=${r.spot_wing_right}, cR=${r.spot_corner_right})`);
          console.log(`    Cuerda: ${r.jump_rope_count} saltos`);
          console.log(`    Salto Vertical: ${r.vertical_jump_cm} cm`);
          console.log(`    Circuito Líneas: ${r.lines_round_trip_seconds} seg | Sprint 100m: ${r.sprint_100m_seconds} seg`);
          console.log(`    Feedback: "${r.coach_feedback}"`);
          console.log(`    Guardado exacto: ${r.saved_at}`);
        });
      }
    } catch (e) {
      console.log('Error parseando JSON:', f, e.message);
    }
  } else {
    console.log('NO EXISTE:', f);
  }
});
