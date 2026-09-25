/**
 * Connection arcs on the world map radiating from the India (Mumbai) hub (1161, 421)
 * to 20 international destination locations across the globe.
 *
 * Coordinates are in the map image's own dimensions (1774 x 887). Every arc starts at
 * the India hub and gracefully curves outward to the respective country.
 */
export const MAP_ARCS: Record<string, string> = {
  australia: "M 1161 421 Q 1379.2 532.5 1499 726",
  japan: "M 1161 421 Q 1311.0 337.5 1461 364",
  taiwan: "M 1161 421 Q 1285.5 392.3 1410 454",
  thailand: "M 1161 421 Q 1253.1 444.9 1309 499",
  china: "M 1161 421 Q 1229.5 374.2 1298 379",
  qatar: "M 1161 421 Q 1084.5 397.4 1008 429",
  egypt: "M 1161 421 Q 1019.5 367.0 878 415",
  morocco: "M 1161 421 Q 904.0 318.4 647 401",
  south_africa: "M 1161 421 Q 941.0 521.1 830 699",
  italy: "M 1161 421 Q 975.0 331.1 789 376",
  france: "M 1161 421 Q 942.0 297.1 723 334",
  germany: "M 1161 421 Q 970.5 283.0 780 290",
  hungary: "M 1161 421 Q 996.5 308.0 832 319",
  denmark: "M 1161 421 Q 969.0 258.1 777 247",
  uk: "M 1161 421 Q 941.5 264.7 722 275",
  ireland: "M 1161 421 Q 925.0 259.6 689 276",
  norway: "M 1161 421 Q 976.0 235.9 791 205",
  sweden: "M 1161 421 Q 986.5 248.0 812 220",
  canada: "M 1161 421 Q 761.5 206.5 362 272",
  brazil: "M 1161 421 Q 674.5 455.5 384 630",
};

