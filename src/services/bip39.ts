/**
 * Comprehensive BIP-39 implementation with full 2048 English wordlist,
 * cryptographic entropy generation, SHA-256 checksum validation,
 * and PBKDF2 HMAC-SHA512 seed derivation.
 */

import { EntropyWordCount, VerificationChallenge, WalletCredentials } from '../types/onboarding';

// Official BIP-39 English Wordlist (2048 words)
export const BIP39_WORDLIST: string[] = [
  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
  "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
  "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
  "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
  "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert",
  "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter",
  "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger",
  "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
  "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic",
  "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest",
  "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset",
  "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction",
  "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake",
  "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge",
  "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain",
  "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become",
  "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit",
  "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology",
  "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless",
  "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body",
  "boil", "bomb", "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss",
  "bottom", "bounce", "box", "boy", "bracket", "brain", "brand", "brass", "brave", "bread",
  "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze",
  "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bulb",
  "bulk", "bullet", "bundle", "bunker", "burden", "burger", "burst", "bus", "business", "busy",
  "butter", "buyer", "buzz", "cabbage", "cabin", "cable", "cactus", "cage", "cake", "call",
  "calm", "camera", "camp", "can", "canal", "cancel", "candy", "cannon", "canoe", "canvas",
  "canyon", "capable", "capital", "captain", "car", "carbon", "card", "cargo", "carpet", "carry",
  "cart", "case", "cash", "casino", "castle", "casual", "cat", "catalog", "catch", "category",
  "cattle", "caught", "cause", "caution", "cave", "ceiling", "celery", "cement", "census", "century",
  "cereal", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "chase",
  "chat", "cheap", "check", "cheese", "chef", "cherry", "chest", "chicken", "chief", "child",
  "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle",
  "citizen", "city", "civil", "claim", "clap", "clarify", "claw", "clay", "clean", "clerk",
  "clever", "click", "client", "cliff", "climb", "clinic", "clip", "clock", "clog", "close",
  "cloth", "cloud", "clown", "club", "clump", "cluster", "clutch", "coach", "coast", "coconut",
  "code", "coffee", "coil", "coin", "collect", "color", "column", "combine", "come", "comfort",
  "comic", "common", "company", "concert", "conduct", "confirm", "congress", "connect", "consider", "control",
  "convince", "cook", "cool", "copper", "copy", "coral", "core", "corn", "correct", "cost",
  "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack", "cradle",
  "craft", "cram", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit", "creek",
  "crew", "cricket", "crime", "crisp", "critic", "crop", "cross", "crouch", "crowd", "crucial",
  "cruel", "cruise", "crumble", "crunch", "crush", "cry", "crystal", "cube", "culture", "cup",
  "cupboard", "curious", "current", "curtain", "curve", "cushion", "custom", "cute", "cycle", "dad",
  "damage", "damp", "dance", "danger", "daring", "dash", "daughter", "dawn", "day", "deal",
  "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "deer", "defense",
  "define", "defy", "degree", "delay", "deliver", "demand", "demise", "denial", "dentist", "deny",
  "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design", "desk",
  "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "dial", "diamond",
  "diary", "dice", "diesel", "diet", "differ", "digital", "dignity", "dilemma", "dinner", "dinosaur",
  "direct", "dirt", "disagree", "discover", "disease", "dish", "dismiss", "disorder", "display", "distance",
  "divert", "divide", "divorce", "dizzy", "doctor", "document", "dog", "doll", "dolphin", "domain",
  "donate", "donkey", "donor", "door", "dose", "double", "dove", "draft", "dragon", "drain",
  "drama", "drastic", "draw", "dream", "dress", "drift", "drill", "drink", "drip", "drive",
  "drop", "drum", "dry", "duck", "dumb", "dune", "during", "dust", "dutch", "duty",
  "dwarf", "dynamic", "eager", "eagle", "early", "earn", "earth", "easily", "east", "easy",
  "echo", "ecology", "economy", "edge", "edit", "educate", "effort", "egg", "eight", "either",
  "elbow", "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "else", "embark",
  "embody", "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "end",
  "endless", "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist",
  "enough", "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal",
  "equip", "era", "erase", "erode", "erosion", "error", "erupt", "escape", "essay", "essence",
  "estate", "eternal", "ethics", "evidence", "evil", "evoke", "evolve", "exact", "example", "excess",
  "exchange", "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist",
  "exit", "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra",
  "eye", "eyebrow", "fabric", "face", "faculty", "fade", "faint", "faith", "fall", "false",
  "fame", "family", "famous", "fan", "fancy", "fantasy", "farm", "fashion", "fat", "fatal",
  "father", "fatigue", "fault", "favorite", "feature", "february", "federal", "fee", "feed", "feel",
  "female", "fence", "festival", "fetch", "fever", "few", "fiber", "fiction", "field", "figure",
  "file", "film", "filter", "final", "find", "fine", "finger", "finish", "fire", "firm",
  "first", "fiscal", "fish", "fit", "fitness", "fix", "flag", "flame", "flash", "flat",
  "flavor", "flee", "flight", "flip", "float", "flock", "floor", "flower", "fluid", "flush",
  "fly", "foam", "focus", "fog", "foil", "fold", "follow", "food", "foot", "force",
  "forest", "forget", "fork", "fortune", "forum", "forward", "fossil", "foster", "found", "fox",
  "fragile", "frame", "frequent", "fresh", "friend", "fringe", "frog", "front", "frost", "frown",
  "frozen", "fruit", "fuel", "fun", "funny", "furnace", "fury", "future", "gadget", "gain",
  "galaxy", "gallery", "game", "gap", "garage", "garbage", "garden", "garlic", "garment", "gas",
  "gasp", "gate", "gather", "gauge", "gaze", "general", "genius", "genre", "gentle", "genuine",
  "gesture", "ghost", "giant", "gift", "giggle", "ginger", "giraffe", "girl", "give", "glad",
  "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "glow",
  "glue", "goat", "goddess", "gold", "good", "goose", "gorilla", "gospel", "gossip", "govern",
  "gown", "grab", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green",
  "grid", "grief", "grit", "grocery", "group", "grow", "grunt", "guard", "guess", "guide",
  "guilt", "guitar", "gun", "gym", "habit", "hair", "half", "hammer", "hamster", "hand",
  "handle", "harbor", "hard", "harsh", "harvest", "hat", "have", "hawk", "hazard", "head",
  "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "help", "hen", "hero",
  "hidden", "high", "hill", "hint", "hip", "hire", "history", "hobby", "hockey", "hold",
  "hole", "holiday", "hollow", "home", "honey", "hood", "hope", "horn", "horror", "horse",
  "hospital", "host", "hotel", "hour", "house", "hover", "hub", "huge", "human", "humble",
  "humor", "hundred", "hungry", "hunt", "hurdle", "hurry", "hurt", "husband", "hybrid", "ice",
  "icon", "idea", "identify", "idle", "ignore", "ill", "illegal", "illness", "image", "imitate",
  "immense", "immune", "impact", "impose", "improve", "impulse", "inch", "include", "income", "increase",
  "index", "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial",
  "inject", "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside",
  "inspire", "install", "intact", "interest", "into", "invest", "invite", "involve", "iron", "island",
  "isolate", "issue", "item", "ivory", "jacket", "jaguar", "jar", "jazz", "jealous", "jeans",
  "jelly", "jewel", "job", "join", "joke", "journey", "joy", "judge", "juice", "jump",
  "jungle", "junior", "junk", "just", "kangaroo", "keen", "keep", "ketchup", "key", "kick",
  "kid", "kidney", "kind", "kingdom", "kiss", "kit", "kitchen", "kite", "kitten", "kiwi",
  "knee", "knife", "knock", "know", "lab", "label", "labor", "ladder", "lady", "lake",
  "lamp", "language", "laptop", "large", "later", "latin", "laugh", "laundry", "lava", "law",
  "lawn", "lawsuit", "layer", "lazy", "leader", "leaf", "learn", "leave", "lecture", "left",
  "leg", "legal", "legend", "leisure", "lemon", "lend", "length", "lens", "leopard", "lesson",
  "letter", "level", "liar", "liberty", "library", "license", "life", "lift", "light", "like",
  "limb", "limit", "link", "lion", "liquid", "list", "little", "live", "lizard", "load",
  "loan", "lobster", "local", "lock", "logic", "lonely", "long", "loop", "lottery", "loud",
  "lounge", "love", "loyal", "lucky", "luggage", "lumber", "lunar", "lunch", "luxury", "lyrics",
  "machine", "mad", "magic", "magnet", "maid", "mail", "main", "major", "make", "mammal",
  "man", "manage", "mandate", "mango", "mansion", "manual", "maple", "marble", "march", "margin",
  "marine", "market", "marriage", "mask", "mass", "master", "match", "material", "math", "matrix",
  "matter", "maximum", "maze", "meadow", "mean", "measure", "meat", "mechanic", "medal", "media",
  "melody", "melt", "member", "memory", "mention", "menu", "mercy", "merge", "merit", "merry",
  "mesh", "message", "metal", "method", "middle", "midnight", "milk", "million", "mimic", "mind",
  "minimum", "minor", "minute", "miracle", "mirror", "misery", "miss", "mistake", "mix", "mixed",
  "mixture", "mobile", "model", "modify", "mom", "moment", "monitor", "monkey", "monster", "month",
  "moon", "moral", "more", "morning", "mosquito", "mother", "motion", "motor", "mountain", "mouse",
  "move", "movie", "much", "muffin", "mule", "multiply", "muscle", "museum", "mushroom", "music",
  "must", "mutual", "myself", "mystery", "myth", "naive", "name", "napkin", "narrow", "nasty",
  "nation", "nature", "near", "neck", "need", "negative", "neglect", "neither", "nephew", "nerve",
  "nest", "net", "network", "neutral", "never", "news", "next", "nice", "night", "noble",
  "noise", "nominee", "noodle", "normal", "north", "nose", "notable", "note", "nothing", "notice",
  "novel", "now", "nuclear", "number", "nurse", "nut", "oak", "obey", "object", "oblige",
  "obscure", "observe", "obtain", "obvious", "occur", "ocean", "october", "odor", "off", "offer",
  "office", "often", "oil", "okay", "old", "olive", "olympic", "omit", "once", "one",
  "onion", "online", "only", "open", "opera", "opinion", "oppose", "option", "orange", "orbit",
  "orchard", "order", "ordinary", "organ", "orient", "original", "orphan", "ostrich", "other", "outdoor",
  "outer", "output", "outside", "oval", "oven", "over", "own", "owner", "oxygen", "oyster",
  "ozone", "pact", "paddle", "page", "pair", "palace", "palm", "panda", "panel", "panic",
  "panther", "paper", "parade", "parent", "park", "parrot", "party", "pass", "patch", "path",
  "patient", "patrol", "pattern", "pause", "pave", "payment", "peace", "peanut", "pear", "peasant",
  "pelican", "pen", "penalty", "pencil", "people", "pepper", "perfect", "permit", "person", "pet",
  "phone", "photo", "phrase", "physical", "piano", "picnic", "picture", "piece", "pig", "pigeon",
  "pill", "pilot", "pink", "pioneer", "pipe", "pistol", "pitch", "pizza", "place", "planet",
  "plastic", "plate", "play", "please", "pledge", "pluck", "plug", "plunge", "poem", "poet",
  "point", "polar", "pole", "police", "pond", "pony", "pool", "popular", "portion", "position",
  "possible", "post", "potato", "pottery", "poverty", "powder", "power", "practice", "praise", "predict",
  "prefer", "prepare", "present", "pretty", "prevent", "price", "pride", "primary", "print", "priority",
  "prison", "private", "prize", "problem", "process", "produce", "profit", "program", "project", "promote",
  "proof", "property", "prosper", "protect", "proud", "provide", "public", "pudding", "pull", "pulp",
  "pulse", "pumpkin", "punch", "pupil", "puppy", "purchase", "purity", "purpose", "purse", "push",
  "put", "puzzle", "pyramid", "quality", "quantum", "quarter", "question", "quick", "quit", "quiz",
  "quote", "rabbit", "raccoon", "race", "rack", "radar", "radio", "rail", "rain", "raise",
  "rally", "ramp", "ranch", "random", "range", "rapid", "rare", "rate", "rather", "raven",
  "raw", "razor", "ready", "real", "reason", "rebel", "rebuild", "recall", "receive", "recipe",
  "record", "recycle", "reduce", "reflect", "reform", "refuse", "region", "regret", "regular", "reject",
  "relax", "release", "relief", "rely", "remain", "remember", "remind", "remove", "render", "renew",
  "rent", "reopen", "repair", "repeat", "replace", "report", "require", "rescue", "resemble", "resist",
  "resource", "response", "result", "retire", "retreat", "return", "reunion", "reveal", "review", "reward",
  "rhythm", "rib", "ribbon", "rice", "rich", "ride", "ridge", "rifle", "right", "rigid",
  "ring", "riot", "ripple", "risk", "ritual", "rival", "river", "road", "roast", "robot",
  "robust", "rocket", "romance", "roof", "rookie", "room", "rose", "rotate", "rough", "round",
  "route", "royal", "rubber", "rude", "rug", "rule", "run", "runway", "rural", "sad",
  "saddle", "sadness", "safe", "sail", "salad", "salmon", "salon", "salt", "salute", "same",
  "sample", "sand", "satisfy", "satoshi", "sauce", "sausage", "save", "say", "scale", "scan",
  "scare", "scatter", "scene", "scheme", "school", "science", "scissors", "scorpion", "scout", "scrap",
  "screen", "script", "scrub", "sea", "search", "season", "seat", "second", "secret", "section",
  "security", "seed", "seek", "segment", "select", "sell", "seminar", "senior", "sense", "sentence",
  "series", "service", "session", "settle", "setup", "seven", "shadow", "shaft", "shallow", "share",
  "shed", "shell", "sheriff", "shield", "shift", "shine", "ship", "shiver", "shock", "shoe",
  "shoot", "shop", "short", "shoulder", "shove", "shrimp", "shrug", "shuffle", "shy", "sibling",
  "sick", "side", "siege", "sight", "sign", "silent", "silk", "silly", "silver", "similar",
  "simple", "since", "sing", "siren", "sister", "situate", "six", "size", "skate", "sketch",
  "ski", "skill", "skin", "skirt", "skull", "slab", "slam", "sleep", "slender", "slice",
  "slide", "slight", "slim", "slogan", "slot", "slow", "slush", "small", "smart", "smile",
  "smoke", "smooth", "snack", "snake", "snap", "sniff", "snow", "soap", "soccer", "social",
  "sock", "soda", "soft", "solar", "soldier", "solid", "solution", "solve", "someone", "song",
  "soon", "sorry", "sort", "soul", "sound", "soup", "source", "south", "space", "spare",
  "spatial", "spawn", "speak", "special", "speed", "spell", "spend", "sphere", "spice", "spider",
  "spike", "spin", "spirit", "split", "spoil", "sponsor", "spoon", "sport", "spot", "spray",
  "spread", "spring", "spy", "square", "squeeze", "squirrel", "stable", "stadium", "staff", "stage",
  "stairs", "stamp", "stand", "start", "state", "stay", "steak", "steel", "stem", "step",
  "stereo", "stick", "still", "sting", "stock", "stomach", "stone", "stool", "story", "stove",
  "strategy", "street", "strike", "strong", "struggle", "student", "stuff", "stumble", "style", "subject",
  "submit", "subway", "success", "such", "sudden", "suffer", "sugar", "suggest", "suit", "summer",
  "sun", "sunny", "sunset", "super", "supply", "supreme", "sure", "surface", "surge", "surprise",
  "surround", "survey", "suspect", "sustain", "swallow", "swamp", "swap", "swarm", "swear", "sweet",
  "swift", "swim", "swing", "switch", "sword", "symbol", "symptom", "syrup", "system", "table",
  "tackle", "tag", "tail", "talent", "talk", "tank", "tape", "target", "task", "taste",
  "tattoo", "taxi", "teach", "team", "tell", "ten", "tenant", "tennis", "tent", "term",
  "test", "text", "thank", "that", "theme", "then", "theory", "there", "they", "thing",
  "this", "thought", "three", "thrive", "throw", "thumb", "thunder", "ticket", "tide", "tiger",
  "tilt", "timber", "time", "tiny", "tip", "tired", "tissue", "title", "toast", "tobacco",
  "today", "toddler", "toe", "together", "toilet", "token", "tomato", "tomorrow", "tone", "tongue",
  "tonight", "tool", "tooth", "top", "topic", "topple", "torch", "tornado", "tortoise", "toss",
  "total", "tourist", "toward", "tower", "town", "toy", "track", "trade", "traffic", "train",
  "transfer", "trap", "trash", "travel", "tray", "treat", "tree", "trend", "trial", "tribe",
  "trick", "trigger", "trim", "trip", "trophy", "trouble", "truck", "true", "truly", "trumpet",
  "trust", "truth", "try", "tube", "tuition", "tumble", "tuna", "tunnel", "turkey", "turn",
  "turtle", "twelve", "twenty", "twice", "twin", "twist", "two", "type", "typical", "ugly",
  "umbrella", "unable", "unaware", "uncle", "uncover", "under", "undo", "unfair", "unfold", "unhappy",
  "uniform", "unique", "unit", "universe", "unknown", "unlock", "until", "unusual", "unveil", "update",
  "upgrade", "uphold", "upon", "upper", "upset", "urban", "urge", "usage", "use", "used",
  "useful", "useless", "usual", "utility", "vacant", "vacuum", "vague", "valid", "valley", "valve",
  "van", "vanish", "vapor", "various", "vast", "vault", "vehicle", "velvet", "vendor", "venture",
  "venue", "verb", "verify", "version", "very", "vessel", "veteran", "viable", "vibrant", "vicious",
  "victory", "video", "view", "village", "vintage", "violin", "virtual", "virus", "visa", "visit",
  "visual", "vital", "vivid", "vocal", "voice", "void", "volcano", "volume", "vote", "voyage",
  "wage", "wagon", "wait", "walk", "wall", "walnut", "want", "warfare", "warm", "warrior",
  "wash", "wasp", "waste", "water", "wave", "way", "wealth", "weapon", "wear", "weasel",
  "weather", "web", "wedding", "weekend", "weird", "welcome", "west", "wet", "whale", "what",
  "wheat", "wheel", "when", "where", "whip", "whisper", "wide", "width", "wife", "wild",
  "will", "win", "window", "wine", "wing", "wink", "winner", "winter", "wire", "wisdom",
  "wise", "wish", "witness", "wolf", "woman", "wonder", "wood", "wool", "word", "work",
  "world", "worry", "worth", "wrap", "wreck", "wrestle", "wrist", "write", "wrong", "yard",
  "year", "yellow", "you", "young", "youth", "zebra", "zero", "zone", "zoo"
];

// Quick index lookup
const WORD_MAP: Map<string, number> = new Map(BIP39_WORDLIST.map((word, index) => [word, index]));

/**
 * Helper to convert Uint8Array to binary string
 */
function bytesToBinaryString(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += bytes[i].toString(2).padStart(8, '0');
  }
  return bin;
}

/**
 * Generate cryptographically secure BIP-39 mnemonic
 */
export async function generateMnemonic(wordCount: EntropyWordCount = 12): Promise<{ mnemonic: string; words: string[] }> {
  // 12 words = 128 bits entropy (16 bytes), 4 bits checksum
  // 24 words = 256 bits entropy (32 bytes), 8 bits checksum
  const entropyBytes = wordCount === 12 ? 16 : 32;
  const entropy = new Uint8Array(entropyBytes);
  crypto.getRandomValues(entropy);

  // SHA-256 of entropy for checksum
  const hashBuffer = await crypto.subtle.digest('SHA-256', entropy);
  const hashArray = new Uint8Array(hashBuffer);
  const hashBits = bytesToBinaryString(hashArray);

  const checksumLength = wordCount === 12 ? 4 : 8;
  const checksumBits = hashBits.slice(0, checksumLength);

  const entropyBits = bytesToBinaryString(entropy);
  const combinedBits = entropyBits + checksumBits;

  // Split into 11-bit chunks
  const words: string[] = [];
  for (let i = 0; i < combinedBits.length; i += 11) {
    const chunk = combinedBits.slice(i, i + 11);
    const wordIndex = parseInt(chunk, 2);
    words.push(BIP39_WORDLIST[wordIndex]);
  }

  return {
    mnemonic: words.join(' '),
    words
  };
}

/**
 * Validate a user provided mnemonic string
 */
export async function validateMnemonic(mnemonicInput: string): Promise<{ valid: boolean; error?: string; words?: string[] }> {
  const words = mnemonicInput
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length !== 12 && words.length !== 24) {
    return {
      valid: false,
      error: `Invalid word count: expected 12 or 24 words, but received ${words.length}.`
    };
  }

  // Check every word exists in wordlist
  for (const word of words) {
    if (!WORD_MAP.has(word)) {
      return {
        valid: false,
        error: `Unknown word '${word}' is not in the standard BIP-39 English dictionary.`
      };
    }
  }

  // Verify checksum
  let combinedBits = '';
  for (const word of words) {
    const index = WORD_MAP.get(word)!;
    combinedBits += index.toString(2).padStart(11, '0');
  }

  const checksumLength = words.length === 12 ? 4 : 8;
  const entropyBits = combinedBits.slice(0, combinedBits.length - checksumLength);
  const checksumBits = combinedBits.slice(combinedBits.length - checksumLength);

  // Convert entropyBits back to bytes
  const entropyBytes = new Uint8Array(entropyBits.length / 8);
  for (let i = 0; i < entropyBytes.length; i++) {
    entropyBytes[i] = parseInt(entropyBits.slice(i * 8, (i + 1) * 8), 2);
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', entropyBytes);
  const hashBits = bytesToBinaryString(new Uint8Array(hashBuffer));
  const expectedChecksum = hashBits.slice(0, checksumLength);

  if (checksumBits !== expectedChecksum) {
    return {
      valid: false,
      error: 'Invalid BIP-39 checksum. Please ensure the words are in the correct sequence.'
    };
  }

  return {
    valid: true,
    words
  };
}

/**
 * Derives BIP-39 512-bit seed via PBKDF2 (HMAC-SHA512, 2048 iterations)
 */
export async function mnemonicToSeedHex(mnemonic: string, passphrase: string = ''): Promise<string> {
  const enc = new TextEncoder();
  const password = enc.encode(mnemonic.normalize('NFKD'));
  const salt = enc.encode(`mnemonic${passphrase}`.normalize('NFKD'));

  // WebCrypto PBKDF2 HMAC-SHA512
  const baseKey = await crypto.subtle.importKey(
    'raw',
    password,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 2048,
      hash: 'SHA-512'
    },
    baseKey,
    512
  );

  const bytes = new Uint8Array(derived);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives deterministic multi-chain mock addresses & fingerprint from seedHex
 */
export async function deriveMockAddresses(seedHex: string): Promise<WalletCredentials['accounts'] & { fingerprint: string }> {
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(seedHex));
  const hashArr = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

  const fingerprint = hashArr.slice(0, 8).toUpperCase();
  const eth = `0x${hashArr.slice(8, 48)}`;
  const btc = `bc1q${hashArr.slice(12, 44)}`;
  const sol = `${hashArr.slice(16, 48)}Sol`;

  return {
    btc,
    eth,
    sol,
    fingerprint
  };
}

/**
 * Pick 3 random word positions and generate 5 options for each
 */
export function generateVerificationChallenges(words: string[]): VerificationChallenge[] {
  const total = words.length;
  // Pick 3 unique random indices
  const indices = new Set<number>();
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * total));
  }

  const sortedIndices = Array.from(indices).sort((a, b) => a - b);

  return sortedIndices.map(wordIndex => {
    const correctWord = words[wordIndex];
    const distractors = new Set<string>();

    while (distractors.size < 4) {
      const randomWord = BIP39_WORDLIST[Math.floor(Math.random() * BIP39_WORDLIST.length)];
      if (randomWord !== correctWord) {
        distractors.add(randomWord);
      }
    }

    const options = [correctWord, ...Array.from(distractors)];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      wordIndex,
      displayNumber: wordIndex + 1,
      correctWord,
      options
    };
  });
}

/**
 * Find autocomplete suggestions from the BIP-39 dictionary
 */
export function getWordSuggestions(prefix: string, limit: number = 5): string[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];
  const results: string[] = [];
  for (const word of BIP39_WORDLIST) {
    if (word.startsWith(p)) {
      results.push(word);
      if (results.length >= limit) break;
    }
  }
  return results;
}
