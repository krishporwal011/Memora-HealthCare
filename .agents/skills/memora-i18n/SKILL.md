---
name: memora-i18n
description: Use when adding or changing strings, languages, fonts, or speech (TTS/ASR) in Memora.
---

# i18n and speech
1. Strings live in `frontend/locales/<lang>.json`; no sentence concatenation; every key exists in `en.json` first.
2. Scripts: Bengali script (as, bn), Devanagari (hi, ne, brx), Meitei Mayek (mni). Load the matching Noto font per language.
3. Test at 200% text size and 30% longer strings; no clipped buttons.
4. Speech order: Bhashini, then recorded audio, then text/icons. Verify coverage per language with the Bhashini pipeline API before claiming support. Audio is transcribed then discarded.
5. Machine-assisted translations need a `_note` and native-speaker review.
