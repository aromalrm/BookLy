import type { ShelfSection } from "./types";

export type CatalogSeed = {
  id: string;
  title: string;
  authors: string;
  isbn: string | null;
  year: number | null;
  coverId: number;
  section: ShelfSection;
  summary: string;
};

const ORIGINAL_SECTIONS: Record<string, ShelfSection> = {
  "seed-the-alchemist": "fiction",
  "seed-psychology-of-money": "nonfiction",
  "seed-rich-dad-poor-dad": "nonfiction",
  "seed-sapiens": "nonfiction",
  "seed-deep-work": "nonfiction",
  "seed-never-split-the-difference": "nonfiction",
  "seed-psycho-cybernetics": "psychology",
  "seed-mans-search-for-meaning": "psychology",
  "seed-subtle-art": "psychology",
  "seed-the-daily-stoic": "philosophy",
  "seed-meditations": "philosophy",
};

export function sectionFor(id: string): ShelfSection {
  return ORIGINAL_SECTIONS[id] ?? "nonfiction";
}

export const MORE_BOOKS: CatalogSeed[] = [
  {
    id: "seed-mockingbird",
    title: "To Kill a Mockingbird",
    authors: "Harper Lee",
    isbn: null,
    year: 1960,
    coverId: 14351077,
    section: "fiction",
    summary: `Scout Finch tells the story of one summer in Maycomb, and of the trial that splits the town in the open. Her father, Atticus, defends a Black man accused of a crime the courtroom has already decided. The children watch from the balcony, and what they thought was a game about a shut-in neighbor turns into a lesson about fear.

Lee lets a child narrate so the cruelty stays visible. The book is gentle in its voice and unsparing about the verdict. It is a story about who gets believed, and about the quieter courage of standing next to someone the town has already refused.`,
  },
  {
    id: "seed-1984",
    title: "1984",
    authors: "George Orwell",
    isbn: null,
    year: 1949,
    coverId: 9267242,
    section: "fiction",
    summary: `Winston Smith works at the Ministry of Truth, rewriting yesterday so it matches what the Party says today. In London under Big Brother, language is shrinking, history is edited, and a telescreen watches the room. He begins a private rebellion with a diary and a love affair, both of which the state is built to find.

Orwell's novel is about how power keeps itself by owning memory. The famous lines are not decoration. They describe a place where two and two are whatever the Party needs them to be. The ending is cold on purpose. It shows what is left of a person once the last private thought has been taken.`,
  },
  {
    id: "seed-pride",
    title: "Pride and Prejudice",
    authors: "Jane Austen",
    isbn: null,
    year: 1813,
    coverId: 14348537,
    section: "fiction",
    summary: `Mrs Bennet has five daughters and a pressing need to see them married. Elizabeth, the sharpest of them, meets Mr Darcy and dislikes him at once. He is proud, she is quick to judge, and the neighborhood is happy to supply both of them with the wrong story.

Austen writes a comedy of manners that is also a serious look at money, reputation, and the narrow road open to women. The pleasure is in the sentences, which notice everything and forgive very little. Elizabeth and Darcy change only when they can stand to be wrong, which is the real romance of the book.`,
  },
  {
    id: "seed-gatsby",
    title: "The Great Gatsby",
    authors: "F. Scott Fitzgerald",
    isbn: null,
    year: 1925,
    coverId: 10590366,
    section: "fiction",
    summary: `Nick Carraway rents a small house next to a mansion where Jay Gatsby throws parties for people who do not know him. Across the bay, a green light marks the dock of Daisy Buchanan, the woman Gatsby has been arranging his whole invented life to reach.

Fitzgerald's short novel is about a fortune built so a past moment can be repeated. The parties are bright and the valley of ashes is not. Nick's telling is affectionate and uneasy at the same time. What remains is the cost of wanting a person, and a country, to be the dream you made of them.`,
  },
  {
    id: "seed-potter",
    title: "Harry Potter and the Philosopher's Stone",
    authors: "J.K. Rowling",
    isbn: null,
    year: 1997,
    coverId: 15155833,
    section: "fiction",
    summary: `Harry lives in a cupboard under the stairs until a letter, and then a giant, tells him he is a wizard. At Hogwarts he finds friends, a school that feels like the first place he belongs, and a stone that promises to keep its owner alive.

Rowling builds a world with enough rooms that a reader can move in. The plot is a school story and a mystery about who is hunting that stone. Under the jokes is a plain claim: the family you choose, and the choice to be decent when it is inconvenient, matter more than the talent you were born with.`,
  },
  {
    id: "seed-hobbit",
    title: "The Hobbit",
    authors: "J.R.R. Tolkien",
    isbn: null,
    year: 1937,
    coverId: 14627509,
    section: "fiction",
    summary: `Bilbo Baggins would like to stay in his hole and eat his meals on time. Gandalf and a company of dwarves hire him, rather against his will, as a burglar for a journey toward a dragon and a stolen mountain. Along the way he finds a ring in a dark cave and a kind of courage he did not advertise.

Tolkien tells it as a fireside story, with songs, riddles, and a narrator who enjoys the road. The book is smaller than the war that follows it, and that is its charm. A comfortable person leaves home, is changed by danger and by loyalty, and comes back to find that home is not quite the same size.`,
  },
  {
    id: "seed-little-prince",
    title: "The Little Prince",
    authors: "Antoine de Saint-Exupéry",
    isbn: null,
    year: 1943,
    coverId: 10708272,
    section: "fiction",
    summary: `A pilot crashes in the desert and meets a boy who says he is from a very small asteroid. The prince tells him about a rose he loves, and about the grown-ups he met on other planets, each of them busy with a single foolish task.

Saint-Exupéry wrote a fable that looks simple and is not. The prince's questions make status, hurry, and ownership look strange. The line everyone remembers, that what is essential is invisible, is earned by the rose and by the fox who asks to be tamed. It is a book about attention, and about the grief of loving something that can be lost.`,
  },
  {
    id: "seed-davinci",
    title: "The Da Vinci Code",
    authors: "Dan Brown",
    isbn: null,
    year: 2003,
    coverId: 9255229,
    section: "fiction",
    summary: `A curator is murdered in the Louvre, and a symbolist, Robert Langdon, is pulled into the night with a cryptologist and a trail of clues hidden in paintings. A secret society, a religious order, and a puzzle about the Holy Grail keep the chase moving across Europe.

Brown builds the book as a sequence of locks. Each chapter ends on a door that wants opening. The history is a prop for speed more than a lecture, and the pleasure is the click of the next code. It is a thriller about who gets to tell the old stories, written so that you stay up for one more page.`,
  },
  {
    id: "seed-kite-runner",
    title: "The Kite Runner",
    authors: "Khaled Hosseini",
    isbn: null,
    year: 2003,
    coverId: 14846827,
    section: "fiction",
    summary: `Amir grows up in Kabul with Hassan, the servant's son who is a better friend than Amir manages to be. A day of kite fighting ends in a betrayal Amir does not stop. Years later, after exile, he is asked to come back and repay a debt that never got smaller.

Hosseini writes about loyalty, class, and the long reach of one cowardly hour. The kites are beautiful and the guilt is specific. The book asks whether a wrong done in childhood can be answered later, and it does not pretend the answer is comfortable.`,
  },
  {
    id: "seed-book-thief",
    title: "The Book Thief",
    authors: "Markus Zusak",
    isbn: null,
    year: 2005,
    coverId: 15267110,
    section: "fiction",
    summary: `Death narrates the story of Liesel, a girl sent to live with a foster family in Nazi Germany. She steals books, learns to read in a basement, and watches her street learn what it will ignore. A Jewish man is hidden in that same house, and the books become a way to stay human in a room that has to stay quiet.

Zusak's narrator is tired of war and attentive to small colors. The novel is about words as shelter and as weapon. Liesel's thefts are acts of keeping something the time is trying to burn.`,
  },
  {
    id: "seed-and-then-there-were-none",
    title: "And Then There Were None",
    authors: "Agatha Christie",
    isbn: null,
    year: 1939,
    coverId: 11172296,
    section: "fiction",
    summary: `Ten strangers are invited to an island house. A recording accuses each of them of a death the law never punished. Then the guests begin to die, in the order of a nursery rhyme hanging on the wall, and the island offers no boat back.

Christie strips the mystery down to a closed room and a shrinking number of suspects. There is no detective to explain the room away. The pleasure is the fairness of the trap and the chill of realizing the pattern was in front of everyone, including the reader.`,
  },
  {
    id: "seed-hunger-games",
    title: "The Hunger Games",
    authors: "Suzanne Collins",
    isbn: null,
    year: 2008,
    coverId: 12646537,
    section: "fiction",
    summary: `In Panem, the Capitol keeps the districts obedient by making their children kill each other on television. Katniss Everdeen volunteers when her sister's name is drawn. The arena is a designed wilderness, and survival depends on skill, sponsors, and how the audience feels about you.

Collins writes a fast story about spectacle. The romance is tangled with strategy, because affection is also a performance the cameras reward. Under the action is a clear question about what a person will do to stay alive when the watching crowd is part of the weapon.`,
  },
  {
    id: "seed-animal-farm",
    title: "Animal Farm",
    authors: "George Orwell",
    isbn: null,
    year: 1945,
    coverId: 11261770,
    section: "fiction",
    summary: `The animals of Manor Farm drive out their farmer and write a short set of commandments for a fairer life. The pigs, who can read, take charge of the rules. Slowly the commandments change, the work gets heavier, and the new leaders start to look like the old ones.

Orwell's fable is short enough to read in a sitting and plain enough that the substitutions are obvious. It is about how a revolution is captured by the people who control the language. The last scene, where the other animals can no longer tell pig from man, is the whole argument in one look through a window.`,
  },
  {
    id: "seed-atomic-habits",
    title: "Atomic Habits",
    authors: "James Clear",
    isbn: null,
    year: 2018,
    coverId: 12539702,
    section: "nonfiction",
    summary: `Clear argues that a life changes less by a burst of motivation than by a small habit repeated until it is ordinary. He talks about cues, craving, response, and reward, and about designing a room so the better action is the easy one. Identity sits under the tactic: you become the kind of person who does the thing, not the person waiting to feel ready.

The book is practical and repetitive in a useful way. It collects examples of tiny gains that compound, and of systems that beat goals shouted once on New Year's. It is a manual for making a good action so small that you stop negotiating with it.`,
  },
  {
    id: "seed-educated",
    title: "Educated",
    authors: "Tara Westover",
    isbn: null,
    year: 2018,
    coverId: 8314077,
    section: "nonfiction",
    summary: `Westover grows up in a survivalist family in Idaho, kept out of school and taught that hospitals, the government, and most books are a threat. She begins to study in secret, then finds herself at Cambridge and Harvard, translating a childhood that the people who lived it do not agree about.

The memoir is about education as a way of getting a second set of words for your own life. It is also about the pain of leaving a family that loves you and harms you. Westover does not tidy the contradictions. Memory stays contested, and the cost of believing your own mind is part of the story.`,
  },
  {
    id: "seed-becoming",
    title: "Becoming",
    authors: "Michelle Obama",
    isbn: null,
    year: 2018,
    coverId: 8824664,
    section: "nonfiction",
    summary: `Obama tells her life from the South Side of Chicago through Princeton, a law office, and the years she spent as the first Black first lady of the United States. The public rooms are here, and so are the private calculations about marriage, work, and raising daughters inside a house that is never only yours.

The book is a memoir of ambition that keeps asking what the ambition is for. She writes about being watched, misread, and determined to stay a person rather than a symbol. The title is a claim that a life is still being made, even after the most photographed chapter of it.`,
  },
  {
    id: "seed-seven-habits",
    title: "The 7 Habits of Highly Effective People",
    authors: "Stephen R. Covey",
    isbn: null,
    year: 1989,
    coverId: 10079937,
    section: "nonfiction",
    summary: `Covey sorts a working life into habits that start with the self and move outward: take responsibility, begin with an end in mind, put first things first, think in terms of mutual gain, listen before you answer, cooperate, and keep the instrument sharp. The frame is character rather than a list of tricks.

The book has the voice of a seminar and the structure of a course. Its lasting idea is that private discipline and public trust are the same project. Effectiveness, in his telling, is not a performance. It is what is left when your schedule and your principles have to share a week.`,
  },
  {
    id: "seed-win-friends",
    title: "How to Win Friends and Influence People",
    authors: "Dale Carnegie",
    isbn: null,
    year: 1936,
    coverId: 13314878,
    section: "nonfiction",
    summary: `Carnegie wrote a handbook for getting along with people without bullying them. Remember names. Let the other person talk. Admit when you are wrong quickly. Give praise that is specific. Avoid the argument you could win and still lose the relationship.

The advice is old and, read plainly, still practical. It can be used as manners or as manipulation, and Carnegie does not always draw that line. The useful core is attention. Most people are waiting to be taken seriously, and a conversation changes when you stop rehearsing your reply.`,
  },
  {
    id: "seed-brief-history",
    title: "A Brief History of Time",
    authors: "Stephen Hawking",
    isbn: null,
    year: 1988,
    coverId: 10432365,
    section: "nonfiction",
    summary: `Hawking sets out to explain the universe without the equations that usually keep the rest of us out. He moves from the expanding cosmos to black holes, the direction of time, and the hope of a theory that would describe everything with one set of laws.

The book is famous for being bought more often than finished, and the difficulty is honest. Hawking writes with dry jokes and a refusal to pretend the questions are small. What stays with a general reader is the scale: a universe with a beginning, places where light cannot leave, and a mind trying to say how that can be.`,
  },
  {
    id: "seed-power-of-habit",
    title: "The Power of Habit",
    authors: "Charles Duhigg",
    isbn: null,
    year: 2012,
    coverId: 9078085,
    section: "nonfiction",
    summary: `Duhigg looks at habits as loops of cue, routine, and reward, in people and in companies. He follows a woman rebuilding her life one meeting at a time, a football coach changing a locker room, and firms that learned which small pattern moves a customer's day.

The reporting is the point. He is less interested in a slogan than in how a loop gets built and how it can be redirected. Change the routine and keep the cue and the reward, he argues, and a habit can be rewritten without waiting for a new personality to arrive.`,
  },
  {
    id: "seed-guns-germs",
    title: "Guns, Germs, and Steel",
    authors: "Jared Diamond",
    isbn: null,
    year: 1997,
    coverId: 7884018,
    section: "nonfiction",
    summary: `Diamond asks why history unfolded so unevenly across continents, and he refuses the answer that some peoples were simply more inventive. He points to geography: which plants and animals could be domesticated, which direction a continent runs, and how germs traveled with conquest.

The book is a long argument that environment shaped the tools societies had, including guns and steel and the diseases that did so much of the invading. Readers still argue with pieces of it. The force of the book is the question it insists on: look at the map and the farm before you look for a myth about superiority.`,
  },
  {
    id: "seed-thinking-fast",
    title: "Thinking, Fast and Slow",
    authors: "Daniel Kahneman",
    isbn: null,
    year: 2011,
    coverId: 13290711,
    section: "psychology",
    summary: `Kahneman describes two styles of thinking. One is fast, automatic, and confident. The other is slow, effortful, and usually late to the scene. Decades of experiments, many with Amos Tversky, show how the fast system jumps to stories, anchors on the wrong number, and feels certain while it is wrong.

The book is a tour of bias with the scientist still in the room. It is long because the examples are the evidence. The practical effect of reading it is a little humility. You start to notice when a judgment arrived before you did any thinking at all.`,
  },
  {
    id: "seed-body-keeps",
    title: "The Body Keeps the Score",
    authors: "Bessel van der Kolk",
    isbn: null,
    year: 2014,
    coverId: 8315367,
    section: "psychology",
    summary: `Van der Kolk writes as a psychiatrist who spent his career with people whose trauma did not stay in the past. The body kept the score in panic, numbness, illness, and a nervous system that still treated ordinary life as a threat. He explains why talk alone sometimes cannot reach a wound that was stored as sensation.

The book surveys treatments that work with the body as well as the story, from therapy to yoga to carefully used medication. It is compassionate and detailed. Its central claim is that recovery has to include the body that survived, not only the narrative told about it afterward.`,
  },
  {
    id: "seed-influence",
    title: "Influence",
    authors: "Robert B. Cialdini",
    isbn: null,
    year: 1984,
    coverId: 431011,
    section: "psychology",
    summary: `Cialdini studied the people whose job is to get a yes: salespeople, fundraisers, recruiters. He sorts their tactics into a handful of levers, including reciprocity, commitment, social proof, liking, authority, and scarcity. Each one works because it is usually a reasonable shortcut.

The book is a field guide to being persuaded. The examples are concrete enough that you start to see the same levers in ordinary requests. Cialdini's aim is defense as much as description. Once you can name the pull, you can decide whether the yes is actually yours.`,
  },
  {
    id: "seed-flow",
    title: "Flow",
    authors: "Mihaly Csikszentmihalyi",
    isbn: null,
    year: 1990,
    coverId: 11041932,
    section: "psychology",
    summary: `Csikszentmihalyi asked people when they felt most alive, and the answers clustered around a state he called flow. Attention is fully used. The challenge is just ahead of your skill. Time goes strange, and the self-conscious chatter quiets because the task is using all of you.

The research ranges from artists to surgeons to people doing ordinary work with unusual attention. The book argues that happiness is less a mood you catch than a condition you enter when your abilities and a hard task meet. It is a psychology of absorption, and a case for building days that can hold it.`,
  },
  {
    id: "seed-mindset",
    title: "Mindset",
    authors: "Carol S. Dweck",
    isbn: null,
    year: 2006,
    coverId: 746414,
    section: "psychology",
    summary: `Dweck contrasts a fixed view of ability with a growth view. In the first, talent is a verdict and effort is a confession that you lack it. In the second, effort is how ability gets built, and a failure is information. Her studies with students show how praise can push a child toward one view or the other.

The book is careful about a idea that later got flattened into a poster. Dweck does not say that belief alone replaces practice or that circumstances are irrelevant. She says the story you tell about a setback changes whether you stay in the work. That story can be revised.`,
  },
  {
    id: "seed-emotional-intelligence",
    title: "Emotional Intelligence",
    authors: "Daniel Goleman",
    isbn: null,
    year: 1995,
    coverId: 1359485,
    section: "psychology",
    summary: `Goleman makes the case that a high score on a reasoning test is a thin description of a capable person. He writes about knowing what you feel, managing it, noticing other people, and keeping a relationship intact under pressure. The brain science of the 1990s is the scaffolding. The examples are classrooms, marriages, and workplaces.

The book helped move a private skill into public conversation. Some of the claims traveled farther than the studies, and later editions have had to live with that. What remains useful is the attention it gives to the moment before a reaction, which is where a lot of a life is decided.`,
  },
  {
    id: "seed-predictably-irrational",
    title: "Predictably Irrational",
    authors: "Dan Ariely",
    isbn: null,
    year: 2008,
    coverId: 2314080,
    section: "psychology",
    summary: `Ariely runs experiments on the odd, repeatable ways people choose. We overvalue what we already own. We let a decoy price make a worse deal look sensible. We cheat a little when we can still think of ourselves as honest. The irrational part is stable enough to study.

The tone is curious rather than scolding. Each chapter is a setup, a result, and a look at where the same pattern shows up outside the lab. The comfort, such as it is, is that the mistakes are not only yours. They are features of a mind that takes shortcuts, and some of those shortcuts can be redesigned.`,
  },
  {
    id: "seed-grit",
    title: "Grit",
    authors: "Angela Duckworth",
    isbn: null,
    year: 2016,
    coverId: 7438753,
    section: "psychology",
    summary: `Duckworth studies people who stay with a hard aim for a long time. She calls the mix grit: passion held steadily, plus perseverance when the work is dull or humiliating. Talent matters, she says, and it is not the thing that separates the people who continue.

The book draws on cadets, spelling-bee contestants, and her own research on effort. It can be misread as a demand to endure anything. Duckworth's finer point is about chosen, sustained interest, and about practice that is deliberate rather than merely long. Quitting a bad fit is not the enemy. Quitting the thing you meant is the question.`,
  },
  {
    id: "seed-drive",
    title: "Drive",
    authors: "Daniel H. Pink",
    isbn: null,
    year: 2009,
    coverId: 6404786,
    section: "psychology",
    summary: `Pink argues that carrots and sticks work for simple, mechanical tasks and often spoil the ones that need judgment. For that second kind of work he points to three fuels: autonomy, the chance to get better, and a purpose that is not only the bonus. The science he gathers is about intrinsic motivation.

The book is written for offices and schools that still manage people as if a bigger reward always produces better thinking. Pink is a clear synthesizer. His claim is that once money is fair enough to leave the table, the quality of the work depends on whether the person doing it has a say, a craft, and a reason.`,
  },
  {
    id: "seed-quiet",
    title: "Quiet",
    authors: "Susan Cain",
    isbn: null,
    year: 2012,
    coverId: 7079753,
    section: "psychology",
    summary: `Cain writes about introversion in a culture that treats the open office and the loud idea as the default. She traces how a preference for quieter stimulation shows up in childhood, in work, and in who gets mistaken for a leader. The book is part science, part cultural history, and part defense of a temperament.

It is not an argument that solitude is morally better. It is an argument that a room designed only for the most talkative people loses the thinking that happens offstage. Cain asks schools and companies to make space for depth, and she gives quieter readers a more accurate name for themselves.`,
  },
  {
    id: "seed-road-less-traveled",
    title: "The Road Less Traveled",
    authors: "M. Scott Peck",
    isbn: null,
    year: 1978,
    coverId: 4434829,
    section: "psychology",
    summary: `Peck opens with a line that life is difficult, and then treats that fact as the start of mental health rather than a complaint. Drawing on his work as a psychiatrist, he writes about discipline, love, and grace, and about the ways people avoid the legitimate suffering that growth requires.

The book moves between case stories and a spiritual vocabulary that will not fit every reader. Its practical spine is the refusal to confuse love with feeling, or growth with comfort. Peck's patients get better, when they do, by telling the truth and by staying with a hard responsibility instead of routing around it.`,
  },
  {
    id: "seed-republic",
    title: "The Republic",
    authors: "Plato",
    isbn: null,
    year: null,
    coverId: 12828820,
    section: "philosophy",
    summary: `Socrates and his companions ask what justice is, and the question grows until it becomes a design for a whole city and a whole soul. Plato stages the argument as a long conversation: about education, about who should rule, about the stories a city tells its children, and about a cave where people mistake shadows for the world.

The dialogue is not a manual you apply on Monday. It is a pressure test for definitions. Every easy answer about justice gets examined until it breaks or holds. What lasts is the method, and the picture of a person trying to turn from appearance toward what is actually there.`,
  },
  {
    id: "seed-ethics",
    title: "Nicomachean Ethics",
    authors: "Aristotle",
    isbn: null,
    year: null,
    coverId: 12593945,
    section: "philosophy",
    summary: `Aristotle asks what a human life is for, and he answers with a kind of activity: living reasonably, in accordance with virtue, over a whole life, with enough good fortune to let that life be practiced. Virtue, for him, is a habit of choosing the mean between excess and defect, learned the way a craft is learned.

The lectures are precise and sometimes dry, and they are about ordinary conduct: courage, friendship, pleasure, responsibility for what you did not quite mean. Friendship gets some of the warmest pages. Aristotle thinks a good life is not a private glow. It is a pattern of action you can keep, among people, until the end.`,
  },
  {
    id: "seed-art-of-war",
    title: "The Art of War",
    authors: "Sun Tzu",
    isbn: null,
    year: null,
    coverId: 4849549,
    section: "philosophy",
    summary: `This short classical text treats conflict as something to be understood before it is fought. Know the ground. Know the other side. Know yourself. The preferred victory is the one that arrives before the costly battle, by preparation, deception, and a clear sense of when not to move.

Read as philosophy rather than as a slogan book, it is about attention and restraint. Force is expensive. Information and timing are the real advantages. The lines are brief enough to be misused, and sharp enough to repay a slow reading. A fight you can avoid is already a kind of skill.`,
  },
  {
    id: "seed-tao",
    title: "Tao Te Ching",
    authors: "Lao Tzu",
    isbn: null,
    year: null,
    coverId: 662232,
    section: "philosophy",
    summary: `Eighty-one brief chapters circle a way that cannot be pinned to a name. The Tao Te Ching praises water, valleys, and the usefulness of what is empty: the hub of a wheel, the space inside a cup. Ruling, if it happens, should be light. Forcing a thing is how you lose it.

The text contradicts itself in the way a poem does, and translations disagree because the Chinese is compressed. What comes through is a suspicion of display and a trust in yielding. It is a book you reread in pieces. A line that seemed soft on Monday can be the hardest advice in the room by Friday.`,
  },
  {
    id: "seed-letters-stoic",
    title: "Letters from a Stoic",
    authors: "Seneca",
    isbn: null,
    year: null,
    coverId: 103759,
    section: "philosophy",
    summary: `Seneca writes to his friend Lucilius about how to live while time is visibly leaving. The letters take up grief, crowds, poverty, luxury, and the habit of postponing your own life. He is a wealthy man telling the truth about wealth's inability to keep anyone safe, and he knows the awkwardness of that position.

The form is the gift. Advice arrives as correspondence, specific and repeatable. Seneca's stoicism is not a blank face. It is practice: rehearse loss, use the day you have, refuse to be owned by what can be taken. The letters still sound like someone talking to one person, which is why they carry.`,
  },
  {
    id: "seed-sisyphus",
    title: "The Myth of Sisyphus",
    authors: "Albert Camus",
    isbn: null,
    year: 1942,
    coverId: 12726570,
    section: "philosophy",
    summary: `Camus starts from a blunt question: if life has no given meaning, why not suicide? He calls the gap between our hunger for sense and the world's silence the absurd. His answer is not a hidden purpose. It is to live without lying about the gap, and to keep going with your eyes open.

Sisyphus, condemned to push a stone up a hill forever, becomes his image of that life. The essay says we must imagine him happy, not because the task got easier, but because it is his, and he knows it. The book is a defense of lucidity, revolt, and the days you still get to spend.`,
  },
  {
    id: "seed-the-prince",
    title: "The Prince",
    authors: "Niccolò Machiavelli",
    isbn: null,
    year: 1532,
    coverId: 12726168,
    section: "philosophy",
    summary: `Machiavelli writes to a ruler about getting power and keeping it. He looks at what actually works, including cruelty used once, mercy that invites chaos, and the appearance of virtue when the reality would be fatal. Fortune is a river. The prepared prince has built the embankments before the flood.

The book shocked readers because it separated political success from moral comfort. It is short, concrete, and still quoted by people who have not sat with its colder pages. Read slowly, it is less a permit for villainy than a description of what power does when survival is the only rule in the room.`,
  },
  {
    id: "seed-walden",
    title: "Walden",
    authors: "Henry David Thoreau",
    isbn: null,
    year: 1854,
    coverId: 11248037,
    section: "philosophy",
    summary: `Thoreau spent two years in a cabin by Walden Pond and wrote a book about how much a life actually needs. He counts the cost of his boards and nails, watches the ice and the seasons, and scolds his neighbors for lives mortgaged to things they do not have time to enjoy.

The experiment was never a disappearance. He walked into town. The book is an argument for deliberate living, sometimes cranky, often beautiful in its looking. Its famous counsel, to simplify, is backed by pages of attention to a particular pond. The point is not the cabin. It is the decision to notice the life you are spending.`,
  },
  {
    id: "seed-sophies-world",
    title: "Sophie's World",
    authors: "Jostein Gaarder",
    isbn: null,
    year: 1991,
    coverId: 10563354,
    section: "philosophy",
    summary: `Sophie Amundsen starts receiving letters that teach her the history of philosophy, from the first Greek questions to the modern ones. The course is also a mystery. Someone is watching the lessons, and the world Sophie lives in may not be as solid as a kitchen table.

Gaarder uses a story to carry ideas that usually arrive as a syllabus. The plot's trick asks the same question the philosophers do: what is real, and how would you know? It is a novel for a reader who wants the big arguments with a reason to turn the page.`,
  },
  {
    id: "seed-beyond-good",
    title: "Beyond Good and Evil",
    authors: "Friedrich Nietzsche",
    isbn: null,
    year: 1886,
    coverId: 14444933,
    section: "philosophy",
    summary: `Nietzsche attacks the assumption that our moral words are neutral. He asks who made them, what kind of life they protect, and what they refuse. The book moves in aphorisms and arguments about truth, prejudice, religion, and the sort of person a philosophy secretly hopes to produce.

It is not a system you summarize into a rule. It is a set of cuts. Nietzsche wants readers suspicious of their own virtue, including the virtue of being suspicious. The prose is fast and proud. What you take from it, if you stay, is a harder look at the values you thought you had simply found.`,
  },
  {
    id: "seed-consolation",
    title: "The Consolation of Philosophy",
    authors: "Boethius",
    isbn: null,
    year: null,
    coverId: 8915879,
    section: "philosophy",
    summary: `Boethius wrote this in prison, waiting to be executed, after a career at the height of power. Philosophy visits him as a woman and argues him out of his grief. Fortune's wheel was never a promise. Wealth, office, and fame were always on loan. The steadier good is inside a mind that can still reason.

The book alternates prose and verse and became a bridge between classical philosophy and medieval Europe. Its consolation is austere. It does not say the sentence will be lifted. It says that what the wheel can take was never the part of you that was free.`,
  },
];
