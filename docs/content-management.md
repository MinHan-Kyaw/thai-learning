# Content management

## Files

| File                             | Contents                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/data/consonantClasses.json` | The three classes: `id`, English `name`, `shortName`, `burmeseName`, `tone`                             |
| `src/data/consonants.json`       | 44 consonants, each with its vocabulary `words`                                                         |
| `src/data/vowels.json`           | 32 vowels: `id` (written with `-` for the consonant), `group`, English `sound`, Burmese `pronunciation` |
| `src/data/vowelGroups.json`      | Short, long, extra and standalone vowel groups with a note                                              |
| `src/data/tones.json`            | The five tones: English and Thai name, pitch contour                                                    |
| `src/data/toneMarks.json`        | The four tone marks and their Thai names                                                                |
| `public/images/words/*.svg`      | Vocabulary pictures (vector)                                                                            |
| `public/audio/words/*.m4a`       | Thai audio                                                                                              |

## Word schema

```json
{
  "id": "ก",
  "character": "ก",
  "class": "middle",
  "words": [
    {
      "id": "ก-ไก่",
      "thai": "ไก่",
      "pronunciation": "ကောကိုင်",
      "meaning": "ကြက်",
      "image": "/images/words/kai.svg",
      "audio": "/audio/words/kai.m4a"
    }
  ]
}
```

| Field           | Required | Rule                                                                                                                                                                               |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`            | yes      | `<consonant>-<thai>`; never change once published                                                                                                                                  |
| `thai`          | yes      | Thai script only                                                                                                                                                                   |
| `pronunciation` | yes      | Burmese script, provided by the project owner, stored exactly as the source gives it (e.g. `ကောကိုင်`). Cards show it under the letter and word; practice shows it under `ก (ไก่)` |
| `meaning`       | yes      | Burmese meaning, provided by the project owner                                                                                                                                     |
| `image`         | no       | SVG path. Missing → placeholder on the consonant page, excluded from practice                                                                                                      |
| `audio`         | no       | Missing → no speaker button, silent selection in practice                                                                                                                          |

## Adding or changing content

1. Get the Thai word, Burmese pronunciation and Burmese meaning **from the project owner**. Do not write Burmese yourself.
2. Add the word to the right consonant in `src/data/consonants.json`.
3. Add the image and audio files (see below) and reference them.
4. Run `npm test` — `src/data/consonants.test.ts` checks IDs, required fields, Burmese script, Unicode order and that
   referenced files exist.
5. Open a pull request and complete the content checklist in the template.

A word without Burmese pronunciation is incomplete; do not merge it with a placeholder or generated text.

## Images

- `public/images/words/<romanized-slug>.svg`, e.g. `kai.svg`. Vector, so they stay sharp on any screen.
- Style: Microsoft [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) **Flat** — `viewBox="0 0 32 32"`, flat
  fills, no outlines, Fluent's colour palette. Use a Fluent asset when one clearly shows the word; otherwise draw a custom
  SVG in the same style (see the custom list below).
- The picture must not contain the Thai letter or word — practice shows it as the question.
- No `<script>`, event handlers, `<foreignObject>` or external `href`s. `src/data/consonants.test.ts` enforces this.
- `alt` text is the Burmese `meaning`, set automatically.

To add a Fluent asset, copy it from a pinned commit (never `main`) and note the commit in this document:

```bash
curl -fsSL "https://raw.githubusercontent.com/microsoft/fluentui-emoji/<commit>/assets/Owl/Flat/owl_flat.svg" \
  -o public/images/words/nokhuk.svg
```

### Current picture sources

Fluent Emoji assets come from commit `1ffb34c752ecf5d402f04cfb4b392c77f57c54bc`.

| Source                                   | Words                                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fluent Emoji (exact match)               | ไก่, เด็ก, เต่า, ใบไม้, ปลา, ไข่, ขวด, ผึ้ง, เสือ, ควาย, คน, ระฆัง, งู, ช้าง, โซ่, เฌอ, หญิง, ผู้เฒ่า, ธง, หนู, ฟัน, ม้า, เรือ, ลิง, แหวน, จุฬา, นกฮูก |
| Fluent Emoji (closest available, review) | จาน (fork and knife with plate), ฤาษี (man mage), มณโฑ (princess), ทหาร (military helmet), ยักษ์ (ogre)                                                |
| Custom SVG in Fluent style               | อ่าง, ชฎา, ปฏัก, ฉิ่ง, ถุง, ฐาน, ฝา, ศาลา, หีบ, เณร, พาน, สำเภา                                                                                        |

## Audio

- `public/audio/words/<romanized-slug>.m4a` (AAC, mono, ~64 kbps).
- The recording says the full letter name in Thai, `<consonant>อ <word>`, e.g. "กอ ไก่" (kaw kai), so it matches the
  Burmese pronunciation `ကောကိုင်`. The screen shows only the word `ไก่`.
- Audio is Thai pronunciation only; it is never produced from the Burmese `pronunciation` text.

Converting a recording on macOS: `afconvert -f m4af -d aac -b 64000 recording.wav public/audio/words/kai.m4a`

## Review checklist

- [ ] Correct Thai character and consonant class
- [ ] Correct Thai word spelling
- [ ] Burmese pronunciation supplied by the owner, unchanged from the source
- [ ] Burmese meaning correct
- [ ] Image shows the word, contains no text, and is square
- [ ] Audio is the Thai pronunciation of the same word
- [ ] `npm test` passes

## Sources and licensing

- **Text content** (Thai words, Burmese pronunciations, Burmese meanings, class names) was transcribed from the
  PDF text layer of _Thi Thi's Thai Training — Basic + Level 1_ (pages 3–5, 15, 27). Nothing was translated or inferred.
- **Images** are vector SVGs: Microsoft Fluent Emoji (MIT licence, copyright Microsoft Corporation — see
  `public/images/words/LICENSE-fluentui-emoji.txt`) plus custom drawings made for this project in the same style.
  Nothing is taken from the PDF's picture chart, whose licence was unclear.
- **Audio** files are _placeholders_ generated with the macOS Thai voice "Kanya" (`say -v Kanya "กอ ไก่"`), because the
  source has no audio. They are Thai text-to-speech of the Thai word, not derived from Burmese. Replace them with
  recordings by a native speaker.

## Content review log

Items for the project owner to confirm.

### Open

| Item                                   | Detail                                                                                                                                                                                                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ฝ-ฝา`, `ฟ-ฟัน` pronunciation          | The source writes these in Latin script (`Faw Far`, `Faw Fan`); Burmese script has no /f/. Stored as-is and listed in `PENDING_BURMESE_PRONUNCIATION`. Provide Burmese if desired.                                                                                                                             |
| `ษ-ฤาษี` meaning                       | Source text reads `ရသေ့င်္` (trailing kinzi with no following consonant, which renders as a broken glyph). Stored as `ရသေ့`.                                                                                                                                                                                   |
| `ฮ-นกฮูก` pronunciation                | Source splits it over two lines (`ဟော` / `နို(က်)ဟု(က်)`); stored joined as `ဟောနို(က်)ဟု(က်)`.                                                                                                                                                                                                                |
| `ญ-หญิง` pronunciation                 | Source gives two variants `ယောယင်/ယောဖူးယင်`; stored as written.                                                                                                                                                                                                                                               |
| Vowel sounds and Burmese pronunciation | Drafted by Claude at the owner's request (2026-10-01), following the spellings in the consonant words (เสือ → ဆူးရ, เฌอ → ချေး, ฤาษี → ရူဆီး). Pairs share a Burmese spelling where Burmese has no matching vowel: `-ึ`/`-ุ`, `-ือ`/`-ู`, `เ-ะ`/`เ-อะ`, `เ-`/`เ-อ`. To be reviewed and corrected by the owner. |
| Burmese rules and names                | Drafted by Claude at the owner's request (2026-10-01): tone names in `tones.json`, vowel group names and notes in `vowelGroups.json`, and the tones explanations in `guide.json`. To be reviewed by the owner.                                                                                                 |
| Approximate pictures                   | จาน, ฤาษี, มณโฑ, ทหาร and ยักษ์ use the closest Fluent emoji (see [Current picture sources](#current-picture-sources)). Confirm or replace.                                                                                                                                                                    |
| Audio                                  | Placeholder text-to-speech; see [Sources and licensing](#sources-and-licensing).                                                                                                                                                                                                                               |

### Mechanical Unicode fixes applied (no change in rendering)

| Word                                                           | Source text layer                          | Stored                                             |
| -------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| `ฃ-ขวด` pronunciation                                          | `ခေါခု၀ပ်` (digit zero `၀` U+1040)         | `ခေါခုဝပ်` (letter wa `ဝ` U+101D)                  |
| `ว-แหวน` pronunciation                                         | ZWNJ + `ေ` typed before `၀` (visual order) | `ဝေါဝယ်(န်)` (logical order)                       |
| `ผ-ผึ้ง` pronunciation                                         | asat before dot-below                      | `ဖောဖွန့်` (canonical order: dot-below, then asat) |
| `ร-เรือ` pronunciation, `บ-ใบไม้`, `ฐ-ฐาน`, `ภ-สำเภา` meanings | spaces inserted by PDF text extraction     | spaces removed                                     |
| Class name `အမြင့်သံဗျည်းအုပ်စု`                               | stray `ံ` after `့`                        | removed                                            |
