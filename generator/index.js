/**
 * Generate sectors and zones.
 */
var fantasyNames = require('fantasy-names');
var fs = require('fs');
var htmlMinify = require('html-minifier').minify;
var glob = require('glob');
var Nunjucks = require('nunjucks');
var path = require('path');

const planets = [
  'EARTH',
  'KNOWHERE',
  'VORMIR',
  'ZEN-WHOBERI',
  'TITAN',
  'NIDAVELLIR'
]

var ZONES = {};

// ADDING EASTER EGGS
// ------------------
// Easter eggs or procedural generation properties.
// The key is the name of the property that will become available in the template.
// The value is the chance that a zone will have that property (i.e., 1 out of 40).
// Add a property here, and then in the template, can have an if statement like:
//   {% if myZoneProperty %}
//     <a-entity id="someEasterEgg"></a-entity>
//   {% endif %}
// Then regenerate.
var ZONE_PROPERTIES = {
  'animated-sun': 1 / 20,
  cromulon: 1 / 30,
  dalek: 1 / 40,
  mechagodzilla: 1 / 40,
  'random-color-environment': 1 / 5,
  'shifting-colors': 1 / 8,
  solidsnake: 1 / 50,
  upsidedown: 1 / 30,
  'wayback-machine': 1 / 50
};

var htmlMinifyConfig = {collapse: true, collapseWhitespace: true, conservativeCollapse: true,
                        removeComments: true};
var nunjucks = Nunjucks.configure('src', {noCache: true});
var songs = JSON.parse(fs.readFileSync('./assets/songs.json'));

// Generate from JSON filename.
function generateFromJson (filename) {
  generate(JSON.parse(fs.readFileSync(filename, 'utf-8')));
};
module.exports.generateFromJson = generateFromJson;

// Re-generate if already generated.
if (fs.existsSync('oasis.json')) {
  generateFromJson('oasis.json');
  return;
}

// Generation config.
// var SECTORS = [
//   {environmentType: 'forest'},
//   {environmentType: 'tron'},
//   {environmentType: 'volcano'},
//   {environmentType: 'arches'},
//   {environmentType: 'japan'},
//   {environmentType: 'egypt'},
//   {environmentType: 'contact'},
//   {environmentType: 'goaland'},
//   {environmentType: 'yavapai'},
//   {environmentType: 'goldmine'},
//   {environmentType: 'threetowers'},
//   {environmentType: 'poison'},
//   {environmentType: 'dream'},
//   {environmentType: 'starry'},
//   {environmentType: 'osiris'}
// ];

let SECTORS = [
  {environmentType: 'forest'},
  {environmentType: 'contact'},
  {environmentType: 'volcano'},
  {environmentType: 'arches'},
  {environmentType: 'japan'},
  {environmentType: 'egypt'},
]

/*
 * Data structure for all sectors and zones to generate pages.
 * [
 *   [
 *     [environmentType": "tron", "seed": "12345"}],
 *     [environmentType": "tron", "seed": "54321"}]
 *   ],
 *   [
 *     [environmentType": "volcano", "seed": "abcdef"}],
 *     [environmentType": "volcano", "seed": "fedgto"}]
 *   ]
 * ]
 */
var SECTOR_PAGES = [];
let WORLDS =[];

// Generate sectors.
SECTORS.forEach((sector, sectorIndex) => {
  var i;
  var seed;
  var zone;
  var zoneProperty;

  // Generate zones for the world.
    seed = randomId();
    zone = ZONES[seed] = {
      environment: `preset: ${sector.environmentType}; seed: ${seed}; shadow: true`,
      name: planets[sectorIndex],
      sectorType: sector.environmentType,
      seed: seed,
      song: `https://supermedium.com/oasis-audio/${randomArray(songs)}`,
      url: `../oasis/${seed}.html`,
      zoneProperties: [],
    };

    // Randomly specified zone properties.
    for (zoneProperty in ZONE_PROPERTIES) {
      if (Math.random() > ZONE_PROPERTIES[zoneProperty]) { continue; }
      zone.zoneProperties.push(zoneProperty);
      console.log(`Zone ${seed} has ${zoneProperty}.`);
    }

    WORLDS.push(zone);
  
});

// SECTORS.forEach((sector, sectorIndex) => {
//   var i;
//   var seed;
//   var zone;
//   var zoneProperty;

//   // Generate zones for the sector.
//   SECTOR_PAGES[sectorIndex] = SECTOR_PAGES[sectorIndex] || [];
//   for (i = 0; i < 6; i++) {
//     seed = randomId();
//     zone = ZONES[seed] = {
//       environment: `preset: ${sector.environmentType}; seed: ${seed}; shadow: true`,
//       name: planets[i],
//       sectorType: sector.environmentType,
//       seed: seed,
//       song: `https://supermedium.com/oasis-audio/${randomArray(songs)}`,
//       url: `../oasis/${seed}.html`,
//       zoneProperties: []
//     };

//     // Randomly specified zone properties.
//     for (zoneProperty in ZONE_PROPERTIES) {
//       if (Math.random() > ZONE_PROPERTIES[zoneProperty]) { continue; }
//       zone.zoneProperties.push(zoneProperty);
//       console.log(`Zone ${seed} has ${zoneProperty}.`);
//     }

//     SECTOR_PAGES[sectorIndex].push(zone);
//   }
// });


// Generate links.
// SECTOR_PAGES.forEach(sector => {
//   sector.forEach(zone => {
//     var i;
//     var randomZone;
//     zone.links = [];
//     for (i = 0; i < Math.round(Math.random() * 5) + 2; i++) {
//       // Get random zone.
//       randomZone = Object.assign({}, sector[Math.floor(Math.random() * sector.length)]);

//       if (randomZone.seed === zone.seed) { continue; }

//       delete randomZone.links;
//       zone.links.push({
//         position: randomLinkPosition(),
//         zone: Object.assign({}, randomZone)
//       })
//     }
//   });
// });

// Generate links.
WORLDS.forEach((zone,index) => {
    var randomZone;
    zone.links = [];
    for (let i = 0; i < 6; i++) {
      randomZone = Object.assign({}, WORLDS[i]);

      if (randomZone.seed === zone.seed) { continue; }
      delete randomZone.links;
      zone.links.push({
        question_position: question_position(),
        position: randomLinkPosition(),
        zone: Object.assign({}, randomZone)
      })
    };

});


// Generate home zone.
var HOME_ZONE = {
  IS_HOME: true,
  links: WORLDS.map((cur_zone, i) => {
    var randomZone;
    randomZone = Object.assign({}, cur_zone);
    randomZone.url = randomZone.url.replace('../', '');
    delete randomZone.links;
    return {
      question_position: question_position(),   //{{ 30 + i*3 }} {{ 3 }}  {{ -25  + i*3}} `${30 + i*3} 3 -25`
      position: `${i} 1.6 -5`,
      zone: randomZone
    };
  })
};


// Add goal link to random zone. Walk from the home zone.
// var preGoalZone = ZONES[randomArray(HOME_ZONE.links).zone.seed];
// for (var i = 0; i < 50; i++) {
//   preGoalZone = ZONES[randomArray(preGoalZone.links).zone.seed];
// }
// preGoalZone.links.push({position: randomLinkPosition(), zone: GOAL_ZONE});

// console.log(`Pre-goal: ${preGoalZone.seed}`);
// console.log(`Goal: ${GOAL_ZONE.seed}`);

// Add hints.
SECTOR_PAGES.forEach(sector => {
  var hintZone;
  var i;
  for (i = 0; i < 2; i++) {
    hintZone = randomArray(sector);
    hintZone.hasHint = true;
    console.log(`Added hint to: ${hintZone.seed}. In this sector: ${hintZone.inThisSector}.`);
  }
});

// Compile final data structure.
var DATA = {HOME: HOME_ZONE, SECTORS: WORLDS,};

// Write JSON.
fs.writeFileSync('oasis.json', JSON.stringify(DATA));

// Final step: Generate.
generate(DATA);

function generate (data) {
  var html;
  var template;

  template = fs.readFileSync('./src/index.html', 'utf-8');

  // Write home.
  html = nunjucks.renderString(template, data.HOME);
  html = htmlMinify(html, htmlMinifyConfig);
  fs.writeFileSync(`index.html`, html);

  // Write sectors.
  data.SECTORS.forEach(pageData => {
      html = nunjucks.renderString(template, pageData);
      html = htmlMinify(html, htmlMinifyConfig);
      fs.writeFileSync(`oasis/${pageData.seed}.html`, html);
  });

  console.log(`Generated ${Object.keys(ZONES).length} zones.`);
}

/**
 * Random string.
 */
function randomId () {
	var i;
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var text = '';
  for (i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

var GROUPS = [
  ['places', 'planets'],
  ['places', 'realms'],
  ['places', 'stars'],
];

function randomArray (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLinkPosition () {
 var x = Math.random() * 30 - 15;
 var z = Math.random() * 30 - 15;
 if (x >= -5 || x <= 5) {
  if (x < 0) { x -= 5; }
  if (x >= 0) { x += 5; }
 }
 if (z >= -5 || z <= 5) {
  if (z < 0) { z -= 5; }
  if (z >= 0) { z += 5; }
 }
 return `${x} 0 ${z}`;
}

 
function question_position () {
  var x = Math.random() * 30 - 15;
  var y = Math.random() * 30 - 15;
  if (x >= -15 || x <= 15) {
   if (x < 0) { x -= 15; }
   if (x >= 0) { x += 15; }
  }
  if (y >= -15 || y <= 15) {
   if (y < 0) { y -= 15; }
   if (y >= 0) { y += 15; }
  }
  return `${x} 3 ${y}`;
 }