// src/components/shared/DailyQuote.tsx
// A daily rotating quote about reading, books, and knowledge.
// Changes once per day (based on day-of-year), same quote all day.

const QUOTES = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "So many books, so little time.", author: "Frank Zappa" },
  { text: "One must always be careful of books, and what is inside them, for words have the power to change us.", author: "Cassandra Clare" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "Until I feared I would lose it, I never loved to read. One does not love breathing.", author: "Harper Lee" },
  { text: "I declare after all there is no enjoyment like reading!", author: "Jane Austen" },
  { text: "A book is a dream that you hold in your hands.", author: "Neil Gaiman" },
  { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
  { text: "The world belongs to those who read.", author: "Rick Holland" },
  { text: "Think before you speak. Read before you think.", author: "Fran Lebowitz" },
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "You can never get a cup of tea large enough or a book long enough to suit me.", author: "C.S. Lewis" },
  { text: "It is what you read when you don't have to that determines what you will be when you can't help it.", author: "Oscar Wilde" },
  { text: "Classic — a book which people praise and don't read.", author: "Mark Twain" },
  { text: "The person who deserves most pity is a lonesome one on a rainy day who doesn't know how to read.", author: "Benjamin Franklin" },
  { text: "In the beginning was the Word.", author: "John 1:1" },
  { text: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.", author: "Haruki Murakami" },
  { text: "There is no such thing as a child who hates to read; there are only children who have not found the right book.", author: "Frank Serafini" },
  { text: "We read to know we are not alone.", author: "William Nicholson" },
  { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { text: "One glance at a book and you hear the voice of another person, perhaps someone dead for 1,000 years.", author: "Italo Calvino" },
  { text: "Show me a family of readers, and I will show you the people who move the world.", author: "Napoléon Bonaparte" },
  { text: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },
  { text: "Let's be reasonable and add an eighth day to the week that is devoted exclusively to reading.", author: "Lena Dunham" },
  { text: "I find television very educational. Every time someone turns it on, I go into the other room and read a book.", author: "Groucho Marx" },
  { text: "To read without reflecting is like eating without digesting.", author: "Edmund Burke" },
];

function getDailyQuote() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export function DailyQuote() {
  const { text, author } = getDailyQuote();

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/20 px-8 py-6">
      {/* Decorative large quotation mark */}
      <span
        className="absolute -top-2 left-4 select-none pointer-events-none font-serif text-amber-300/50 dark:text-amber-700/40 leading-none"
        style={{ fontSize: '96px', lineHeight: 1 }}
        aria-hidden
      >
        "
      </span>

      <div className="relative">
        <p className="text-gray-800 dark:text-gray-100 text-base font-medium italic leading-relaxed pr-4">
          {text}
        </p>
        <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-400 tracking-wide">
          — {author}
        </p>
      </div>

      {/* Subtle corner glow */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-amber-200/20 dark:bg-amber-700/10 blur-2xl pointer-events-none" />
    </div>
  );
}
