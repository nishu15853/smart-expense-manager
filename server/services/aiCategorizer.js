/**
 * Intelligent AI Rule & Keyword Categorizer Engine
 * Maps transaction title, merchant, description, and type to 12 target categories:
 * - Food
 * - Shopping
 * - Transport
 * - Bills
 * - Entertainment
 * - Healthcare
 * - Education
 * - Salary
 * - Investment
 * - Recharge
 * - Transfer
 * - Others
 */

const CATEGORY_PATTERNS = [
  {
    category: "Salary",
    keywords: [
      "salary", "payroll", "stipend", "wages", "remuneration", "employer",
      "monthly salary", "salary credit", "sal credit", "bonus", "pension"
    ],
    typeMatch: "Income"
  },
  {
    category: "Food",
    keywords: [
      "swiggy", "zomato", "mcdonald", "domino", "kfc", "burger", "pizza",
      "restaurant", "cafe", "coffee", "tea", "bakery", "starbucks", "subway",
      "dining", "eatery", "canteen", "dhabha", "haldiram", "chaayos", "eatfit",
      "freshmenu", "food", "kitchen", "swiggy instamart", "blinkit"
    ]
  },
  {
    category: "Shopping",
    keywords: [
      "amazon", "flipkart", "myntra", "ajio", "meesho", "nykaa", "tata cliq",
      "zudio", "dmart", "reliance retail", "supermarket", "mall", "clothing",
      "fashion", "apparel", "trend", "shoppers stop", "westside", "pantaloons",
      "decathlon", "ikea", "lenskart", "croma", "vijay sales", "bata"
    ]
  },
  {
    category: "Transport",
    keywords: [
      "uber", "ola", "rapido", "irctc", "redbus", "abhibus", "metro", "fastag",
      "shell", "hpcl", "bpcl", "iocl", "petrol", "diesel", "fuel", "toll",
      "cab", "taxi", "parking", "auto", "railway", "flight", "indigo", "air india",
      "spicejet", "vistara", "makemytrip", "goibibo", "yatra", "cleartrip"
    ]
  },
  {
    category: "Bills",
    keywords: [
      "electricity", "water", "gas", "broadband", "wifi", "bescom", "tneb",
      "msedcl", "adani electricity", "tata power", "torrent power", "dish tv",
      "dth", "bill payment", "utility", "postpaid", "piped gas", "cesc"
    ]
  },
  {
    category: "Entertainment",
    keywords: [
      "netflix", "spotify", "hotstar", "prime video", "bookmyshow", "pvr",
      "inox", "youtube", "steam", "playstation", "xbox", "gaming", "cinema",
      "movie", "zee5", "sonyliv", "apple music", "gaana", "wynk"
    ]
  },
  {
    category: "Healthcare",
    keywords: [
      "apollo", "pharmeasy", "1mg", "netmeds", "hospital", "pharmacy", "medical",
      "doctor", "clinic", "lab", "diagnostic", "dental", "medicine", "pathology",
      "max healthcare", "fortis", "manipal", "medplus"
    ]
  },
  {
    category: "Education",
    keywords: [
      "udemy", "coursera", "edx", "school", "college", "tuition", "university",
      "exam", "fee", "unacademy", "byju", "coaching", "books", "stationery",
      "skillshare", "academy", "institute"
    ]
  },
  {
    category: "Investment",
    keywords: [
      "zerodha", "groww", "upstox", "angel one", "coin", "mutual fund", "sip",
      "demat", "share", "stock", "smallcase", "nifty", "sensex", "indmoney",
      "kuvera", "etmoney", "fd", "fixed deposit", "ppf", "gold", "crypto",
      "coindcx", "wazirx", "binance"
    ]
  },
  {
    category: "Recharge",
    keywords: [
      "recharge", "mobile recharge", "jio", "airtel", "vi", "vodafone", "bsnl",
      "dth recharge", "prepaid"
    ]
  },
  {
    category: "Transfer",
    keywords: [
      "self transfer", "bank transfer", "neft", "rtgs", "imps", "transfer to",
      "received from", "deposit", "withdrawal", "account transfer"
    ]
  }
];

/**
 * Categorize a single transaction
 * @param {Object} transaction
 * @returns {String} Category name
 */
function categorizeTransaction({ title = "", merchant = "", description = "", type = "Expense" }) {
  const combinedText = `${title} ${merchant} ${description}`.toLowerCase();

  // If transaction type is Income and contains salary keywords or is marked salary
  if (type === "Income") {
    for (const kw of CATEGORY_PATTERNS[0].keywords) {
      if (combinedText.includes(kw)) {
        return "Salary";
      }
    }
  }

  // Iterate over patterns
  for (const item of CATEGORY_PATTERNS) {
    if (item.category === "Salary" && type !== "Income") continue;
    for (const kw of item.keywords) {
      if (combinedText.includes(kw)) {
        return item.category;
      }
    }
  }

  // Fallback default
  return type === "Income" ? "Salary" : "Others";
}

module.exports = {
  categorizeTransaction,
};
