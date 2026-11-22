/*
 * Game data for the Witcher Trilogy Decision Tree.
 *
 * Everything the planner knows lives here; the code in planner.js, tree.js and app.js holds no game facts.
 *
 * Keys: a choice is addressed as "<game>.<choice>", e.g. "w1.adda". Conditions ("when") map keys to:
 *   "*"          the choice is known (revealed and made)
 *   null         the choice is not known yet
 *   "value"      the choice is known and equals this option
 *   ["a", "b"]   the choice is one of these (may include null)
 * An array of condition objects means "any of these".
 *
 * Text may reference a choice as {w2.prison}; it is replaced by the chosen option's label.
 */
(function (root) {
  "use strict";

  const w1 = {
    id: "w1",
    title: "The Witcher",
    subtitle: "Game 1 · 2007 · Enhanced Edition",
    tab: "Game 1",
    layout: { x0: 20, step: 165, nodeWidth: 148, nodeHeight: 40, height: 330 },
    columns: ["Prologue", "Chapter I", "Chapter II", "Chapter III", "Chapter IV", "Chapter V", "Epilogue", "To game 2"],
    sampleRoute: {
      pro: "triss", crates: "refuse", vesna: "yes", leo: "talk", abigail: "protect", sewers: "alone",
      invest: "azar", swamp: "neutral", alvin: "triss", vincent: "cure", thaler: "lives", bank: "yaevinn",
      lake: "compromise", berengar: "spare", path: "neutral", adda: "save", hunt: "refuse"
    },
    choices: [
      {
        id: "pro", chapter: "Prologue", at: [0, 50],
        title: "Help Vesemir or Triss", short: "Vesemir or Triss", hidden: "Attack on Kaer Morhen",
        when: "In the prologue, during the attack on Kaer Morhen.",
        question: "During the attack on Kaer Morhen, you either fight the Frightener with Vesemir or protect the laboratory with Triss.",
        options: [
          { id: "vesemir", label: "Help Vesemir", effects: ["Vesemir later gives you a red meteorite.", "At the bridge in chapter I you face Salamandra with a mutant dog; the cutscene is negative about your choice."] },
          { id: "triss", label: "Help Triss", effects: ["You can take a sapphire from Savolla's corpse.", "At the bridge in chapter I only Salamandra, without a dog; the cutscene is positive."] }
        ]
      },
      {
        id: "crates", chapter: "Chapter I: Outskirts of Vizima", at: [1, 50],
        title: "Haren Brogg's crates",
        when: "In chapter I, at Haren Brogg's weapon crates.",
        question: "Do you give the weapons to the Scoia'tael or not?",
        options: [
          { id: "give", label: "Give the weapons", effects: ["The Scoia'tael use them to kill Coleman in chapter II, as soon as you go to the Hairy Bear after talking to the detective. The side quest The Rat then almost always fails.", "Before the swamp in chapter II, the dwarves may react to you differently because of what you did with these crates."] },
          { id: "refuse", label: "Don't give them (or kill the Scoia'tael)", effects: ["Coleman stays alive.", "If you refuse, Golan Vivaldi is locked up in chapter II; you buy his freedom for 200 orens to get two books."] }
        ]
      },
      {
        id: "vesna", chapter: "Chapter I: Outskirts of Vizima", at: [1, 166],
        title: "Escort Vesna", hidden: "Vesna",
        when: "In chapter I, when you meet Vesna.",
        question: "A minor choice with no further consequences.",
        options: [
          { id: "yes", label: "Escort her", effects: ["You can meet her at the mill at night."] },
          { id: "no", label: "Don't help", effects: ["Bandits kill her."] }
        ]
      },
      {
        id: "leo", chapter: "Chapter I: Outskirts of Vizima", at: [1, 224],
        title: "Leo's ghost", hidden: "Dead Hand of the Past",
        when: "In chapter I, during the quest Dead Hand of the Past.",
        question: "Do you fight Leo's ghost, or try to talk your way out? A minor choice with no further consequences.",
        options: [
          { id: "fight", label: "Fight", effects: ["Leo's ghost drops a red meteorite."] },
          { id: "talk", label: "Talk", effects: ["Two of the three dialogue paths still lead to Leo's ghost appearing; only one avoids the fight."] }
        ]
      },
      {
        id: "abigail", chapter: "Chapter I: Outskirts of Vizima", at: [1, 108], major: true,
        title: "Abigail or the villagers", short: "Abigail", hidden: "The village witch",
        when: "At the end of chapter I, when the villagers turn on Abigail.",
        question: "The first real moral choice: do you hand the witch over to the Reverend and the mob, or do you protect her?",
        options: [
          { id: "protect", label: "Protect Abigail", effects: ["You fight the guilty villagers; Abigail fights the Beast alongside you.", "If she survives that fight, you see her again in chapter IV and she helps you in the epilogue.", "The quest The Heat of the Day in chapter IV ends differently."] },
          { id: "surrender", label: "Hand Abigail over", effects: ["She dies; you fight the Beast together with the villagers and don't have to fight them afterwards.", "In chapter IV a nameless healer lives in the hut; in the epilogue you have to fight Abigail.", "In The Heat of the Day you are told that there is innocent blood on your hands."] }
        ]
      },
      {
        id: "sewers", chapter: "Chapter II: Temple Quarter", at: [2, 50],
        title: "Sewers: with Siegfried or alone", short: "Sewers: Siegfried?", hidden: "The sewers",
        when: "In chapter II, when you go after the cockatrice in the sewers.",
        question: "Do you go into the sewers with Siegfried, or kill the cockatrice alone?",
        options: [
          { id: "siegfried", label: "With Siegfried", effects: ["You get onto the dike easily and the Order's weaponsmith trades with you.", "At the hospital you need the city guard's signet ring or a 30-oren bribe."] },
          { id: "alone", label: "Alone", effects: ["You can walk straight into the hospital.", "The Order's weaponsmith won't trade with you; the dwarven smith will if you helped the Scoia'tael.", "At the dike you need the signet ring or 60 orens."] }
        ]
      },
      {
        id: "invest", chapter: "Chapter II: Temple Quarter", at: [2, 108], major: true,
        title: "The investigation: who works for Azar Javed?", short: "Raymond is Azar?", hidden: "The investigation",
        when: "In chapter II, during the investigation with the detective Raymond.",
        question: "The detective Raymond has you check out suspects. Do you discover that Raymond is dead and Azar has taken his place (the body in the crypt or the right autopsy), or do you point at Ramsmeat or Kalkstein?",
        options: [
          { id: "azar", label: "Unmask Azar", effects: ["You see through the game; with Kalkstein's help you can confront or bluff Azar on your own terms."] },
          { id: "wrong", label: "Accuse Ramsmeat or Kalkstein", effects: ["An innocent takes the blame and Azar uses you to get rid of his rivals.", "As you leave the tower, Azar reveals himself anyway and takes the book."] }
        ],
        note: "Either way, the chapter ends with the fight against Azar and the Professor in the swamp."
      },
      {
        id: "swamp", chapter: "Chapter II: Temple Quarter", at: [2, 166], major: true,
        title: "Swamp: the Order, the Scoia'tael or neutral", short: "Swamp: which side?", hidden: "Force Recon",
        when: "At the end of chapter II, in the swamp (Force Recon).",
        question: "During Force Recon you pick a side for the first time. It is not final yet.",
        options: [
          { id: "order", label: "The Order", effects: ["The Scoia'tael are hostile in the city."] },
          { id: "elves", label: "The Scoia'tael", effects: ["The Order is hostile; their merchant and weaponsmith won't help you."] },
          { id: "neutral", label: "Neutral", effects: ["The Order's merchant won't help you; the Scoia'tael smith will."] }
        ]
      },
      {
        id: "alvin", chapter: "Chapter III: Trade Quarter", at: [3, 50], major: true,
        title: "Who do you leave Alvin with?", short: "Alvin: Triss or Shani", hidden: "A home for Alvin",
        when: "In chapter III, when you look for a safe place for Alvin.",
        question: "Triss or Shani. This decides the romance and the type of ending.",
        options: [
          { id: "triss", label: "Triss", effects: ["In chapter IV Alvin wanders off to the ruins, where you meet the gambling ghost.", "Shani is angry in chapter V, but still helps and talks to you. Her second romance card is lost.", "Triss fights alongside you in the epilogue."] },
          { id: "shani", label: "Shani", effects: ["In chapter IV Alvin goes to the riverbank and gets a dog.", "Triss is angry in chapter V, but still helps and talks to you. Her second romance card is lost.", "Shani fights alongside you in the epilogue."] }
        ]
      },
      {
        id: "vincent", chapter: "Chapter III: Trade Quarter", at: [3, 108], major: true,
        title: "The werewolf Vincent Meis", short: "Werewolf Vincent", hidden: "Vincent Meis",
        when: "In chapter III, at the end of the hunt for the beast in the Trade Quarter.",
        question: "Do you kill the werewolf, spare him, or spare him and lift the curse?",
        options: [
          { id: "cure", label: "Spare and cure him", effects: ["At the New Narakort, Vincent and some guards come to fight Salamandra with you.", "Together with Beauty and the Beast, 6000 extra XP; the novice praises you in the epilogue."] },
          { id: "spare", label: "Spare him, no cure", effects: ["Vincent fights alongside you as a werewolf, with a few guards."] },
          { id: "kill", label: "Kill him", effects: ["1500 XP and Werewolf's Fur, used for the potion Werewolf's Wrath, which grants the Predator talent. The quest Beauty and the Beast fails.", "If you then enter the inn, you are arrested and have to fight guards.", "Carmen is unhappy; in chapter V a different captain stands at the dike."] }
        ]
      },
      {
        id: "thaler", chapter: "Chapter III: Trade Quarter", at: [3, 166],
        title: "Thaler: live or die", short: "Thaler", hidden: "Thaler",
        when: "In chapter III, when Thaler is in danger.",
        question: "According to the wiki it hardly matters in this game, but it does carry over into The Witcher 2.",
        options: [
          { id: "lives", label: "Let him live", effects: ["He hangs around in the inn and you can talk to him."] },
          { id: "dies", label: "Let him die", effects: ["No further consequences in this game."] }
        ]
      },
      {
        id: "bank", chapter: "Chapter III: Trade Quarter", at: [3, 224], major: true,
        title: "Gold Rush: the bank robbery", short: "Bank robbery", hidden: "Gold Rush",
        when: "In chapter III, during the quest Gold Rush.",
        question: "Do you help Yaevinn and the Scoia'tael escape, or do you stand with Siegfried and the Order?",
        options: [
          { id: "yaevinn", label: "Yaevinn", effects: ["The Scoia'tael fight alongside you against Azar and the Professor.", "In chapter IV you can only choose the Scoia'tael or neutral."] },
          { id: "siegfried", label: "Siegfried", effects: ["The Order fights alongside you.", "In chapter IV you can only choose the Order or neutral."] }
        ]
      },
      {
        id: "lake", chapter: "Chapter IV: Lakeside", at: [4, 50], major: true,
        title: "The conflict at the lake", short: "Lake: village or vodyanoi", hidden: "The lake",
        when: "In chapter IV, in Lakeside, where the villagers and the vodyanoi face each other.",
        question: "Do you side with the village, with the vodyanoi, or look for a compromise?",
        options: [
          { id: "village", label: "The village", effects: ["Julian gives you a large diamond."] },
          { id: "vodyanoi", label: "The vodyanoi", effects: ["The vodyanoi priest gives you the ceremonial sword of Deithwen."] },
          { id: "compromise", label: "Compromise", effects: ["The Lady of the Lake gives you the silver sword Aerondight."] }
        ]
      },
      {
        id: "berengar", chapter: "Chapter IV: Lakeside", at: [4, 108],
        title: "Berengar: kill or spare", short: "Berengar", hidden: "Berengar",
        when: "In chapter IV, during the quest The Paths of Destiny.",
        question: "The fallen witcher who worked for Salamandra.",
        options: [
          { id: "kill", label: "Kill him", effects: ["You take his witcher medallion, which weakens Azar in chapter V (according to the wiki, about a quarter of his vitality on normal difficulty).", "His body also yields scrolls, a letter and roughly 850 orens (guides differ on the exact amount)."] },
          { id: "spare", label: "Spare him", effects: ["Berengar turns up to fight alongside you against Azar, though he doesn't amount to much. You don't get his medallion."] }
        ]
      },
      {
        id: "path", chapter: "Chapter IV: Lakeside", at: [4, 166], major: true,
        title: "The final path", short: "Final path",
        when: "At the end of chapter IV.",
        question: "The most important split in the game. What you did during the bank robbery limits your options.",
        fallback: "neutral",
        options: [
          { id: "order", label: "The Order", blockedBy: { "w1.bank": "yaevinn" }, effects: ["In chapter V the Scoia'tael are your enemies.", "Reward: the Order's Raven's armor.", "Siegfried fights alongside you through Vizima in the epilogue; you fight Yaevinn's ghost."] },
          { id: "elves", label: "The Scoia'tael", blockedBy: { "w1.bank": "siegfried" }, effects: ["In chapter V the Order is your enemy and you escort refugees to the hospital.", "Reward: the elven Raven's armor.", "Yaevinn fights alongside you in the epilogue; you fight Siegfried's ghost."] },
          { id: "neutral", label: "Neutral (the witcher's way)", effects: ["In chapter V both factions are your enemies and you escort nurses.", "Reward: the neutral Raven's armor.", "Triss fights alongside you through Vizima; you either fight Siegfried and Yaevinn or part in peace, depending on your answers. On the Ice Plains you fight their ghosts."] }
        ]
      },
      {
        id: "adda", chapter: "Chapter V: Old Vizima", at: [5, 50], major: true,
        title: "Princess Adda, the striga", short: "Adda the striga", hidden: "The striga's curse",
        when: "In chapter V, in Old Vizima.",
        question: "Do you lift the curse or kill her?",
        options: [
          { id: "save", label: "Save her", effects: ["You get a steel sword; Adda fights alongside you as a striga in the epilogue.", "In The Witcher 2 she is alive and married to Radovid."] },
          { id: "kill", label: "Kill her", effects: ["From her heart you brew a potion that grants talents.", "In the epilogue Vincent helps as a werewolf, or Count de Wett if you also killed Vincent."] }
        ]
      },
      {
        id: "hunt", chapter: "Epilogue", at: [6, 50],
        title: "The King of the Wild Hunt", short: "King of the Wild Hunt",
        when: "In the epilogue, when the King of the Wild Hunt makes you an offer.",
        question: "Do you let him take Jacques de Aldersberg's soul?",
        options: [
          { id: "refuse", label: "Refuse", effects: ["You have to defeat him; he summons ghosts as reinforcements."] },
          { id: "accept", label: "Accept", effects: ["He doesn't fight you; you get less experience."] }
        ]
      }
    ],
    markers: [
      { id: "xbridge", at: [1, 282], label: "Bridge: Salamandra", jump: "card:pro" },
      { id: "xcoleman", at: [2, 224], label: "Coleman (The Rat)", hidden: "The Rat", parent: "crates", jump: "card:crates" },
      { id: "xheat", at: [4, 224], label: "The Heat of the Day", jump: "card:abigail" },
      { id: "xazar", at: [5, 108], label: "Fight with Azar", jump: "card:berengar" },
      { id: "xarmor", at: [5, 166], label: "Raven's armor", jump: "card:path" },
      { id: "xepilogue", at: [6, 108], label: "Epilogue allies", jump: "summary" },
      { id: "xw2", at: [7, 108], label: "Import into game 2", jump: "el:bridge-w1" }
    ],
    edges: [
      ["pro", "xbridge"], ["crates", "xcoleman"], ["abigail", "xheat"], ["abigail", "xepilogue"], ["swamp", "bank"],
      ["bank", "path"], ["path", "xarmor"], ["path", "xepilogue"], ["alvin", "xepilogue"], ["vincent", "xepilogue"],
      ["berengar", "xazar"], ["adda", "xepilogue"], ["adda", "xw2"], ["thaler", "xw2"], ["path", "xw2"],
      ["lake", "xw2"], ["xarmor", "xw2"]
    ],
    saveThread: { from: "xw2", to: "w2.imp1" },
    outcomes: [
      { label: "Enemies in chapter V", key: "w1.path", text: { order: "the Scoia'tael", elves: "the Order", neutral: "both the Order and the Scoia'tael" } },
      { label: "Armor", key: "w1.path", text: { order: "the Order's Raven's armor", elves: "the elven Raven's armor", neutral: "the neutral Raven's armor" } },
      { label: "Sword at the lake", key: "w1.lake", text: { village: "no sword, but a large diamond", vodyanoi: "the ceremonial sword of Deithwen", compromise: "Aerondight" } },
      { label: "Final fight with Azar", key: "w1.berengar", text: { kill: "Azar is weakened by Berengar's medallion", spare: "Berengar fights alongside you" } },
      { label: "Through Vizima in the epilogue", key: "w1.path", text: { order: "Siegfried fights alongside you", elves: "Yaevinn fights alongside you", neutral: "Triss fights alongside you" } },
      {
        label: "Helpers in the epilogue", join: ", ",
        cases: [
          { when: { "w1.alvin": "triss" }, text: "Triss" },
          { when: { "w1.alvin": "shani" }, text: "Shani" },
          { when: { "w1.adda": "save" }, text: "Adda as a striga" },
          { when: { "w1.adda": "kill", "w1.vincent": ["cure", "spare"] }, text: "Vincent as a werewolf" },
          { when: { "w1.adda": "kill", "w1.vincent": "kill" }, text: "Count de Wett" },
          { when: { "w1.adda": "kill", "w1.vincent": null }, text: "Vincent as a werewolf or Count de Wett" },
          { when: { "w1.abigail": "protect" }, text: "Abigail (if she survived the Beast)" }
        ]
      },
      {
        label: "Opponents in the epilogue", join: ", ",
        cases: [
          { when: { "w1.abigail": "surrender" }, text: "Abigail" },
          { when: { "w1.path": "order" }, text: "Yaevinn's ghost" },
          { when: { "w1.path": "elves" }, text: "Siegfried's ghost" },
          { when: { "w1.path": "neutral" }, text: "the ghosts of Siegfried and Yaevinn (earlier: a fight or a peaceful parting)" }
        ]
      },
      { label: "King of the Wild Hunt", key: "w1.hunt", text: { refuse: "a fight with ghosts", accept: "no fight, less XP" } }
    ]
  };

  const w2 = {
    id: "w2",
    title: "The Witcher 2",
    subtitle: "Game 2 · 2011 · Assassins of Kings",
    tab: "Game 2",
    layout: { x0: 50, step: 205, nodeWidth: 160, nodeHeight: 38, height: 405 },
    columns: ["Prologue", "Chapter 1", "Chapter 2", "Chapter 3", "Epilogue", "To game 3"],
    pathChoice: "cross",
    paths: { i: "Iorveth's path", r: "Roche's path" },
    choices: [
      {
        id: "aryan", chapter: "Prologue: La Valette Castle", at: [0, 205],
        title: "Aryan La Valette",
        when: "During the storming of the castle, when you come face to face with the commander of the defence.",
        question: "Do you fight Aryan, or talk him round?",
        options: [
          { id: "spare", label: "Talk him round", effects: ["Aryan stays alive; according to SegmentNext you get the Strong Back skill, but escaping the dungeon becomes harder.", "In The Witcher 3 a few lines of dialogue at most."] },
          { id: "kill", label: "Fight him", effects: ["Aryan dies and you then help his mother, Mary Louisa La Valette.", "In The Witcher 3 a few lines of dialogue at most."] }
        ]
      },
      {
        id: "sword", chapter: "Chapter 1: Flotsam", at: [1, 175],
        title: "Iorveth's sword",
        when: "At the end of the quest The Assassins of Kings, after the confrontation with the kingslayer, when Roche and Iorveth face each other.",
        question: "Do you give Iorveth his sword, or help Roche?",
        options: [
          { id: "iorveth", label: "Give Iorveth his sword", effects: ["Violence breaks out among the nonhumans in Flotsam; later you find Margot alive and Derae dead."] },
          { id: "roche", label: "Help Roche", effects: ["Iorveth is taken prisoner; later you find Derae alive."] }
        ],
        note: "The outcome shapes the next quest, Where Is Triss Merigold?, but does not lock in your path yet: at the end of the chapter you can still go either way."
      },
      {
        id: "cross", chapter: "Chapter 1: Flotsam", at: [1, 235], major: true,
        title: "At a Crossroads",
        when: "At the end of chapter 1.",
        question: "The most important choice in the game: do you leave with Iorveth or with Roche?",
        options: [
          { id: "i", label: "With Iorveth", effects: ["Chapter 2 takes place in the dwarven city of Vergen.", "According to players this is the more popular half, thanks to Vergen and its quests.", "In The Witcher 3, only some dialogue."] },
          { id: "r", label: "With Roche", effects: ["Chapter 2 takes place in King Henselt's army camp; Loredo is killed.", "In chapter 3 you get a quest of your own with extra background.", "In The Witcher 3, only some dialogue."] }
        ]
      },
      {
        id: "prison", chapter: "End of chapter 1 and chapter 2: Iorveth's path", at: [2, 60], major: true, path: "i",
        title: "The Floating Prison",
        when: "On Iorveth's path, at the end of chapter 1.",
        question: "Do you go after Loredo, or rescue the elven women?",
        options: [
          { id: "loredo", label: "Kill Loredo", effects: ["Loredo is taken out and Flotsam stays Temerian (according to SegmentNext)."] },
          { id: "women", label: "Rescue the women", effects: ["Loredo keeps Flotsam in his grip, but Iorveth is pleased; that leads to an intimate scene in chapter 2."] }
        ],
        note: "According to the official guide, the story on this path branches right here, and this choice, together with the one in chapter 3, forms the four endings of Iorveth's path."
      },
      {
        id: "stennis", chapter: "End of chapter 1 and chapter 2: Iorveth's path", at: [2, 110], path: "i",
        title: "The fate of Stennis",
        when: "In Vergen, when the crowd turns against the prince.",
        question: "Do you let the crowd have its way, or protect the prince?",
        options: [
          { id: "dies", label: "Let the crowd have its way", effects: ["Stennis dies; the royal blood you need can be found on the spot.", "According to SegmentNext, Aedirn descends into chaos."] },
          { id: "lives", label: "Protect Stennis", effects: ["He stays alive; for the royal blood you have to go to Henselt.", "According to SegmentNext he becomes king of Aedirn and Saskia's opponent."] }
        ]
      },
      {
        id: "henselt", chapter: "Chapter 2: Roche's path", at: [2, 300], major: true, path: "r",
        title: "The Siege of Vergen",
        when: "On Roche's path, at the end of chapter 2, when Roche and Henselt face each other.",
        question: "Do you let Roche kill King Henselt, or stop him?",
        options: [
          { id: "kill", label: "Let Roche do it", effects: ["Henselt dies and the Blue Stripes get their revenge; Kaedwen descends into chaos.", "Vergen falls either way."] },
          { id: "stop", label: "Stop Roche", effects: ["Henselt stays in power and Roche is not happy about it.", "Vergen falls either way."] }
        ],
        note: "According to the official guide, this choice, together with the one in chapter 3, forms the four endings of Roche's path."
      },
      {
        id: "greater", chapter: "Chapter 3: Loc Muinne", at: [3, 60], major: true, path: "i",
        title: "For the Greater Good",
        when: "On Iorveth's path, in the Redanian dungeon.",
        question: "Do you help the prisoner you find there (Philippa Eilhart), or go after Triss?",
        options: [
          { id: "philippa", label: "Help Philippa", effects: ["You get the dagger that later lets you break a spell.", "You don't free Triss; Letho rescues her.", "The summit ends badly: bloodshed in Loc Muinne and a witch hunt against mages."] },
          { id: "triss", label: "Rescue Triss", effects: ["The plot at the summit is foiled and the council of mages is restored.", "Without the dagger you can't break the spell later."] }
        ]
      },
      {
        id: "temeria", chapter: "Chapter 3: Loc Muinne", at: [3, 300], major: true, path: "r",
        title: "For Temeria!",
        when: "On Roche's path.",
        question: "Do you help Roche rescue Anaïs La Valette, Foltest's daughter, or go after Triss?",
        options: [
          { id: "anais", label: "Rescue Anaïs", effects: ["Roche becomes a close ally; you then decide who Anaïs is entrusted to.", "The summit ends badly for the mages."] },
          { id: "triss", label: "Rescue Triss", effects: ["The plot at the summit is foiled and the council of mages is restored.", "Anaïs loses her claim to Temeria."] }
        ]
      },
      {
        id: "anais", chapter: "Chapter 3: Loc Muinne", at: [3, 350], path: "r",
        title: "Of His Blood and Bone",
        when: "Only if you rescued Anaïs.",
        question: "Do you entrust Anaïs to King Radovid of Redania, or to John Natalis?",
        options: [
          { id: "radovid", label: "Radovid", effects: ["Redania takes over Temeria and Anaïs does not become queen.", "According to players, an import into game 3 reads this."] },
          { id: "natalis", label: "Natalis", effects: ["Temeria survives and Anaïs becomes queen."] }
        ]
      },
      {
        id: "sile", chapter: "Chapter 3: Loc Muinne", at: [3, 175],
        title: "Síle's fate",
        when: "On both paths, during or after A Summit of Mages.",
        question: "Do you save the sorceress Síle de Tansarville, or leave her to her fate?",
        options: [
          { id: "save", label: "Save Síle", effects: ["She tells you something about Yennefer and leaves.", "In The Witcher 3, a small role in one quest."] },
          { id: "leave", label: "Let her die", effects: ["She is killed."] }
        ]
      },
      {
        id: "dragon", chapter: "Chapter 3: Loc Muinne", at: [3, 235],
        title: "Enter the Dragon",
        when: "On both paths, after the summit, in the quest Enter the Dragon.",
        question: "What do you do with the dragon attacking Loc Muinne?",
        options: [
          { id: "kill", label: "Kill it", effects: ["The dragon dies."] },
          { id: "release", label: "Let it go", effects: ["The dragon survives."] },
          { id: "dagger", label: "Break the spell", effects: ["Only possible if you helped Philippa on Iorveth's path and have the dagger. The dragon turns out to be Saskia and is set free."] }
        ],
        note: "On Roche's path you never find out who the dragon really is."
      },
      {
        id: "letho", chapter: "Epilogue", at: [4, 205], major: true,
        title: "Final conversation",
        when: "At the very end, with the man behind the royal assassinations.",
        question: "Do you fight Letho, or let him go?",
        options: [
          { id: "fight", label: "Fight him", effects: ["You keep your promise to Roche; the School of the Viper is broken.", "In The Witcher 3 Letho is dead (which is also the default)."] },
          { id: "free", label: "Let him go", effects: ["You lose Roche's trust.", "In The Witcher 3 you get an extra quest and Letho plays a part in later main quests."] }
        ]
      }
    ],
    markers: [
      { id: "imp1", at: [0, 60], label: "Save from game 1", jump: "el:carry-w2" },
      { id: "w3", at: [5, 205], label: "Import into game 3", jump: "el:bridge-w2" }
    ],
    edges: [
      ["aryan", "sword"], ["sword", "cross"], ["cross", "prison"], ["cross", "henselt"], ["prison", "stennis"],
      ["stennis", "greater"], ["henselt", "temeria"], ["temeria", "anais"], ["greater", "sile"], ["anais", "sile"],
      ["sile", "dragon"], ["dragon", "letho"],
      ["aryan", "w3", "next"], ["cross", "w3", "next"], ["greater", "w3", "next"], ["temeria", "w3", "next"],
      ["sile", "w3", "next"], ["letho", "w3", "next"]
    ],
    areas: [
      { path: "i", columns: [2, 3], y: 48, height: 120, label: "Iorveth's path" },
      { path: "r", columns: [2, 3], y: 288, height: 112, label: "Roche's path" }
    ],
    labels: [
      { path: "i", column: 1, dx: 117, y: 150, text: "Iorveth" },
      { path: "r", column: 1, dx: 117, y: 290, text: "Roche" }
    ],
    saveThread: { from: "w3", to: "w3.imp" },
    carry: {
      from: "w1",
      empty: "No choices from game 1 recorded yet. Without an import, game 2 starts with the default: Adda is dead and Thaler sends nothing.",
      footnote: "This does not change the story of game 2; it is about references and gear.",
      lines: [
        { when: { "w1.adda": "save" }, text: "Foltest mentions Adda: she is alive and married to Radovid" },
        { when: { "w1.adda": "kill" }, text: "Adda is dead, just as without an import" },
        { when: { "w1.thaler": "lives" }, text: "a messenger from Thaler with a package" },
        { when: { "w1.thaler": "dies" }, text: "no messenger from Thaler" },
        { when: { "w1.path": "*" }, text: "your bond with Siegfried and Yaevinn is mentioned" },
        { when: { "w1.path": "order" }, text: "as an Order player, a few extra effects in chapter 3" },
        { when: [{ "w1.path": "*" }, { "w1.lake": "*" }], text: "equipped swords and your Raven's armor carry over, but weaker" },
        { when: { "w1.lake": "compromise" }, text: "Aerondight is among the swords that carry over" },
        { when: { "w1.alvin": "triss" }, text: "game 2 continues your choice of Triss" },
        { when: { "w1.alvin": "shani" }, text: "game 2 follows the Triss storyline anyway" }
      ]
    },
    outcomes: [
      {
        label: "Your ending",
        cases: [
          { when: { "w2.cross": "i", "w2.prison": "*", "w2.greater": "*" }, text: "one of the four endings of Iorveth's path ({w2.prison}; {w2.greater})" },
          { when: { "w2.cross": "r", "w2.henselt": "*", "w2.temeria": "*" }, text: "one of the four endings of Roche's path ({w2.henselt}; {w2.temeria})" }
        ]
      }
    ]
  };

  const w3 = {
    id: "w3",
    title: "The Witcher 3",
    subtitle: "Game 3 · 2015 · Wild Hunt, Complete Edition",
    tab: "Game 3",
    layout: { x0: 50, step: 205, nodeWidth: 160, nodeHeight: 38, height: 335 },
    columns: ["Act I", "Act II", "Act III", "Endings", "Hearts of Stone", "Blood and Wine"],
    choices: [
      {
        id: "imp", chapter: "Act I: Velen, Novigrad and Skellige", at: [0, 50],
        title: "Imperial Audience",
        when: "In Vizima, right after the prologue in White Orchard.",
        question: "If you didn't import a save from game 2 but chose to simulate one, Morvran Voorhis asks you questions about game 2 here. This card sums up the most important answer: is Letho alive?",
        importFrom: { key: "w2.letho", map: { free: "alive", fight: "dead" } },
        options: [
          { id: "alive", label: "Letho is alive", effects: ["Later you get an extra quest with him and he can fight alongside you at Kaer Morhen."] },
          { id: "dead", label: "Letho is dead", effects: ["That quest and that help are gone; this is also the default without an import or simulation."] }
        ],
        note: "The other questions (Aryan, Roche or Iorveth, Triss, Síle) have few consequences in this game; see the game 2 tab."
      },
      {
        id: "hillock", chapter: "Act I: Velen, Novigrad and Skellige", at: [0, 102], major: true,
        title: "The Whispering Hillock",
        when: "In Velen, at the old oak south of Downwarren, during the Bloody Baron's story.",
        question: "Do you free the spirit in the tree, or destroy it?",
        options: [
          { id: "free", label: "Free it", effects: ["The orphans are saved, but the spirit ravages Downwarren.", "Anna dies and the Baron hangs himself in grief."] },
          { id: "destroy", label: "Destroy it", effects: ["The orphans fall prey to the Ladies of the Wood.", "Anna loses her mind; the Baron takes her south to seek a cure."] }
        ],
        note: "According to players, order matters: if you free the spirit before speaking with the Ladies of the Wood, Anna and the Baron get a kinder outcome. Otherwise the Baron's story is separate from the endings."
      },
      {
        id: "keira", chapter: "Act I: Velen, Novigrad and Skellige", at: [0, 154],
        title: "Keira Metz",
        when: "At the end of her side story in Velen (For the Advancement of Learning).",
        question: "Keira has found dangerous notes. What happens to her? Note: this depends on your tone in the conversation, not on a single button.",
        options: [
          { id: "kaer", label: "She goes to Kaer Morhen", effects: ["You get the notes without a fight; Keira later helps defend Kaer Morhen and saves a friend of yours there.", "A romance with her is then no longer possible."] },
          { id: "radovid", label: "She goes to Radovid", effects: ["Later you hear she met a gruesome end."] },
          { id: "fight", label: "It comes to a fight", effects: ["Hostile or insulting answers lead to a fight in which Keira dies."] }
        ]
      },
      {
        id: "triss", chapter: "Act I: Velen, Novigrad and Skellige", at: [0, 206],
        title: "Now or Never",
        when: "In Novigrad, at the end of Triss's side story.",
        question: "Do you ask Triss to stay and tell her you love her, or let her go?",
        options: [
          { id: "stay", label: "Ask her to stay", effects: ["The romance with Triss has begun; it helps decide how things end for Geralt.", "You can only continue with one of the two, Triss or Yennefer."] },
          { id: "leave", label: "Let her go", effects: ["Triss is no longer a romantic partner, but she doesn't disappear from the story."] }
        ]
      },
      {
        id: "gambit", chapter: "Act I: Velen, Novigrad and Skellige", at: [0, 258], major: true,
        title: "King's Gambit",
        when: "On Skellige, after you have helped Hjalmar and Cerys with their own quests.",
        question: "Do you help Cerys, help Hjalmar, or let the clans sort it out themselves?",
        options: [
          { id: "cerys", label: "Help Cerys", effects: ["You unmask who was behind the massacre; Cerys becomes queen of Skellige."] },
          { id: "hjalmar", label: "Help Hjalmar", effects: ["More fighting, and you never learn who was behind the massacre; Hjalmar becomes king."] },
          { id: "none", label: "Help no one", effects: ["Svanrige becomes king; Cerys and Hjalmar sail out against the Nilfgaardian fleet and never return."] }
        ]
      },
      {
        id: "yen", chapter: "Act II: Kaer Morhen", at: [1, 50],
        title: "The Last Wish",
        when: "A side quest with Yennefer on Skellige.",
        question: "At the end, do you say you love Yennefer?",
        options: [
          { id: "yes", label: "Yes", effects: ["The romance with Yennefer is sealed; it helps decide how things end for Geralt.", "You can only continue with one of the two, Triss or Yennefer."] },
          { id: "no", label: "No", effects: ["No romance with Yennefer."] }
        ]
      },
      {
        id: "brothers", chapter: "Act II: Kaer Morhen", at: [1, 115],
        title: "Brothers in Arms",
        when: "Before the defence of Kaer Morhen, when you look for allies in Velen, Novigrad and Skellige.",
        question: "How much help do you bring? This follows from earlier side quests (including Keira, Roche and Ves, Zoltan, Letho, Hjalmar and Ermion).",
        options: [
          { id: "many", label: "Many allies", effects: ["The defence is stronger and more familiar faces stand at your side. The rest of the story barely changes because of it."] },
          { id: "few", label: "Few allies", effects: ["You fight with a smaller group; the story then continues the same way."] }
        ],
        context: [
          { when: { "w3.imp": "alive" }, text: "Letho is alive in your playthrough and can fight alongside you." },
          { when: { "w3.keira": "kaer" }, text: "Keira Metz stands at your side." }
        ]
      },
      {
        id: "snow", chapter: "Act II: Kaer Morhen", at: [1, 180], major: true, ciri: true,
        title: "After the battle",
        when: "Right after the battle of Kaer Morhen (Blood on the Battlefield), when Ciri is struggling.",
        question: "How do you cheer Ciri up: with a snowball fight or with a drink?",
        options: [
          { id: "snowballs", label: "Snowball fight", points: 1, effects: ["Counts positively towards Ciri's fate. Whether you win the fight doesn't matter."] },
          { id: "drinks", label: "A drink", points: 0, effects: ["Counts negatively towards Ciri's fate."] }
        ]
      },
      {
        id: "emhyr", chapter: "Act II: Kaer Morhen", at: [1, 245], major: true, ciri: true,
        title: "Visiting the Emperor",
        when: "Also in Blood on the Battlefield: do you take Ciri to see her father, Emperor Emhyr?",
        question: "Do you go to Emhyr with Ciri, and if so, do you accept his reward?",
        options: [
          { id: "refuse", label: "Go and refuse the reward", points: 1, effects: ["Counts positively towards Ciri's fate.", "Opens the way to the ending in which Ciri becomes empress, if the political condition is also met."] },
          { id: "accept", label: "Go and accept the reward", points: 0, effects: ["Counts negatively towards Ciri's fate."] },
          { id: "skip", label: "Don't go", points: 1, effects: ["According to most guides this counts as positive, but Ciri can then not become empress."] }
        ]
      },
      {
        id: "lab", chapter: "Act III: hunting the Wild Hunt", at: [2, 50], major: true, ciri: true,
        title: "The laboratory",
        when: "On Skellige, in Avallac'h's laboratory (Child of the Elder Blood).",
        question: "Ciri wants to vent her anger on the laboratory. Do you encourage her, or tell her to calm down?",
        options: [
          { id: "vent", label: "Let her go ahead", points: 1, effects: ["Counts positively towards Ciri's fate."] },
          { id: "calm", label: "Calm her down", points: 0, effects: ["Counts negatively towards Ciri's fate."] }
        ]
      },
      {
        id: "grave", chapter: "Act III: hunting the Wild Hunt", at: [2, 110], major: true, ciri: true,
        title: "Skjall's grave",
        when: "Shortly afterwards, when Ciri wants to visit a grave on Skellige.",
        question: "Do you go with her, or say there's no time?",
        options: [
          { id: "go", label: "Go with her", points: 1, effects: ["Counts positively towards Ciri's fate."] },
          { id: "notime", label: "No time", points: 0, effects: ["Counts negatively towards Ciri's fate."] }
        ]
      },
      {
        id: "lodge", chapter: "Act III: hunting the Wild Hunt", at: [2, 170], major: true, ciri: true,
        title: "Final Preparations",
        when: "When the Lodge of Sorceresses wants to speak with Ciri.",
        question: "Do you let Ciri go alone, or go with her?",
        options: [
          { id: "alone", label: "Let her go alone", points: 1, effects: ["Counts positively towards Ciri's fate."] },
          { id: "along", label: "Go with her", points: 0, effects: ["Counts negatively towards Ciri's fate."] }
        ]
      },
      {
        id: "reason", chapter: "Act III: hunting the Wild Hunt", at: [2, 245], major: true,
        title: "Reason of State",
        when: "Only if you previously did the quests around Roche, Dijkstra and the plot against King Radovid (A Deadly Plot, Blindingly Obvious, An Eye for an Eye and Redania's Most Wanted) and gave Dijkstra information.",
        question: "Do you take part in the assassination of Radovid, and then side with Roche or with Dijkstra?",
        options: [
          { id: "none", label: "Don't take part", effects: ["Radovid wins the war and drives Nilfgaard back."] },
          { id: "roche", label: "Take part and protect Roche", effects: ["You fight Dijkstra. Nilfgaard wins the war, but Emhyr lets Temeria survive as a vassal state.", "Required for the ending in which Ciri becomes empress."] },
          { id: "dijkstra", label: "Take part and let Dijkstra have his way", effects: ["Roche, Ves and Thaler die; Dijkstra takes power in Redania and continues the war."] }
        ]
      },
      {
        id: "hos", chapter: "Hearts of Stone", at: [4, 150], major: true,
        title: "Whatsoever a Man Soweth",
        when: "In the final quest, when Gaunter O'Dimm comes to collect what he is owed.",
        question: "Do you step in, or let it happen?",
        options: [
          { id: "help", label: "Help Olgierd", effects: ["You have to solve a riddle within the time limit. If you do, Olgierd is free and you get his sword; if you fail, you both lose your souls."] },
          { id: "stay", label: "Stay out of it", effects: ["O'Dimm takes Olgierd; you get to choose a powerful reward."] }
        ]
      },
      {
        id: "baw", chapter: "Blood and Wine", at: [5, 150], major: true,
        title: "Night of Long Fangs",
        when: "Halfway through the expansion, when you have to track down a vampire.",
        question: "Do you find the vampire through Syanna, or through the Unseen Elder?",
        options: [
          { id: "syanna", label: "Through Syanna", effects: ["Opens the way to the best ending, but that takes more: bringing a ribbon from the Land of a Thousand Fables and later convincing Syanna with the right words.", "Without the ribbon Syanna dies; if you fail to convince her, both sisters die."] },
          { id: "elder", label: "Through the Unseen Elder", effects: ["According to the guides this leads to the worst ending: both sisters die."] }
        ]
      }
    ],
    markers: [
      { id: "eciri", at: [3, 80], label: "Ciri's fate", kind: "end", jump: "summary" },
      { id: "eworld", at: [3, 170], label: "Fate of the world", kind: "end", jump: "summary" },
      { id: "egeralt", at: [3, 260], label: "Geralt's fate", kind: "end", jump: "summary" }
    ],
    edges: [
      ["imp", "brothers"], ["keira", "brothers"], ["triss", "brothers"], ["gambit", "brothers"], ["triss", "egeralt"],
      ["yen", "egeralt"], ["snow", "eciri", "ciri"], ["emhyr", "eciri", "ciri"], ["lab", "eciri", "ciri"],
      ["grave", "eciri", "ciri"], ["lodge", "eciri", "ciri"], ["reason", "eciri", "ciri"], ["reason", "eworld"],
      ["gambit", "eworld"], ["emhyr", "eworld"]
    ],
    divider: { column: 4, label: "expansions" },
    carry: {
      from: "w2",
      empty: "No choices from game 2 recorded yet. Without an import, Letho is dead and Triss has no special feelings for Geralt.",
      footnote: "Nothing from game 1 carries over to game 3.",
      lines: [
        { when: { "w2.letho": "free" }, text: "Letho is alive: an extra quest and a part in later main quests" },
        { when: { "w2.letho": "fight" }, text: "Letho is dead, as by default" },
        { when: { "w2.sile": "save" }, text: "Síle has a small role" },
        { when: { "w2.sile": "leave" }, text: "Síle does not appear" },
        { when: { "w2.cross": "r", "w2.anais": "radovid" }, text: "an import reads that Radovid has Anaïs" },
        { when: { "w2.cross": "r", "w2.anais": "natalis" }, text: "Anaïs is with Natalis" },
        { when: [{ "w2.greater": "*" }, { "w2.temeria": "*" }], text: "Triss is alive either way" },
        { when: { "w2.cross": "i" }, text: "you went with Iorveth: only some dialogue" },
        { when: { "w2.cross": "r" }, text: "you went with Roche: only some dialogue" },
        { when: { "w2.aryan": "*" }, text: "Aryan: only some dialogue" }
      ]
    },
    outcomes: [
      {
        label: "Ciri's fate",
        ciri: {
          moments: ["w3.snow", "w3.emhyr", "w3.lab", "w3.grave", "w3.lodge"],
          threshold: 3,
          incomplete: "First reveal all five moments that count.",
          score: "{points} of the 5 moments positive.",
          cases: [
            { below: true, text: "Ciri does not survive." },
            { when: { "w3.emhyr": ["refuse", "accept"], "w3.reason": "roche" }, text: "Ciri survives and becomes Empress of Nilfgaard." },
            { when: { "w3.emhyr": ["refuse", "accept"], "w3.reason": null }, text: "Ciri survives; whether she becomes empress or a witcher still depends on Reason of State." },
            { text: "Ciri survives and takes the witcher's path." }
          ]
        }
      },
      { label: "The North", key: "w3.reason", text: { none: "Radovid wins the war.", roche: "Nilfgaard wins; Temeria survives as a vassal state.", dijkstra: "Dijkstra takes power in Redania." } },
      { label: "Skellige", key: "w3.gambit", text: { cerys: "Cerys rules.", hjalmar: "Hjalmar rules.", none: "Svanrige rules." } },
      {
        label: "Geralt",
        cases: [
          { when: { "w3.triss": "stay", "w3.yen": "yes" }, text: "You chose both, but you can't keep them both." },
          { when: { "w3.triss": "stay" }, text: "Geralt chooses a life with Triss." },
          { when: { "w3.yen": "yes" }, text: "Geralt chooses a life with Yennefer." },
          { when: [{ "w3.triss": "leave" }, { "w3.yen": "no" }], text: "Geralt stays alone, unless you still pick a romance." }
        ]
      },
      { label: "Hearts of Stone", key: "w3.hos", text: { help: "Olgierd is free, if you solve the riddle.", stay: "O'Dimm gets his soul; you get a reward." } },
      { label: "Blood and Wine", key: "w3.baw", text: { syanna: "The best ending is still possible.", elder: "Both sisters die." } }
    ]
  };

  root.WITCHER_DATA = Object.freeze({ games: [w1, w2, w3] });
})(globalThis);
