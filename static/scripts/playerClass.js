var playerClassList = [];
playerClassList["-1"] = {name:"Missing",
    icon:missing,//needs to be included after replay.js for this to work
    specId:-1,
    isMelee:false,
    isTank:false,
    isDPS:false,
    color:"#9E9E9E",
    listIndex:-1};

var PlayerClass = function(className, specId, melee, tank, dps, healer, classColor)
{
    this.name = className;
    this.specId = specId;
    this.icon = new Image();
    this.icon.src = "/icons/playerClass/"+className+".png";
    this.isMelee = melee;
    this.isTank = tank;
    this.isDPS = dps;
    this.isHealer = healer;
    this.color = classColor;
    this.listIndex = playerClassList.length;
    playerClassList.push(this);
};

//              name                id          melee   tank    dps     healer  color
new PlayerClass("DeathknightBlood", 250,        true,   true,   false,  false,  "#C41F3B");
new PlayerClass("DeathknightFrost", 251,        true,   false,  true,   false,  "#C41F3B");
new PlayerClass("DeathknightUnholy", 252,       true,   false,  true,   false,  "#C41F3B");
new PlayerClass("DemonhunterHavoc", 577,        true,   false,  true,   false,  "#A330C9");
new PlayerClass("DemonhunterVengeance", 581,    true,   true,   false,  false,  "#A330C9");
new PlayerClass("DruidBalance", 102,            false,  false,  true,   false,  "#FF7D0A");
new PlayerClass("DruidFeral", 103,              true,   false,  true,  false,  "#FF7D0A");
new PlayerClass("DruidGuardian", 104,           true,   true,   false,  false,  "#FF7D0A");
new PlayerClass("DruidRestoration", 105,        false,  false,  false,  true,   "#FF7D0A");
new PlayerClass("HunterBeastmastery", 253,      false,  false,  true,   false,  "#ABD473");
new PlayerClass("HunterMarksman", 254,          false,  false,  true,   false,  "#ABD473");
new PlayerClass("HunterSurvival", 255,          false,  false,  true,   false,  "#ABD473");
new PlayerClass("MageArcane", 62,               false,  false,  true,   false,  "#69CCF0");
new PlayerClass("MageFire", 63,                 false,  false,  true,   false,  "#69CCF0");
new PlayerClass("MageFrost", 64,                false,  false,  true,   false,  "#69CCF0");
new PlayerClass("MonkBrewmaster", 268,          true,   true,   false,  false,  "#00FF96");
new PlayerClass("MonkMistweaver", 270,          true,   false,  false,  true,   "#00FF96");
new PlayerClass("MonkWindwalker", 269,          true,   false,  true,   false,  "#00FF96");
new PlayerClass("PaladinHoly", 65,              false,  false,  false,  true,   "#F58CBA");
new PlayerClass("PaladinProtection", 66,        true,   true,   false,  false,  "#F58CBA");
new PlayerClass("PaladinRetribution", 70,       true,   false,  true,   false,  "#F58CBA");
new PlayerClass("PriestDicipline", 256,         false,  false,  false,  true,   "#FFFFFF");
new PlayerClass("PriestHoly", 257,              false,  false,  false,  true,   "#FFFFFF");
new PlayerClass("PriestShadow", 258,            false,  false,  true,   false,  "#FFFFFF");
new PlayerClass("RogueAssassination", 259,      true,   false,  true,	false,  "#FFF569");
new PlayerClass("RogueOutlaw", 260, 	        true,	false,	true,	false,  "#FFF569");
new PlayerClass("RogueSubtlety", 261,   	    true,	false,	true,	false,  "#FFF569");
new PlayerClass("ShamanElemental", 262, 	    false,	false,	true,	false,  "#0070DE");
new PlayerClass("ShamanEnhancement", 263,       true,	false,	true,	false,  "#0070DE");
new PlayerClass("ShamanRestoration", 264,       false,	false,	false,	true,   "#0070DE");
new PlayerClass("WarlockAffliction", 265,       false,	false,	true,	false,  "#9482C9");
new PlayerClass("WarlockDemonology", 266,       false,	false,	true,	false,  "#9482C9");
new PlayerClass("WarlockDestruction", 267,      false,	false,	true,	false,  "#9482C9");
new PlayerClass("WarriorArms", 71,  	        true,	false,	true,	false,  "#C79C6E");
new PlayerClass("WarriorFury", 72,  	        true,	false,  true,	false,  "#C79C6E");
new PlayerClass("WarriorProtection", 73,        true,	true,	false,	false,  "#C79C6E");