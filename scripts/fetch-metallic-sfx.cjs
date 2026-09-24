const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../public/war-plan-assets/sfx');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const newUrls = {
  'metal_tap.ogg': 'https://raw.githubusercontent.com/Boyquotes/kenney-impact-sounds-for-godot/main/addons/kenney%20impact%20sounds/impact_metal_light_000.ogg',
  'metal_medium.ogg': 'https://raw.githubusercontent.com/Boyquotes/kenney-impact-sounds-for-godot/main/addons/kenney%20impact%20sounds/impact_metal_medium_000.ogg',
  'metal_heavy.ogg': 'https://raw.githubusercontent.com/Boyquotes/kenney-impact-sounds-for-godot/main/addons/kenney%20impact%20sounds/impact_plate_heavy_000.ogg',
  'metal_latch.ogg': 'https://raw.githubusercontent.com/Boyquotes/kenney-rpg-audio-for-godot/main/addons/kenney%20rpg%20audio/metal_latch.ogg',
  'metal_release.wav': 'https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds/toggle_004.wav',
  'modal_open.wav': 'https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds/open_001.wav',
  'modal_close.wav': 'https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds/close_001.wav',
  'exam_pin.wav': 'https://raw.githubusercontent.com/Calinou/kenney-interface-sounds/master/addons/kenney_interface_sounds/select_001.wav'
};

async function main() {
  for (const [filename, url] of Object.entries(newUrls)) {
    const dest = path.join(targetDir, filename);
    if (!fs.existsSync(dest)) {
      console.log('Downloading', filename, '...');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log('Saved', filename, buf.length, 'bytes');
    }
  }

  // Load all sounds and construct SFX_DATA
  const soundConfig = {
    // 1. Wheel & escapement
    wheelTick: { file: 'wheel_tick.mp3', mime: 'audio/mp3', vol: 0.65 },
    tick: { file: 'tick.wav', mime: 'audio/wav', vol: 0.3 },
    // 2. Metallic UI interactions
    metalTap: { file: 'metal_tap.ogg', mime: 'audio/ogg', vol: 0.55 },
    metalLatch: { file: 'metal_latch.ogg', mime: 'audio/ogg', vol: 0.75 },
    metalRelease: { file: 'metal_release.wav', mime: 'audio/wav', vol: 0.45 },
    presetSwitch: { file: 'metal_medium.ogg', mime: 'audio/ogg', vol: 0.65 },
    modalOpen: { file: 'modal_open.wav', mime: 'audio/wav', vol: 0.55 },
    modalClose: { file: 'modal_close.wav', mime: 'audio/wav', vol: 0.55 },
    examPin: { file: 'exam_pin.wav', mime: 'audio/wav', vol: 0.65 },
    scoreStamp: { file: 'metal_heavy.ogg', mime: 'audio/ogg', vol: 0.8 },
    // 3. Tactical actions
    breech: { file: 'breech.mp3', mime: 'audio/mp3', vol: 0.75 },
    alarm: { file: 'alarm.mp3', mime: 'audio/mp3', vol: 0.85 },
    impact: { file: 'impact.mp3', mime: 'audio/mp3', vol: 0.85 }
  };

  const sfxData = {};
  const sfxVolumes = {};
  for (const [key, conf] of Object.entries(soundConfig)) {
    const filePath = path.join(targetDir, conf.file);
    const buf = fs.readFileSync(filePath);
    sfxData[key] = `data:${conf.mime};base64,${buf.toString('base64')}`;
    sfxVolumes[key] = conf.vol;
    console.log(`SFX [${key}] -> ${conf.file} (${buf.length} B) Base64 length: ${sfxData[key].length}`);
  }

  fs.writeFileSync(path.join(targetDir, 'sfx-data.json'), JSON.stringify(sfxData));
  fs.writeFileSync(path.join(targetDir, 'sfx-volumes.json'), JSON.stringify(sfxVolumes, null, 2));
  console.log('Updated sfx-data.json and sfx-volumes.json successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
