const fs=require('fs'),vm=require('vm'),path=require('path');
global.window=global;global.Game={Data:{},Systems:{},UI:{}};
Game.UI.market=function(){};Game.UI.restaurant=function(){};Game.UI.showItem=function(){};Game.UI.giveItemQuantity=function(){};Game.UI.toast=function(){};Game.UI.render=function(){};Game.UI.sheet=function(){};Game.UI.top=function(){};Game.UI.npc=function(){};
function load(p){const f=path.join(__dirname,'..',p);vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:p});}
[
'js/data/items.js','js/data/world.js','js/data/npcs.js','js/data/crops.js','js/data/v24.js','js/data/v25.js','js/data/v261.js','js/data/v263.js','js/data/v278.js',
'js/systems/state.js','js/systems/inventory.js','js/systems/save.js','js/systems/season.js','js/systems/world-events.js','js/systems/farming.js','js/systems/farming-land.js','js/systems/supply.js','js/systems/supply-relation.js','js/systems/supply-entry.js','js/systems/supply-v262.js','js/systems/supply-capacity.js','js/systems/supply-v266.js','js/systems/supply-price-fix.js','js/systems/work.js','js/systems/produce-freshness.js','js/systems/survival.js','js/systems/health.js','js/systems/fish-freshness-market.js','js/systems/pickling.js','js/systems/time.js','js/systems/fishing.js','js/systems/social.js','js/systems/errands.js','js/systems/v24.js','js/systems/v25.js',
'js/ui/v253.js',
'tests/regression.js','tests/time-regression-0275.js','tests/gift-regression.js','tests/supply-regression.js','tests/supply-relation-regression.js','tests/supply-entry-regression.js','tests/produce-regression.js','tests/survival-regression.js','tests/v278-regression.js'
].forEach(load);
Game.state=Game.Systems.State.fresh();
const r=Game.Regression.run();
if(!r.ok){console.error('REGRESSION_FAILED');(r.errors||[]).forEach(e=>console.error('- '+e));process.exit(1);}console.log('REGRESSION_OK');