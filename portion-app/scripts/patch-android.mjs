// Run once after `npx cap add android` (npm run android:add does it for you).
// Android 11+ needs this <queries> entry so the Voice coach can find the
// phone's text-to-speech engine.
import { readFile, writeFile } from 'node:fs/promises';
const f = 'android/app/src/main/AndroidManifest.xml';
let x = await readFile(f, 'utf8');
if (!x.includes('android.intent.action.TTS_SERVICE')) {
  x = x.replace('</manifest>',
`    <queries>
        <intent>
            <action android:name="android.intent.action.TTS_SERVICE" />
        </intent>
    </queries>
</manifest>`);
  await writeFile(f, x);
  console.log('✓ AndroidManifest: text-to-speech query added');
} else console.log('✓ AndroidManifest already patched');
