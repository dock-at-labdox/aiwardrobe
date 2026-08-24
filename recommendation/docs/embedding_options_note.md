# Embedding options for compatibility scoring

Short note, for benchmarking once real vision-color output is available.
Two real candidates, not yet decided between.

## Option A: FashionCLIP-family, over garment images

What it is: a CLIP model fine-tuned specifically on fashion image-text
pairs. Produces an embedding directly from the garment cutout image.
Marqo-FashionCLIP is a newer, faster variant of the original.

Pros:

- Learns directly from visual appearance, catching things attribute
  labels might miss (texture, drape, subtle pattern)
- Open weight, self-hostable, no per-request API cost
- Well established in fashion ML literature specifically

Cons:

- Needs the garment cutout image at inference time, an extra
  dependency on the media service rather than just structured data
- Fine-tuned on long descriptive captions, may be biased toward
  standard product photography, needs validation against our own
  capture conditions
- Heavier model, more compute per request than a small text model

## Option B: small sentence embedding model, over structured attribute text

What it is: a lightweight text embedding model (for example
all-MiniLM-L6-v2), run over a canonicalized attribute string built from
the item's category, color, pattern, material, formality and
silhouette, which vision-color will already provide as structured
fields.

Pros:

- Does not need the raw image at all, only the structured attributes
  this service already receives
- Much smaller and cheaper to run at our scale
- Simple to canonicalize into a consistent input string, easy to debug
  when a score looks wrong

Cons:

- Loses any visual nuance not captured in the structured attributes
- Compatibility quality depends entirely on how good and complete the
  attribute extraction from vision-color turns out to be

## Why this is not decided yet

Since our items arrive as classified attributes rather than raw pixels
by the time they reach the recommendation service, Option B may be
sufficient and is cheaper, but this is an assumption, not a result.
Once real vision-color output exists, plan is a head-to-head benchmark
on the same set of outfits: compare compatibility scores from both
options against the golden evaluation set's human-judged rankings, and
pick based on which correlates better, not on which is cheaper alone.
