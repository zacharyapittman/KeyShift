
// app.js
const keys = [
  "C", "C#", "D", "Eb", "E", "F",
  "F#", "G", "Ab", "A", "Bb", "B"
];

const enharmonic = {
  "C#": "Db", "Eb": "D#", "F#": "Gb",
  "Ab": "G#", "Bb": "A#"
};

const fromSelect = document.getElementById("fromKey");
const toSelect = document.getElementById("toKey");
const styleSelect = document.getElementById("style");
const results = document.getElementById("results");

keys.forEach(key => {
  fromSelect.add(new Option(key, key));
  toSelect.add(new Option(key, key));
});

fromSelect.value = "G";
toSelect.value = "A";

function pitch(key) {
  return keys.indexOf(key);
}

function noteAt(number) {
  return keys[((number % 12) + 12) % 12];
}

function transposeChord(chord, semitones) {
  const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return chord;
  return noteAt(pitch(match[1]) + semitones) + match[2];
}

function majorChords(root) {
  const p = pitch(root);
  return [
    noteAt(p),
    noteAt(p + 2) + "m",
    noteAt(p + 4) + "m",
    noteAt(p + 5),
    noteAt(p + 7),
    noteAt(p + 9) + "m",
    noteAt(p + 11) + "dim"
  ];
}

function dominant(root) {
  return noteAt(pitch(root) + 7) + "7";
}

function generate() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const style = styleSelect.value;
  const distance = (pitch(to) - pitch(from) + 12) % 12;

  const source = majorChords(from);
  const target = majorChords(to);
  const targetDominant = dominant(to);

  let options = [];

  if (from === to) {
    options = [{
      name: "Stay in the same key",
      chords: [from, source[3], source[0]],
      description: "No modulation is necessary."
    }];
  } else {
    if (style === "simple") {
      options.push({
        name: "Direct transition",
        chords: [from, to],
        description: "A simple change. Hold the final chord and begin the next song."
      });
    }

    if (style === "dominant") {
      options.push({
        name: "Destination dominant",
        chords: [from, targetDominant, to],
        description: "The V7 chord creates a strong pull toward the destination."
      });
      options.push({
        name: "Two-chord approach",
        chords: [source[4], targetDominant, to],
        description: "Move from the starting key's dominant into the new key."
      });
    }

    if (style === "smooth") {
      const shared = source.filter(chord => target.includes(chord));

      shared.slice(0, 3).forEach(chord => {
        options.push({
          name: "Common chord pivot",
          chords: [from, chord, targetDominant, to],
          description: `${chord} is shared by both diatonic major keys.`
        });
      });

      if (!options.length) {
        options.push({
          name: "Relative movement",
          chords: [from, source[5], targetDominant, to],
          description: "Use a minor chord from the starting key before resolving."
        });
      }
    }

    if (style === "chromatic") {
      const passing = noteAt(pitch(to) - 1) + "dim7";
      options.push({
        name: "Chromatic approach",
        chords: [from, passing, to],
        description: "A diminished passing chord approaches the destination by half-step."
      });
      options.push({
        name: "Dominant approach",
        chords: [from, dominant(from), targetDominant, to],
        description: "Use dominant harmony to create movement into the new key."
      });
    }
  }

  if (!options.length) {
    options.push({
      name: "Dominant transition",
      chords: [from, targetDominant, to],
      description: "A strong resolution into the destination key."
    });
  }

  results.innerHTML = `
    <h2>${from} → ${to}</h2>
    ${options.map(option => `
      <article class="result-card">
        <span class="pill">${option.name}</span>
        <div class="chords">${option.chords.join(" → ")}</div>
        <p class="details">${option.description}</p>
        <p class="details">
          Nashville numbers: ${option.chords.map(chord =>
            chord === from ? "I" :
            chord === to ? "I (new key)" :
            chord === targetDominant ? "V7 (new key)" :
            chord === dominant(from) ? "V7 (old key)" : "Passing chord"
          ).join(" → ")}
        </p>
        <button onclick="copyProgression('${option.chords.join(" → ")}')">
          Copy progression
        </button>
      </article>
    `).join("")}
  `;
}

function copyProgression(text) {
  navigator.clipboard.writeText(text);
}

document.getElementById("generate").addEventListener("click", generate);
generate();
