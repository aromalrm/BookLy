import { MORE_BOOKS, sectionFor } from "./section-catalog";
import { shortAuthor, spineText } from "./labels";
import { paletteFor } from "./palette";
import type { Book, ShelfSection } from "./types";

/** Bump this when the installed shelf itself should be replaced. */
export const SHELF_SEED_ID = "shelf-sections-v1";

type Seed = {
  id: string;
  title: string;
  authors: string;
  isbn: string | null;
  year: number | null;
  coverId: number;
  summary: string;
};

const SHELF: Seed[] = [
  {
    id: "seed-psycho-cybernetics",
    title: "Psycho-Cybernetics",
    authors: "Maxwell Maltz",
    isbn: "9780399176135",
    year: 1960,
    coverId: 14428293,
    summary: `Maltz came to this subject as a plastic surgeon who noticed that a new face did not always give a person a new life. He started treating the mind as a kind of servo: it steers toward the picture of yourself you keep handing it. In his account a poor self-image is not just a mood. It is a target the nervous system has practiced hitting.

The chapters that follow are about changing that target. He asks you to rehearse the person you mean to be until the picture feels ordinary, and to stop reviewing old failures as if they were instructions. The language is of its decade, and he is more certain than the evidence, but the claim is still worth keeping on a shelf. You tend to move toward the self you practice seeing.`,
  },
  {
    id: "seed-psychology-of-money",
    title: "The Psychology of Money",
    authors: "Morgan Housel",
    isbn: "9780857197689",
    year: 2020,
    coverId: 10389354,
    summary: `Housel is not interested in a better spreadsheet. He is interested in the stories people tell themselves about risk, status, and what counts as enough. Money decisions, in this telling, are rarely pure calculations. They are shaped by the decade you grew up in, by luck you would rather not name, and by the wish to look reasonable to other people.

What I keep from it is the patience. Compounding shows up less as a trick than as a temperament: staying in the game long enough for ordinary results to become large. He keeps separating being rich from looking rich, and he treats freedom as the ability to want a smaller life than your income could buy. The chapters are short on purpose. Each one is a reminder you can carry without a formula.`,
  },
  {
    id: "seed-rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    authors: "Robert T. Kiyosaki",
    isbn: "9781612680194",
    year: 1997,
    coverId: 8315603,
    summary: `Kiyosaki tells the book as a long argument between two fathers. One teaches that a steady job and a house are the safe path. The other teaches that assets, not paychecks, are what keep a household standing. The contrast is staged, and the author is selling a worldview along with the lesson. The distinction he repeats is still easy to use. An asset puts money in your pocket. A liability takes it out, whatever the brochure calls it.

The rest is a push to study money the way you once studied for exams, and to distrust advice that confuses income with wealth. It is motivational more than technical. I read it as a shove away from spending that only looks like progress, not as a complete map of how to invest.`,
  },
  {
    id: "seed-sapiens",
    title: "Sapiens",
    authors: "Yuval Noah Harari",
    isbn: "9780099590088",
    year: 2011,
    coverId: 8634250,
    summary: `Harari tells human history as a series of accidents that stuck. We were one animal among others, then a storytelling animal, then an agricultural one, then a scientific one. The thread he pulls is that large groups of strangers can cooperate when they share a fiction: money, nations, laws, companies. Those fictions are not fake in their effects. They are how a species of small bands ended up running a planet.

The pleasure is the zoom. A chapter will drop from the first wheat fields to a modern office and ask what was traded for the surplus. He likes a clean thesis, and specialists argue with pieces of it. As a shelf book it earns its place by giving you a plot for our species, and a reason to look twice at the stories we are still agreeing to live inside.`,
  },
  {
    id: "seed-the-alchemist",
    title: "The Alchemist",
    authors: "Paulo Coelho",
    isbn: "9780062315007",
    year: 1988,
    coverId: 7414780,
    summary: `A shepherd boy in Andalusia dreams of treasure near the pyramids and leaves his flock to find it. Coelho keeps the journey deliberately simple. Santiago meets a king, a crystal merchant, an Englishman, and an alchemist, and each of them tells him some version of the same thing: the world will help a person who is actually walking toward what they want.

I read it as a story about attention more than destiny. He learns to notice the desert, the work in front of him, and the fear of leaving a life that is already good enough. The treasure, when it arrives, is almost a joke about how far we travel to find what was close. The prose is plain, and the moral has been worn smooth by popularity. It still has the warmth of a tale you could tell out loud.`,
  },
  {
    id: "seed-mans-search-for-meaning",
    title: "Man's Search for Meaning",
    authors: "Viktor E. Frankl",
    isbn: "9781844132393",
    year: 1946,
    coverId: 11439091,
    summary: `Frankl wrote out of the camps, and he does not soften them. The first half is a record of hunger, cold, and the few choices that remained when almost every choice had been taken. He wants to know who collapsed and who, somehow, stayed a person. His answer is not comfort. People can bear a great deal, he says, if they can see a reason to bear it: someone they love, work left unfinished, or a suffering they refuse to let be meaningless.

The second half turns that observation into his clinical idea, logotherapy. The will to meaning sits deeper, for him, than the will to pleasure or power. You do not invent a meaning as a slogan. You look for what the situation is asking of you. The book is short, severe, and strangely steady. It refuses both despair and easy hope.`,
  },
  {
    id: "seed-deep-work",
    title: "Deep Work",
    authors: "Cal Newport",
    isbn: "9781455586691",
    year: 2016,
    coverId: 7988607,
    summary: `Newport's claim is that uninterrupted concentration is becoming rare, and that rare abilities are valuable. Deep work, as he defines it, is a stretch of real effort on something that is hard for you. Shallow work is the mail, the meetings, and the motion that can fill a day without leaving anything built.

He is prescriptive in a way that will grate on anyone whose job is made of other people. He wants longer blocks, fewer tools, and a craft-like respect for what attention can finish. The useful part is the distinction. Once you can see a day as a mix of deep hours and shallow hours, it is harder to pretend that a full inbox was the work. The book is a defense of doing one difficult thing at a stretch.`,
  },
  {
    id: "seed-never-split-the-difference",
    title: "Never Split the Difference",
    authors: "Chris Voss",
    isbn: "9780062407801",
    year: 2016,
    coverId: 8365942,
    summary: `Voss comes from hostage negotiation, and he carries that pressure into ordinary talks: a raise, a deal, an argument at the kitchen table. His case against splitting the difference is that the midpoint of two positions is often a bad bargain for both. It is a number nobody wanted and nobody trusts.

What he offers instead is a way of listening that sounds almost too plain. Repeat the last few words. Name the feeling you think you heard. Ask questions that start with how, so the other person has to solve the problem with you. The moves can feel like tricks if you use them as tricks. Used straight, they remind you that people rarely move because you produced a better argument. They move when they feel understood and still in charge. The stories do as much teaching as the lists.`,
  },
  {
    id: "seed-the-daily-stoic",
    title: "The Daily Stoic",
    authors: "Ryan Holiday and Stephen Hanselman",
    isbn: "9780735211735",
    year: 2016,
    coverId: 13098570,
    summary: `Holiday and Hanselman cut Stoicism into a page a day. A line from Marcus, Seneca, or Epictetus, then a short note on how a person might use it before breakfast. The bet is that this philosophy works better as a practice you return to than as a system you master once.

The themes repeat, which is the method. You do not control other people, the weather, or yesterday. You do control whether you meet the day with honesty, restraint, and a little courage. Some pages are sharper than others, and the commentary is modern on purpose, aimed at work and worry rather than at the ancient classroom. Kept nearby, it is less a book you finish than a book that finishes a little of your reactivity.`,
  },
  {
    id: "seed-meditations",
    title: "Meditations",
    authors: "Marcus Aurelius",
    isbn: "9780812968255",
    year: null,
    coverId: 211529,
    summary: `Marcus wrote these notes to himself while he was emperor, and he did not write them for us. That privacy is why they still feel close. He is talking himself down from anger. He reminds himself that he will die, that fame is a rumor that dies too, and that the task in front of him is the only task he can actually do.

There is no plot and no effort to charm. One paragraph tells him to get out of bed. Another tells him to treat an irritating person as a fellow human rather than an obstacle. Another tells him to stop wanting the world to be other than it is. The repetition is the practice. He did not believe a true thing stayed true just because he had written it yesterday. He had to meet it again. Reading him is like borrowing someone else's private exercises and finding that they fit.`,
  },
  {
    id: "seed-subtle-art",
    title: "The Subtle Art of Not Giving a F*ck",
    authors: "Mark Manson",
    isbn: "9780062457714",
    year: 2016,
    coverId: 8231990,
    summary: `Manson opens with a loud refusal. You do not have to care about every demand the culture hands you. The useful turn comes after the joke. Not caring is not emptiness. It is a budget. You have a limited amount of concern, and a decent life is mostly a matter of spending it on a few hard, chosen problems instead of on status, outrage, and the fear of being ordinary.

He writes in a bar-room voice about values, responsibility, and the relief of being average at things that were never yours to master. The swearing is the shop front. Behind it the book is arguing for commitment: pick the struggle you are willing to keep, and let the rest go. It is blunt, sometimes repetitive, and clearer than the title wants you to think.`,
  },
];

export function seededShelf(): Book[] {
  const stamped = Date.parse("2026-01-01T00:00:00.000Z");
  const shelf: Array<Seed & { section?: ShelfSection }> = [...SHELF, ...MORE_BOOKS];
  return shelf.map((seed, index) => {
    const authors = seed.authors;
    return {
      id: seed.id,
      title: seed.title,
      authors,
      isbn: seed.isbn,
      year: seed.year,
      coverUrl: `https://covers.openlibrary.org/b/id/${seed.coverId}-L.jpg`,
      spine: spineText(seed.title),
      authorShort: shortAuthor(authors),
      color: paletteFor(`${seed.title}:${authors}`),
      aspect: 0.67,
      status: "unread",
      progress: 0,
      notes: "",
      summary: seed.summary.trim(),
      section: seed.section ?? sectionFor(seed.id),
      createdAt: new Date(stamped + index * 1000).toISOString(),
    };
  });
}
