/*
  Around campus: food, coffee, and study spots near both Fordham campuses, plus Vietnamese
  food around the city. Picks come from Fordham News' "Fordham Favorites" guides (spring 2025)
  and The Infatuation's NYC Vietnamese guide, plus Fordham's own libraries.
*/
const FVCN_CAMPUS = {
  areas: [
    {
      id: "rose-hill",
      label: "Rose Hill",
      place: "The Bronx",
      photo: "rose-hill-autumn",
      intro: "Arthur Avenue, the Bronx's Little Italy, is a 10-minute walk from the main gate. Bakeries, delis, and family restaurants that have fed Fordham students for generations."
    },
    {
      id: "lincoln-center",
      label: "Lincoln Center",
      place: "Manhattan",
      photo: "lincoln-center",
      intro: "Between classes in Manhattan: quick lunches in Hell's Kitchen, cafés around Columbus Circle, and the Lincoln Center plaza."
    },
    {
      id: "vietnamese",
      label: "Vietnamese food in NYC",
      place: "Taste of home",
      photo: "pho",
      intro: "When you miss home: phở, bánh mì, and cà phê sữa đá. Most are in Manhattan's Chinatown and the East Village, easy to reach from either campus."
    }
  ],

  // type: food | coffee | market | study
  places: [
    // Rose Hill
    { area: "rose-hill", type: "market", name: "Arthur Avenue Retail Market", address: "2344 Arthur Ave, Bronx", note: "Indoor market with Italian delis, produce, and fresh pasta. The Bronx Beer Hall inside is a group favorite." },
    { area: "rose-hill", type: "food", name: "Zero Otto Nove", address: "2357 Arthur Ave, Bronx", note: "Sorrento-style pizza in a lively room. A go-to for birthdays and end-of-semester dinners." },
    { area: "rose-hill", type: "food", name: "Antonio's Trattoria", address: "2370 Belmont Ave, Bronx", note: "Neighborhood trattoria cooking with local ingredients, including ravioli from Borgatti's down the street." },
    { area: "rose-hill", type: "coffee", name: "DeLillo Pastry Shop", address: "610 E 187th St, Bronx", note: "A family-owned pastry shop for about a century. Coffee and something sweet after dinner." },
    { area: "rose-hill", type: "coffee", name: "Gino's Pastry Shop", address: "580 E 187th St, Bronx", note: "Cannoli and sfogliatelle. Bring some back for a study group." },
    { area: "rose-hill", type: "market", name: "Teitel Brothers", address: "2372 Arthur Ave, Bronx", note: "Classic Italian grocery for olive oil, cheese, and imports, co-owned by a Fordham alumnus." },
    { area: "rose-hill", type: "coffee", name: "Pine Tree Café at NYBG", address: "2900 Southern Blvd, Bronx", note: "Coffee before a walk in the New York Botanical Garden, across the street from campus. Garden admission is free with a Fordham ID." },
    { area: "rose-hill", type: "food", name: "VPho & Pizzeria", address: "2004 Williamsbridge Rd, Bronx", note: "Vietnamese and Italian menus under one roof in Morris Park. The closest phở to Rose Hill." },
    { area: "rose-hill", type: "study", name: "Walsh Family Library", address: "Rose Hill campus", note: "Fordham's main library at Rose Hill, with quiet floors and group study rooms. A good place to meet for a mock interview." },

    // Lincoln Center
    { area: "lincoln-center", type: "coffee", name: "The Independent Cafe", address: "61 W 62nd St (David Rubenstein Atrium)", note: "Reasonably priced sandwiches and coffee across the street, sometimes with free live performances in the atrium." },
    { area: "lincoln-center", type: "coffee", name: "Breads Bakery", address: "1890 Broadway", note: "Fresh breads, pastries, and espresso. The chocolate babka is famous for a reason." },
    { area: "lincoln-center", type: "food", name: "Burrito Box", address: "885 9th Ave", note: "Hole-in-the-wall Tex-Mex that has served the neighborhood for over 20 years, with plenty of vegetarian options." },
    { area: "lincoln-center", type: "food", name: "Kashkaval Gardens", address: "852 9th Ave", note: "Mediterranean small plates for sharing. Start with the four-dip sampler." },
    { area: "lincoln-center", type: "food", name: "Kung Fu Little", address: "811 8th Ave", note: "Soup dumplings, steamed buns, and hand-pulled noodles. Worth the short walk." },
    { area: "lincoln-center", type: "food", name: "Justino's Pizza", address: "881 10th Ave", note: "Reliable slices and a meatball parm hero. Good for feeding a club meeting." },
    { area: "lincoln-center", type: "coffee", name: "Tartinery", address: "10 Columbus Circle, 3rd floor", note: "French café with open-faced sandwiches and pastries, inside the Columbus Circle shops." },
    { area: "lincoln-center", type: "food", name: "Bánh", address: "942 Amsterdam Ave", note: "Upper West Side favorite for BBQ pork bánh mì and phở. A quick ride up the 1 train." },
    { area: "lincoln-center", type: "study", name: "Quinn Library", address: "Lincoln Center campus", note: "The library at the Lincoln Center campus, for quiet study between classes." },

    // Vietnamese food in NYC
    { area: "vietnamese", type: "food", name: "Bánh Mì Saigon Bakery", address: "198 Grand St, Chinatown", note: "Making bánh mì since 1989. Order the #4 with chả lụa." },
    { area: "vietnamese", type: "food", name: "Bánh Mì Cô Út", address: "83 Elizabeth St, Chinatown", note: "One of the last bánh mì under $10 in Chinatown. Cash only." },
    { area: "vietnamese", type: "food", name: "Thái Sơn", address: "89 Baxter St, Chinatown", note: "Big menu of phở and grilled pork, and there's rarely a wait." },
    { area: "vietnamese", type: "coffee", name: "Phê", address: "72 Forsyth St, Chinatown", note: "Strong Vietnamese coffee and bánh mì on baguettes baked in the basement." },
    { area: "vietnamese", type: "food", name: "Mắm", address: "70 Forsyth St, Chinatown", note: "Low-stool, no-compromise northern Vietnamese cooking, with seasonal hot pots." },
    { area: "vietnamese", type: "food", name: "Saigon Social", address: "172 Orchard St, Lower East Side", note: "Seasonal menu with a standout bún chả." },
    { area: "vietnamese", type: "food", name: "Madame Vo", address: "212 E 10th St, East Village", note: "Lively spot for short rib phở. Good for a group celebration." },
    { area: "vietnamese", type: "food", name: "Bánh Anh Em", address: "99 Third Ave, East Village", note: "Fresh noodles, bánh mì baked in batches, and a build-your-own rice roll tower." }
  ],

  types: {
    food: { label: "Food", icon: "bowl" },
    coffee: { label: "Coffee & dessert", icon: "coffee" },
    market: { label: "Markets", icon: "pin" },
    study: { label: "Study spots", icon: "book" }
  },

  gettingAround: [
    { icon: "train", title: "Rose Hill to Midtown", body: "Metro-North from Fordham station to Grand Central takes about 20 minutes. The B and D trains stop at Fordham Road on the Grand Concourse." },
    { icon: "train", title: "Lincoln Center", body: "The 1 train stops at 66th Street, and 59th Street–Columbus Circle has the A, B, C, D, and 1." },
    { icon: "users", title: "Between campuses", body: "The Ram Van shuttle runs between Rose Hill and Lincoln Center. Check Fordham's site for the current schedule." },
    { icon: "heart", title: "Go together", body: "FVCN food nights are the easiest way to try new spots with friends. RSVP in the Events section." }
  ]
};
